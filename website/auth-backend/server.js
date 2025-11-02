import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Stripe from 'stripe';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import winston from 'winston';

// Charger les variables d'environnement
dotenv.config();

// Debug: Vérifier le chargement des variables PayPal
if (process.env.PAYPAL_CLIENT_ID) {
  console.log('🔍 Debug PayPal: Client ID chargé:', process.env.PAYPAL_CLIENT_ID.substring(0, 20) + '...');
} else {
  console.log('🔍 Debug PayPal: Client ID NON trouvé dans process.env');
}

const app = express();
const PORT = process.env.PORT || 3001;
// Détecter l'environnement : production uniquement si NODE_ENV=production ET qu'on a des origines de prod définies
// En développement local, toujours autoriser localhost
const isProduction = process.env.NODE_ENV === 'production' && 
  process.env.ALLOWED_ORIGINS && 
  !process.env.ALLOWED_ORIGINS.includes('localhost') &&
  !process.env.ALLOWED_ORIGINS.includes('127.0.0.1');

// Validation des variables critiques en production
const JWT_SECRET = process.env.JWT_SECRET;
if (isProduction && (!JWT_SECRET || JWT_SECRET.length < 32)) {
  console.error('❌ ERREUR CRITIQUE: JWT_SECRET doit être défini et faire au moins 32 caractères');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET non défini - utilisation d\'une clé temporaire (tokens seront invalidés au redémarrage)');
}

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
if (isProduction && !RECAPTCHA_SECRET) {
  console.warn('⚠️ RECAPTCHA_SECRET_KEY non configuré - protection anti-bot désactivée');
}
// LICENSE_SERVER_URL pour vérification de licences (optionnel)
// Si non fourni, on peut le construire depuis SUPABASE_URL
const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 
  (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/functions/v1/license` : '');

// Configuration Supabase
// IMPORTANT: Configurez SUPABASE_URL dans votre .env
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Créer les clients Supabase
// Utilise SERVICE_KEY si disponible, sinon ANON_KEY (limité en permissions)
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;

// Middleware CORS - Configuration sécurisée
const getAllowedOrigins = () => {
  if (isProduction) {
    // En production, utiliser les origines autorisées depuis .env
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowed.length === 0) {
      console.error('❌ ERREUR: ALLOWED_ORIGINS doit être défini en production');
      process.exit(1);
    }
    return allowed;
  } else {
    // En développement, autoriser localhost
    return [
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
  }
};

const corsOptions = {
  origin: function (origin, callback) {
    // Pas d'origin = requête same-origin (OK pour certaines requêtes)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Toujours autoriser localhost/127.0.0.1 en développement
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    if (isLocalhost) {
      callback(null, true);
      return;
    }
    
    // Pour les autres origines, vérifier la liste autorisée
    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (isProduction) {
        console.warn(`⚠️ CORS: Origin non autorisé bloqué: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      } else {
        // En développement, autoriser quand même mais logger
        console.warn(`⚠️ CORS (dev): Origin non autorisé mais autorisée: ${origin}`);
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Configuration Winston pour le logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Ajouter la console en développement
if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Headers de sécurité avec Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com", "https://js.stripe.com", "https://www.paypal.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.paypal.com", "https://api.sandbox.paypal.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Appliquer CORS avant tout autre middleware
app.use(cors(corsOptions));

// Gérer explicitement les requêtes OPTIONS (preflight)
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Limiter la taille des requêtes

// Rate Limiting - Protection contre les attaques brute force
// Rate limiting plus permissif en développement
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 50, // 5 en production, 50 en développement
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // En développement local, sauter le rate limiting pour localhost
    if (!isProduction && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('127.0.0.1'))) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    logger.warn('Rate limit atteint', { ip: req.ip, path: req.path });
    res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  }
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requêtes max par minute
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuration Resend - CRITIQUE: Ne jamais hardcoder la clé API
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (isProduction && !RESEND_API_KEY) {
  console.error('❌ ERREUR CRITIQUE: RESEND_API_KEY non configuré dans .env');
  process.exit(1);
}
if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY non défini - l\'envoi d\'emails ne fonctionnera pas');
}
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
// Utiliser le domaine de test Resend si le domaine personnalisé n'est pas vérifié
const EMAIL_FROM_RAW = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const EMAIL_FROM = `Mouse from AppsMobs <${EMAIL_FROM_RAW}>`;

// Configuration Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' }) : null;

// Fonction pour vérifier reCAPTCHA
async function verifyRecaptcha(token) {
  // En développement, autoriser si non configuré
  if (!isProduction) {
    if (!RECAPTCHA_SECRET) {
      console.warn('⚠️ reCAPTCHA désactivé en développement (RECAPTCHA_SECRET_KEY non configuré)');
  return true;
    }
  }
  
  // En production, reCAPTCHA est obligatoire
  if (isProduction && !RECAPTCHA_SECRET) {
    console.error('❌ ERREUR: RECAPTCHA_SECRET_KEY requis en production');
    return false;
  }
  
  if (!token || !RECAPTCHA_SECRET) {
    return false;
  }
  
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: token
        }
      }
    );
    
    return response.data.success === true;
  } catch (error) {
    console.error('Erreur vérification reCAPTCHA:', error);
    return false;
  }
  
  /* Code original commenté
  if (!RECAPTCHA_SECRET) {
    console.warn('⚠️ RECAPTCHA_SECRET_KEY non configuré - mode développement');
    return true;
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: token
        }
      }
    );

    return response.data.success === true;
  } catch (error) {
    console.error('Erreur vérification reCAPTCHA:', error);
    return false;
  }
  */
}

// Fonction pour envoyer l'email de vérification
async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-email?token=${token}`;
  
  console.log(`   📤 Envoi via Resend...`);
  console.log(`   From: ${EMAIL_FROM}`);
  console.log(`   To: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
    to: email,
      subject: 'Welcome! Please verify your email - AppsMobs',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #333333; 
                background-color: #f5f5f5;
              }
              .email-container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 { 
                color: #ffffff; 
                font-size: 28px; 
                font-weight: 600;
                margin-bottom: 10px;
              }
              .header p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
              }
              .content { 
                padding: 40px 30px; 
              }
              .content h2 {
                color: #1a1a1a;
                font-size: 22px;
                margin-bottom: 20px;
                font-weight: 600;
              }
              .content p { 
                color: #555555; 
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.8;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button { 
                display: inline-block; 
                padding: 16px 40px; 
                background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                color: #ffffff; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
                transition: transform 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
              }
              .link-box {
                background-color: #f8f9fa;
                border-left: 4px solid #00D4FF;
                padding: 15px;
                margin: 25px 0;
                border-radius: 4px;
              }
              .link-box p {
                font-size: 14px;
                color: #666666;
                margin-bottom: 8px;
                font-weight: 500;
              }
              .link-box a {
                color: #00D4FF;
                word-break: break-all;
                font-size: 13px;
                text-decoration: none;
              }
              .info-box {
                background-color: #fff4e6;
                border-left: 4px solid #ffa726;
                padding: 15px;
                margin: 25px 0;
                border-radius: 4px;
              }
              .info-box p {
                color: #e65100;
                font-size: 14px;
                margin: 0;
              }
              .footer { 
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
              }
              .footer p { 
                font-size: 13px; 
                color: #6c757d;
                margin-bottom: 8px;
              }
              .footer a {
                color: #00D4FF;
                text-decoration: none;
              }
          </style>
        </head>
        <body>
            <div class="email-container">
              <div class="header">
                <h1>Welcome to AppsMobs! 🎉</h1>
                <p>Thank you for joining us</p>
              </div>
              
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hello,</p>
                <p>We're thrilled to welcome you to the AppsMobs community! To complete your registration and access all our features, please confirm your email address by clicking the button below:</p>
                
                <div class="button-container">
                  <a href="${verificationUrl}" class="button">Verify My Email Address</a>
                </div>
                
                <div class="link-box">
                  <p><strong>Button not working?</strong></p>
                  <p>Copy and paste this link into your browser:</p>
                  <a href="${verificationUrl}">${verificationUrl}</a>
                </div>
                
                <div class="info-box">
                  <p><strong>⏰ Important:</strong> This verification link is valid for <strong>24 hours</strong>. After this period, you'll need to request a new verification link.</p>
                </div>
                
                <p>If you didn't create an account on AppsMobs, you can safely ignore this email.</p>
                
                <p>If you have any questions, our support team is here to help.</p>
                
                <p>Best regards,<br><strong>The AppsMobs Team</strong></p>
              </div>
              
            <div class="footer">
                <p><strong>AppsMobs</strong></p>
                <p>Support Email: <a href="mailto:support@appsmobs.com">support@appsmobs.com</a></p>
                <p style="margin-top: 15px; font-size: 12px;">© ${new Date().getFullYear()} AppsMobs. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
    });

    if (error) {
      console.error('❌ Erreur envoi email Resend:', JSON.stringify(error, null, 2));
      console.error('📧 Détails:', error.message || error);
      
      // Erreur spécifique : domaine de test limité
      if (error.statusCode === 403 && error.message?.includes('testing emails')) {
        console.error('\n⚠️  IMPORTANT : Resend limite les emails de test à votre email vérifié');
        console.error('   📧 Vous pouvez uniquement envoyer à : safelevage@gmail.com (votre email Resend)');
        console.error('   💡 Solutions :');
        console.error('      1. Utilisez safelevage@gmail.com pour tester');
        console.error('      2. OU vérifiez votre domaine appsmobs.com dans Resend');
        console.error('         → Allez sur https://resend.com/domains');
        console.error('         → Ajoutez appsmobs.com et suivez les instructions DNS');
        console.error('         → Changez EMAIL_FROM dans .env vers support@appsmobs.com');
        console.error('');
      }
      
      return false;
    }

    console.log('✅ Email de vérification envoyé avec succès à:', email);
    console.log('📧 Email ID:', data?.id || 'N/A');
    return true;
  } catch (error) {
    console.error('❌ Erreur exception envoi email:', error.message || error);
    console.error('📧 Stack:', error.stack);
    return false;
  }
}

// Fonction pour envoyer la licence par email
async function sendLicenseEmail(email, firstName, lastName, licenseKey, plan, expiresAt) {
  const expiryDate = expiresAt ? new Date(expiresAt * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unlimited';
  const planNames = {
    'normal': 'Normal',
    'pro': 'Pro',
    'team': 'Team'
  };
  const planDescriptions = {
    'normal': 'Access to AppsMobs basic features',
    'pro': 'Access to advanced features and priority support',
    'team': 'Full access with team management and premium features'
  };
  const displayName = `${firstName} ${lastName}`.trim() || 'Dear Customer';
  
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
    to: email,
      subject: `Your AppsMobs ${planNames[plan] || plan} License - ${licenseKey}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #333333; 
                background-color: #f5f5f5;
              }
              .email-container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 { 
                color: #ffffff; 
                font-size: 28px; 
                font-weight: 600;
                margin-bottom: 10px;
              }
              .header p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
              }
              .content { 
                padding: 40px 30px; 
              }
              .content h2 {
                color: #1a1a1a;
                font-size: 22px;
                margin-bottom: 20px;
                font-weight: 600;
              }
              .content p { 
                color: #555555; 
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.8;
              }
              .license-box { 
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #00D4FF; 
                border-radius: 8px; 
                padding: 30px; 
                margin: 30px 0;
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.1);
              }
              .license-key-box {
                background-color: #ffffff;
                border: 2px dashed #00D4FF;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
              }
              .license-key-label {
                font-size: 12px;
                color: #666666;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
                font-weight: 600;
              }
              .license-key { 
                font-size: 24px; 
                font-weight: 700; 
                color: #00D4FF; 
                letter-spacing: 3px; 
                font-family: 'Courier New', monospace;
                word-break: break-all;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 15px;
                margin: 20px 0;
              }
              .info-item {
                padding: 15px;
                background-color: #ffffff;
                border-radius: 6px;
                border-left: 4px solid #00D4FF;
              }
              .info-label { 
                font-weight: 600; 
                color: #666666;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 16px;
                color: #1a1a1a;
                font-weight: 600;
              }
              .steps {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 30px 0;
              }
              .steps h3 {
                color: #1a1a1a;
                font-size: 18px;
                margin-bottom: 20px;
                font-weight: 600;
              }
              .steps ol {
                margin-left: 20px;
              }
              .steps li {
                color: #555555;
                font-size: 15px;
                margin-bottom: 12px;
                line-height: 1.6;
              }
              .steps li strong {
                color: #00D4FF;
              }
              .warning-box {
                background-color: #fff4e6;
                border-left: 4px solid #ffa726;
                padding: 15px;
                margin: 25px 0;
                border-radius: 4px;
              }
              .warning-box p {
                color: #e65100;
                font-size: 14px;
                margin: 0;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button { 
                display: inline-block; 
                padding: 16px 40px; 
                background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                color: #ffffff; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
              }
              .footer { 
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
              }
              .footer p { 
                font-size: 13px; 
                color: #6c757d;
                margin-bottom: 8px;
              }
              .footer a {
                color: #00D4FF;
                text-decoration: none;
              }
          </style>
        </head>
        <body>
            <div class="email-container">
              <div class="header">
                <h1>Your AppsMobs License is Active! 🎉</h1>
                <p>Welcome to the Premium Community</p>
              </div>
              
              <div class="content">
                <h2>Congratulations ${displayName}!</h2>
                <p>Your AppsMobs <strong>${planNames[plan] || plan}</strong> license has been successfully activated and is now linked to your account.</p>
            
            <div class="license-box">
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="info-label">Plan</div>
                      <div class="info-value">${planNames[plan] || plan}</div>
              </div>
                    <div class="info-item">
                      <div class="info-label">Expiration Date</div>
                      <div class="info-value">${expiryDate}</div>
              </div>
                    <div class="info-item">
                      <div class="info-label">Associated Account</div>
                      <div class="info-value">${email}</div>
              </div>
            </div>

                  <div class="license-key-box">
                    <div class="license-key-label">Your License Key</div>
                    <div class="license-key">${licenseKey}</div>
                  </div>
                </div>

                <div class="steps">
                  <h3>📋 How to Use Your License:</h3>
                  <ol>
                    <li><strong>Sign in</strong> to your account at <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #00D4FF;">${process.env.FRONTEND_URL || 'http://localhost:5173'}</a></li>
                    <li>Your license is <strong>automatically linked</strong> to your account (${email})</li>
                    <li>Enjoy <strong>all features</strong> of your ${planNames[plan] || plan} plan right away</li>
                    <li>Check out our documentation to discover all possibilities offered by your plan</li>
            </ol>
                </div>

                <p><strong>Included Features:</strong></p>
                <p style="color: #666666; font-size: 15px;">${planDescriptions[plan] || 'Full access to all AppsMobs features'}</p>

                <div class="warning-box">
                  <p><strong>🔒 Important:</strong> Keep this license key secure. Never share it. You'll need it for certain administrative operations or in case of technical issues.</p>
                </div>

                <div class="button-container">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Access My Account</a>
                </div>

                <p>If you have any questions or issues, our support team is here to help.</p>
                
                <p>Best regards,<br><strong>The AppsMobs Team</strong></p>
              </div>

            <div class="footer">
                <p><strong>AppsMobs</strong></p>
                <p>Support Email: <a href="mailto:support@appsmobs.com">support@appsmobs.com</a></p>
                <p style="margin-top: 15px; font-size: 12px;">© ${new Date().getFullYear()} AppsMobs. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
    });

    if (error) {
      console.error('❌ Erreur envoi email licence Resend:', JSON.stringify(error, null, 2));
      console.error('📧 Détails:', error.message || error);
      return false;
    }

    console.log('✅ Email de licence envoyé avec succès à:', email);
    console.log('📧 Email ID:', data?.id || 'N/A');
    return true;
  } catch (error) {
    console.error('❌ Erreur exception envoi email licence:', error.message || error);
    console.error('📧 Stack:', error.stack);
    return false;
  }
}

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

// Fonction pour vérifier une licence dans Supabase
async function verifyLicense(email, key) {
  if (!LICENSE_SERVER_URL) {
    console.warn('⚠️ LICENSE_SERVER_URL non configuré');
    return null;
  }

  try {
    const headers = {};
    if (supabaseAnonKey) {
      headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
      headers['apikey'] = supabaseAnonKey;
    }
    headers['Content-Type'] = 'application/json';

    const response = await axios.post(
      `${LICENSE_SERVER_URL}/verify`,
      { email, key },
      { headers, timeout: 10000 }
    );

    if (response.data && response.data.ok) {
      return {
        valid: true,
        plan: response.data.plan,
        token: response.data.token,
        expires_at: response.data.expires_at
      };
    }

    return {
      valid: false,
      message: response.data?.message || 'Licence invalide'
    };
  } catch (error) {
    console.error('Erreur vérification licence:', error);
    return {
      valid: false,
      message: 'Erreur de connexion au serveur de licence'
    };
  }
}

// Routes

// Route de test pour vérifier la connexion
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend fonctionne !', 
    timestamp: new Date().toISOString(),
    cors: 'OK'
  });
});

// Inscription
app.post('/api/register', authLimiter, 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    body('country').notEmpty().withMessage('Le pays est requis'),
    // reCAPTCHA requis seulement si configuré en production
    ...(isProduction && RECAPTCHA_SECRET ? [body('recaptchaToken').notEmpty().withMessage('Token reCAPTCHA requis')] : [])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, country, recaptchaToken } = req.body;

      // Vérifier reCAPTCHA UNIQUEMENT en production ET si configuré
      // En développement local, on ignore reCAPTCHA car les clés sont liées au domaine de production
      if (isProduction && RECAPTCHA_SECRET) {
        const recaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!recaptchaValid) {
          return res.status(400).json({ error: 'Vérification reCAPTCHA échouée' });
        }
      } else if (!isProduction && RECAPTCHA_SECRET) {
        // En développement, ignorer reCAPTCHA même si configuré (clés liées au domaine de prod)
        console.log('⚠️ reCAPTCHA ignoré en développement (clés configurées pour production)');
      }

      // Vérifier si l'email existe déjà dans la table users
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà enregistré' });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Générer token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = Date.now() + (24 * 60 * 60 * 1000); // 24 heures

      // Créer l'utilisateur dans Supabase
      const { data: newUser, error: userError } = await supabaseClient
        .from('users')
        .insert({
          email,
          password: hashedPassword,
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires,
          email_verified: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error('Erreur création utilisateur:', userError);
        return res.status(500).json({ error: 'Erreur lors de la création du compte' });
      }

      // Créer le profil dans la table profiles
      if (firstName || lastName || country) {
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .upsert({
            email,
            first_name: firstName || null,
            last_name: lastName || null,
            country: country || null,
            updated_at: Math.floor(Date.now() / 1000)
          }, {
            onConflict: 'email'
          });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          // On continue même si le profil n'a pas pu être créé
        }
      }

      // Envoyer l'email de vérification
      console.log(`\n📧 Tentative d'envoi d'email de vérification à: ${email}`);
      console.log(`   Token: ${verificationToken.substring(0, 10)}...`);
      const emailSent = await sendVerificationEmail(email, verificationToken);
      if (!emailSent) {
        console.error('⚠️ Impossible d\'envoyer l\'email de vérification');
        console.error('💡 Vérifiez:');
        console.error('   1. Que RESEND_API_KEY est correct dans .env');
        console.error('   2. Que le domaine est vérifié dans Resend (ou utilisez onboarding@resend.dev)');
        console.error('   3. Les logs Resend ci-dessus pour plus de détails');
      } else {
        console.log(`✅ Email de vérification envoyé avec succès à ${email}`);
        console.log(`💡 L'email devrait arriver dans quelques secondes. Vérifiez aussi le dossier spam.\n`);
      }

      res.status(201).json({ 
        message: 'Compte créé avec succès. Veuillez vérifier votre email.',
        emailSent
      });
    } catch (error) {
      console.error('Erreur inscription:', error);
      res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
  }
);

// Connexion
app.post('/api/login', authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    // reCAPTCHA requis seulement si configuré en production
    ...(isProduction && RECAPTCHA_SECRET ? [body('recaptchaToken').notEmpty().withMessage('Token reCAPTCHA requis')] : [])
  ],
  async (req, res) => {
    try {
      // Logger les données reçues en développement
      if (!isProduction) {
        console.log('📥 Requête login reçue:', {
          email: req.body.email,
          password: req.body.password ? '***' : 'MANQUANT',
          recaptchaToken: req.body.recaptchaToken ? 'OUI' : 'NON',
          bodyKeys: Object.keys(req.body)
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // En développement, logger les erreurs pour debugging
        if (!isProduction) {
          console.log('❌ Erreurs validation login:', errors.array());
          console.log('📧 Email reçu:', req.body.email, 'Type:', typeof req.body.email);
          console.log('🔑 Password reçu:', req.body.password ? '***' : 'MANQUANT', 'Type:', typeof req.body.password);
          console.log('🤖 reCAPTCHA reçu:', req.body.recaptchaToken ? 'OUI' : 'NON');
        }
        return res.status(400).json({ 
          error: 'Données invalides',
          errors: errors.array(),
          // En développement, afficher plus de détails
          ...(isProduction ? {} : { debug: 'Vérifiez la console du serveur pour plus de détails' })
        });
      }

      const { email, password, recaptchaToken } = req.body;

      // Vérifier reCAPTCHA UNIQUEMENT en production ET si configuré
      // En développement local, on ignore reCAPTCHA car les clés sont liées au domaine de production
      if (isProduction && RECAPTCHA_SECRET) {
        const recaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!recaptchaValid) {
          return res.status(400).json({ error: 'Vérification reCAPTCHA échouée' });
        }
      } else if (!isProduction && RECAPTCHA_SECRET) {
        // En développement, ignorer reCAPTCHA même si configuré (clés liées au domaine de prod)
        console.log('⚠️ reCAPTCHA ignoré en développement (clés configurées pour production)');
      }

      // Trouver l'utilisateur dans Supabase
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Vérifier le mot de passe
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Vérifier si l'email est vérifié
      if (!user.email_verified) {
        return res.status(403).json({ 
          error: 'Veuillez vérifier votre email avant de vous connecter',
          needsVerification: true
        });
      }

      // Vérifier la licence dans Supabase
      let licenseInfo = null;
      if (LICENSE_SERVER_URL) {
        // Chercher une licence pour cet email
        const { data: licenses } = await supabaseClient
          .from('licenses')
          .select('email, key, plan, expires_at')
          .eq('email', email)
          .limit(1);

        if (licenses && licenses.length > 0) {
          const license = licenses[0];
          const licenseCheck = await verifyLicense(email, license.key);
          if (licenseCheck && licenseCheck.valid) {
            licenseInfo = {
              plan: licenseCheck.plan,
              token: licenseCheck.token,
              expires_at: licenseCheck.expires_at
            };
          }
        }
      }

      // Mettre à jour last_login
      await supabaseClient
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Générer JWT avec les informations de licence
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          licensePlan: licenseInfo?.plan || null,
          licenseToken: licenseInfo?.token || null
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          license: licenseInfo
        }
      });
    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  }
);

// Vérification de l'email
app.post('/api/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token manquant' });
    }

    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .gt('verification_token_expires', Date.now())
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email déjà vérifié' });
    }

    // Marquer l'email comme vérifié
    await supabaseClient
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null
      })
      .eq('id', user.id);

    res.json({ message: 'Email vérifié avec succès' });
  } catch (error) {
    console.error('Erreur vérification email:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// Renvoyer l'email de vérification
app.post('/api/resend-verification',
  [
    body('email').isEmail().normalizeEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      console.log(`\n📧 Demande de renvoi d'email pour: ${email}`);
      console.log(`   Supabase URL: ${supabaseUrl || 'NON CONFIGURÉ'}`);
      console.log(`   Utilise SERVICE_KEY: ${supabaseServiceKey ? 'Oui' : 'Non (ANON_KEY)'}`);

      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('   ❌ Erreur Supabase:', userError);
        console.error('   Code:', userError.code);
        console.error('   Message:', userError.message);
        console.error('   Details:', userError.details);
        return res.status(404).json({ error: 'Utilisateur non trouvé', details: userError.message });
      }

      if (!user) {
        console.error('   ❌ Utilisateur non trouvé (pas d\'erreur mais pas de données)');
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      console.log(`   ✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})`);

      if (user.email_verified) {
        console.log('   ⚠️ Email déjà vérifié');
        return res.status(400).json({ error: 'Email déjà vérifié' });
      }

      // Générer nouveau token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = Date.now() + (24 * 60 * 60 * 1000);

      await supabaseClient
        .from('users')
        .update({
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires
        })
        .eq('id', user.id);

      console.log(`   ✅ Token généré: ${verificationToken.substring(0, 10)}...`);
      console.log(`   📤 Envoi de l'email...`);

      const emailSent = await sendVerificationEmail(email, verificationToken);
      if (!emailSent) {
        console.error('   ❌ Échec de l\'envoi de l\'email');
        return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
      }

      console.log(`   ✅ Email renvoyé avec succès\n`);
      res.json({ message: 'Email de vérification renvoyé' });
    } catch (error) {
      console.error('❌ Erreur renvoi email:', error);
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      res.status(500).json({ 
        error: 'Erreur lors du renvoi de l\'email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Vérifier le token (route protégée)
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, email_verified, created_at')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier la licence si disponible
    let licenseInfo = null;
    if (req.user.licenseToken && LICENSE_SERVER_URL) {
      // Vérifier le token de licence
      try {
        const headers = {};
        if (supabaseAnonKey) {
          headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
          headers['apikey'] = supabaseAnonKey;
        }
        headers['Content-Type'] = 'application/json';

        const response = await axios.post(
          `${LICENSE_SERVER_URL}/check`,
          { token: req.user.licenseToken },
          { headers, timeout: 10000 }
        );

        if (response.data && response.data.ok) {
          licenseInfo = {
            plan: response.data.plan,
            expires_at: response.data.expires_at
          };
        }
      } catch (error) {
        console.error('Erreur vérification licence:', error);
      }
    }

    res.json({ 
      user,
      license: licenseInfo
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Déconnexion
app.post('/api/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

// Route pour créer une session de paiement Stripe
app.post('/api/create-stripe-session',
  authenticateToken,
  [
    body('plan').isIn(['normal', 'pro', 'team']).withMessage('Plan invalide'),
    body('months').isInt({ min: 1, max: 12 }).withMessage('Nombre de mois invalide')
  ],
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe n\'est pas configuré. Ajoutez STRIPE_SECRET_KEY dans .env' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { plan, months, discount_code } = req.body;
      const userEmail = req.user.email;

      // Calculer le prix avec discount de durée
      const basePrices = { normal: 9, pro: 15, team: 45 };
      const discounts = { 1: 0, 3: 5, 6: 10, 12: 20 };
      const basePrice = basePrices[plan];
      const total = basePrice * months;
      const durationDiscountPercent = discounts[months] || 0;
      const priceAfterDuration = total * (1 - durationDiscountPercent / 100);

      // Appliquer le code de réduction si fourni
      let finalPrice = priceAfterDuration;
      if (discount_code) {
        try {
          const { data: discountCode } = await supabaseClient
            .from('discount_codes')
            .select('*')
            .eq('code', discount_code.toUpperCase())
            .single();

          if (discountCode) {
            const now = new Date();
            if ((!discountCode.valid_from || new Date(discountCode.valid_from) <= now) &&
                (!discountCode.valid_until || new Date(discountCode.valid_until) >= now) &&
                (discountCode.max_uses === null || discountCode.current_uses < discountCode.max_uses)) {
              const codeDiscount = priceAfterDuration * (discountCode.discount_percent / 100);
              finalPrice = priceAfterDuration - codeDiscount;
            }
          }
        } catch (error) {
          console.warn('Erreur vérification code de réduction Stripe:', error);
        }
      }

      const planNames = { normal: 'Normal', pro: 'Pro', team: 'Team' };

      // Créer la session Stripe Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `AppsMobs ${planNames[plan]} License`,
                description: `${months} month${months > 1 ? 's' : ''} - ${planNames[plan]} Plan`,
              },
              unit_amount: Math.round(finalPrice * 100), // Stripe utilise les centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/shop?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/shop?canceled=true`,
        customer_email: userEmail,
        metadata: {
          userId: req.user.userId,
          plan: plan,
          months: months.toString(),
          discount_code: discount_code || '',
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Erreur création session Stripe:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
    }
  }
);

// Route pour vérifier le paiement Stripe et créer la licence
app.post('/api/verify-stripe-payment',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID requis')
  ],
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe n\'est pas configuré' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId } = req.body;

      // Récupérer la session Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Vérifier que le paiement est réussi
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Le paiement n\'a pas été complété' });
      }

      // Vérifier que la session appartient à l'utilisateur
      if (session.metadata.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Session non autorisée' });
      }

      // Vérifier si une licence a déjà été créée pour cette session
      const { data: existingLicense } = await supabaseClient
        .from('licenses')
        .select('*')
        .eq('payment_id', sessionId)
        .single();

      if (existingLicense) {
        return res.json({
          success: true,
          message: 'Licence déjà créée pour ce paiement',
          license: existingLicense
        });
      }

      // Créer la licence
      const { plan, months } = session.metadata;
      const discountCode = session.metadata.discount_code || null;
      const userEmail = req.user.email;

      // Récupérer le profil
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('email', userEmail)
        .single();

      const firstName = profile?.first_name || 'Utilisateur';
      const lastName = profile?.last_name || '';

      // Générer la clé de licence
      const licenseKey = crypto.randomBytes(16).toString('base64url').substring(0, 24);
      const expiresAt = Math.floor(Date.now() / 1000) + (parseInt(months) * 30 * 24 * 60 * 60);

      // Créer la licence
      const { data: license, error: licenseError } = await supabaseClient
        .from('licenses')
        .insert({
          email: userEmail,
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt,
          payment_id: sessionId,
          payment_method: 'stripe',
          created_at: Math.floor(Date.now() / 1000)
        })
        .select()
        .single();

      // Appliquer le code de réduction si présent
      if (discountCode && license) {
        try {
          await supabaseClient
            .from('discount_code_usage')
            .insert({
              code: discountCode.toUpperCase(),
              user_email: userEmail,
              order_id: sessionId
            });
          
          await supabaseClient.rpc('increment_discount_code_uses', {
            code_to_increment: discountCode.toUpperCase()
          }).catch(() => {
            // Fallback si la fonction RPC n'existe pas
            supabaseClient
              .from('discount_codes')
              .select('current_uses')
              .eq('code', discountCode.toUpperCase())
              .single()
              .then(({ data }) => {
                if (data) {
                  supabaseClient
                    .from('discount_codes')
                    .update({ current_uses: data.current_uses + 1 })
                    .eq('code', discountCode.toUpperCase());
                }
              });
          });
        } catch (error) {
          console.warn('Erreur enregistrement usage code de réduction:', error);
        }
      }

      if (licenseError) {
        console.error('Erreur création licence:', licenseError);
        return res.status(500).json({ error: 'Erreur lors de la création de la licence' });
      }

      // Envoyer l'email
      await sendLicenseEmail(userEmail, firstName, lastName, licenseKey, plan, expiresAt);

      // Attribuer 10 jetons au référant si applicable
      await awardReferralTokens(userEmail);

      res.json({
        success: true,
        message: 'Licence créée avec succès. Un email a été envoyé.',
        license: {
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt
        }
      });
    } catch (error) {
      console.error('Erreur vérification paiement Stripe:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
    }
  }
);

// Route pour créer une commande PayPal
app.post('/api/create-paypal-order',
  authenticateToken,
  [
    body('plan').isIn(['normal', 'pro', 'team']).withMessage('Plan invalide'),
    body('months').isInt({ min: 1, max: 12 }).withMessage('Nombre de mois invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { plan, months, discount_code } = req.body;
      const userEmail = req.user.email;

      // Calculer le prix avec discount de durée
      const basePrices = { normal: 9, pro: 15, team: 45 };
      const discounts = { 1: 0, 3: 5, 6: 10, 12: 20 };
      const basePrice = basePrices[plan];
      const total = basePrice * months;
      const durationDiscountPercent = discounts[months] || 0;
      const priceAfterDuration = total * (1 - durationDiscountPercent / 100);

      // Appliquer le code de réduction si fourni
      let finalPrice = priceAfterDuration;
      if (discount_code) {
        try {
          const { data: discountCode } = await supabaseClient
            .from('discount_codes')
            .select('*')
            .eq('code', discount_code.toUpperCase())
            .single();

          if (discountCode) {
            const now = new Date();
            if ((!discountCode.valid_from || new Date(discountCode.valid_from) <= now) &&
                (!discountCode.valid_until || new Date(discountCode.valid_until) >= now) &&
                (discountCode.max_uses === null || discountCode.current_uses < discountCode.max_uses)) {
              const codeDiscount = priceAfterDuration * (discountCode.discount_percent / 100);
              finalPrice = priceAfterDuration - codeDiscount;
            }
          }
        } catch (error) {
          console.warn('Erreur vérification code de réduction PayPal:', error);
        }
      }

      const planNames = { normal: 'Normal', pro: 'Pro', team: 'Team' };

      const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const paypalMode = process.env.PAYPAL_MODE || 'sandbox';
      const paypalBaseUrl = paypalMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

      if (!paypalClientId || !paypalClientSecret) {
        return res.status(500).json({ error: 'PayPal n\'est pas configuré. Ajoutez PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET dans .env' });
      }

      // Obtenir un access token PayPal
      const tokenResponse = await axios.post(
        `${paypalBaseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: paypalClientId,
            password: paypalClientSecret,
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Créer la commande PayPal
      const orderResponse = await axios.post(
        `${paypalBaseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              description: `AppsMobs ${planNames[plan]} License - ${months} month${months > 1 ? 's' : ''}`,
              amount: {
                currency_code: 'EUR',
                value: finalPrice.toFixed(2),
              },
              custom_id: JSON.stringify({
                userId: req.user.userId,
                plan: plan,
                months: months,
                email: userEmail,
              }),
            },
          ],
          application_context: {
            brand_name: 'AppsMobs',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/shop?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/shop?canceled=true`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      res.json({ orderId: orderResponse.data.id });
    } catch (error) {
      console.error('Erreur création commande PayPal:', error.response?.data || error.message);
      res.status(500).json({ error: 'Erreur lors de la création de la commande PayPal' });
    }
  }
);

// Route pour capturer le paiement PayPal et créer la licence
app.post('/api/capture-paypal-order',
  authenticateToken,
  [
    body('orderId').notEmpty().withMessage('Order ID requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId } = req.body;

      const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const paypalMode = process.env.PAYPAL_MODE || 'sandbox';
      const paypalBaseUrl = paypalMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

      // Obtenir un access token
      const tokenResponse = await axios.post(
        `${paypalBaseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: paypalClientId,
            password: paypalClientSecret,
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Capturer le paiement
      const captureResponse = await axios.post(
        `${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (captureResponse.data.status !== 'COMPLETED') {
        return res.status(400).json({ error: 'Le paiement n\'a pas été complété' });
      }

      // Extraire les métadonnées
      const purchaseUnit = captureResponse.data.purchase_units[0];
      const customId = JSON.parse(purchaseUnit.custom_id);
      const { plan, months, email, discount_code } = customId;

      // Vérifier que l'utilisateur correspond
      if (req.user.email !== email || customId.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Commande non autorisée' });
      }

      // Vérifier si une licence existe déjà
      const { data: existingLicense } = await supabaseClient
        .from('licenses')
        .select('*')
        .eq('payment_id', orderId)
        .single();

      if (existingLicense) {
        return res.json({
          success: true,
          message: 'Licence déjà créée pour ce paiement',
          license: existingLicense
        });
      }

      // Récupérer le profil
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('email', email)
        .single();

      const firstName = profile?.first_name || 'Utilisateur';
      const lastName = profile?.last_name || '';

      // Générer la clé de licence
      const licenseKey = crypto.randomBytes(16).toString('base64url').substring(0, 24);
      const expiresAt = Math.floor(Date.now() / 1000) + (parseInt(months) * 30 * 24 * 60 * 60);

      // Créer la licence
      const { data: license, error: licenseError } = await supabaseClient
        .from('licenses')
        .insert({
          email: email,
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt,
          payment_id: orderId,
          payment_method: 'paypal',
          created_at: Math.floor(Date.now() / 1000)
        })
        .select()
        .single();

      // Appliquer le code de réduction si présent
      if (discount_code && license) {
        try {
          await supabaseClient
            .from('discount_code_usage')
            .insert({
              code: discount_code.toUpperCase(),
              user_email: email,
              order_id: orderId
            });
          
          const { data: discountCodeData } = await supabaseClient
            .from('discount_codes')
            .select('current_uses')
            .eq('code', discount_code.toUpperCase())
            .single();
          
          if (discountCodeData) {
            await supabaseClient
              .from('discount_codes')
              .update({ current_uses: discountCodeData.current_uses + 1 })
              .eq('code', discount_code.toUpperCase());
          }
        } catch (error) {
          console.warn('Erreur enregistrement usage code de réduction PayPal:', error);
        }
      }

      if (licenseError) {
        console.error('Erreur création licence:', licenseError);
        return res.status(500).json({ error: 'Erreur lors de la création de la licence' });
      }

      // Envoyer l'email
      await sendLicenseEmail(email, firstName, lastName, licenseKey, plan, expiresAt);

      // Attribuer 10 jetons au référant si applicable
      await awardReferralTokens(email);

      res.json({
        success: true,
        message: 'Licence créée avec succès. Un email a été envoyé.',
        license: {
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt
        }
      });
    } catch (error) {
      console.error('Erreur capture PayPal:', error.response?.data || error.message);
      res.status(500).json({ error: 'Erreur lors de la capture du paiement PayPal' });
    }
  }
);

// Route pour créer une commande de virement bancaire
app.post('/api/create-bank-transfer-order',
  authenticateToken,
  [
    body('plan').isIn(['normal', 'pro', 'team']).withMessage('Plan invalide'),
    body('months').isInt({ min: 1, max: 12 }).withMessage('Nombre de mois invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { plan, months } = req.body;
      const userEmail = req.user.email;

      // Calculer le prix avec discount
      const basePrices = { normal: 9, pro: 15, team: 45 };
      const discounts = { 1: 0, 3: 5, 6: 10, 12: 20 };
      const basePrice = basePrices[plan];
      const total = basePrice * months;
      const discountPercent = discounts[months] || 0;
      const finalPrice = total * (1 - discountPercent / 100);

      // Générer une référence unique
      const reference = `APPS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Créer une commande en attente dans Supabase
      // Note: Vous devrez créer une table `pending_payments` dans Supabase
      const { data: pendingPayment, error: paymentError } = await supabaseClient
        .from('pending_payments')
        .insert({
          user_id: req.user.userId,
          email: userEmail,
          plan: plan,
          months: months,
          amount: finalPrice,
          reference: reference,
          payment_method: 'bank_transfer',
          status: 'pending',
          created_at: Math.floor(Date.now() / 1000)
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Erreur création commande virement:', paymentError);
        // Si la table n'existe pas, on crée quand même la référence et on retourne les infos
        // L'admin devra créer manuellement la licence
        return res.json({
          reference: reference,
          amount: finalPrice,
          plan: plan,
          months: months,
          email: userEmail,
          message: 'Commande créée. Utilisez cette référence pour le virement.'
        });
      }

      // Récupérer le profil pour l'email
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('email', userEmail)
        .single();

      const firstName = profile?.first_name || 'Utilisateur';
      const lastName = profile?.last_name || '';

      // Envoyer un email avec les instructions de virement
      await sendBankTransferInstructions(userEmail, firstName, lastName, reference, finalPrice, plan, months);

      res.json({
        success: true,
        reference: reference,
        amount: finalPrice,
        plan: plan,
        months: months,
        message: 'Instructions de virement envoyées par email'
      });
    } catch (error) {
      console.error('Erreur création commande virement:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la commande' });
    }
  }
);

// Route pour valider un virement bancaire (ADMIN)
app.post('/api/admin/validate-bank-transfer',
  authenticateToken,
  [
    body('reference').notEmpty().withMessage('Référence requise')
  ],
  async (req, res) => {
    try {
      // Vérifier que l'utilisateur est admin (vous pouvez adapter cette logique)
      // Pour l'instant, on autorise tous les utilisateurs authentifiés
      // Vous devrez ajouter un champ `is_admin` dans la table users

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reference } = req.body;

      // Récupérer la commande en attente
      const { data: pendingPayment, error: paymentError } = await supabaseClient
        .from('pending_payments')
        .select('*')
        .eq('reference', reference)
        .eq('status', 'pending')
        .single();

      if (paymentError || !pendingPayment) {
        return res.status(404).json({ error: 'Commande non trouvée ou déjà traitée' });
      }

      // Vérifier si une licence existe déjà
      const { data: existingLicense } = await supabaseClient
        .from('licenses')
        .select('*')
        .eq('payment_id', reference)
        .single();

      if (existingLicense) {
        return res.json({
          success: true,
          message: 'Licence déjà créée pour cette référence',
          license: existingLicense
        });
      }

      // Créer la licence
      const { plan, months, email } = pendingPayment;
      const licenseKey = crypto.randomBytes(16).toString('base64url').substring(0, 24);
      const expiresAt = Math.floor(Date.now() / 1000) + (parseInt(months) * 30 * 24 * 60 * 60);

      // Récupérer le profil
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('email', email)
        .single();

      const firstName = profile?.first_name || 'Utilisateur';
      const lastName = profile?.last_name || '';

      // Créer la licence
      const { data: license, error: licenseError } = await supabaseClient
        .from('licenses')
        .insert({
          email: email,
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt,
          payment_id: reference,
          payment_method: 'bank_transfer',
          created_at: Math.floor(Date.now() / 1000)
        })
        .select()
        .single();

      if (licenseError) {
        console.error('Erreur création licence:', licenseError);
        return res.status(500).json({ error: 'Erreur lors de la création de la licence' });
      }

      // Marquer le paiement comme validé
      await supabaseClient
        .from('pending_payments')
        .update({ status: 'completed', completed_at: Math.floor(Date.now() / 1000) })
        .eq('reference', reference);

      // Envoyer l'email
      await sendLicenseEmail(email, firstName, lastName, licenseKey, plan, expiresAt);

      // Attribuer 10 jetons au référant si applicable
      await awardReferralTokens(email);

      res.json({
        success: true,
        message: 'Virement validé et licence créée avec succès',
        license: {
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt
        }
      });
    } catch (error) {
      console.error('Erreur validation virement:', error);
      res.status(500).json({ error: 'Erreur lors de la validation du virement' });
    }
  }
);

// Route pour créer une commande Binance Pay
app.post('/api/create-binance-order',
  authenticateToken,
  [
    body('plan').isIn(['normal', 'pro', 'team']).withMessage('Plan invalide'),
    body('months').isInt({ min: 1, max: 12 }).withMessage('Nombre de mois invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { plan, months, discount_code } = req.body;
      const userEmail = req.user.email;

      // Calculer le prix avec discount de durée
      const basePrices = { normal: 9, pro: 15, team: 45 };
      const discounts = { 1: 0, 3: 5, 6: 10, 12: 20 };
      const basePrice = basePrices[plan];
      const total = basePrice * months;
      const durationDiscountPercent = discounts[months] || 0;
      const priceAfterDuration = total * (1 - durationDiscountPercent / 100);

      // Appliquer le code de réduction si fourni
      let finalPrice = priceAfterDuration;
      if (discount_code) {
        try {
          const { data: discountCode } = await supabaseClient
            .from('discount_codes')
            .select('*')
            .eq('code', discount_code.toUpperCase())
            .single();

          if (discountCode) {
            const now = new Date();
            if ((!discountCode.valid_from || new Date(discountCode.valid_from) <= now) &&
                (!discountCode.valid_until || new Date(discountCode.valid_until) >= now) &&
                (discountCode.max_uses === null || discountCode.current_uses < discountCode.max_uses)) {
              const codeDiscount = priceAfterDuration * (discountCode.discount_percent / 100);
              finalPrice = priceAfterDuration - codeDiscount;
            }
          }
        } catch (error) {
          console.warn('Erreur vérification code de réduction Binance:', error);
        }
      }

      // Binance Pay nécessite une API Key et Secret Key
      // Pour l'instant, on crée une commande en attente
      // Vous devrez configurer Binance Pay API dans .env
      const binanceApiKey = process.env.BINANCE_API_KEY;
      const binanceSecretKey = process.env.BINANCE_SECRET_KEY;

      if (!binanceApiKey || !binanceSecretKey) {
        // Mode simplifié : créer une commande avec référence pour paiement manuel
        const reference = `BINANCE-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        
        const { data: pendingPayment, error: paymentError } = await supabaseClient
          .from('pending_payments')
          .insert({
            user_id: req.user.userId,
            email: userEmail,
            plan: plan,
            months: months,
            amount: finalPrice,
            reference: reference,
            payment_method: 'binance',
            status: 'pending',
            discount_code: discount_code || null,
            created_at: Math.floor(Date.now() / 1000)
          })
          .select()
          .single();

        // Récupérer le profil pour l'email
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name')
          .eq('email', userEmail)
          .single();

        const firstName = profile?.first_name || 'Utilisateur';
        const lastName = profile?.last_name || '';

        // Envoyer un email avec les instructions Binance
        await sendBinanceInstructions(userEmail, firstName, lastName, reference, finalPrice, plan, months);

        return res.json({
          reference: reference,
          amount: finalPrice,
          plan: plan,
          months: months,
          message: 'Commande créée. Instructions envoyées par email.',
          note: 'Consultez votre email pour les instructions de paiement Binance.'
        });
      }

      // TODO: Intégration complète Binance Pay API
      // Binance Pay utilise une API différente qui nécessite une signature HMAC
      // Consultez: https://developers.binance.com/docs/binance-pay/api-order-create

      res.json({ error: 'Intégration Binance Pay complète en cours de développement' });
    } catch (error) {
      console.error('Erreur création commande Binance:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la commande Binance' });
    }
  }
);

// Fonction pour envoyer les instructions Binance Pay
async function sendBinanceInstructions(email, firstName, lastName, reference, amount, plan, months) {
  const planNames = { normal: 'Normal', pro: 'Pro', team: 'Team' };
  
  console.log(`📧 Envoi instructions Binance Pay à ${email}`);
  console.log(`   Référence: ${reference}`);
  console.log(`   Montant: €${amount.toFixed(2)}`);

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Instructions de paiement Binance Pay - AppsMobs (Référence: ${reference})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F3BA2F, #F7931A); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reference-box { background: #fff; border: 2px solid #F3BA2F; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .reference { font-size: 24px; font-weight: bold; color: #F3BA2F; letter-spacing: 2px; }
            .amount { font-size: 32px; font-weight: bold; color: #F3BA2F; text-align: center; margin: 20px 0; }
            .steps-box { background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #F3BA2F; }
            .steps-box ol { margin: 15px 0; padding-left: 25px; }
            .steps-box li { margin-bottom: 15px; line-height: 1.8; }
            .steps-box li strong { color: #F3BA2F; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .support-box { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .support-box a { color: #1976d2; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .code-block { background: #f5f5f5; border: 1px solid #ddd; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Instructions de Paiement Binance Pay</h1>
              <p>AppsMobs License Purchase</p>
            </div>
            <div class="content">
              <p>Bonjour ${firstName} ${lastName},</p>
              <p>Vous avez choisi de payer via Binance Pay pour votre licence <strong>${planNames[plan]}</strong> (${months} ${months === 1 ? 'mois' : 'mois'}).</p>
              
              <div class="reference-box">
                <p style="margin: 0; color: #666;">Votre référence de paiement :</p>
                <div class="reference">${reference}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">⚠️ IMPORTANT : Vous devrez fournir cette référence au support</p>
              </div>

              <div class="amount">Montant à payer : €${amount.toFixed(2)}</div>

              <div class="steps-box">
                <h3 style="margin-top: 0; color: #F3BA2F;">📋 Procédure à suivre :</h3>
                <ol>
                  <li><strong>Effectuez le paiement en crypto via Binance Pay</strong><br>
                    Connectez-vous à votre compte Binance et effectuez le paiement du montant exact de <strong>€${amount.toFixed(2)}</strong> en utilisant votre crypto préférée (USDT, BUSD, BTC, etc.).</li>
                  
                  <li><strong>Envoyez votre référence au support</strong><br>
                    Une fois le paiement effectué, vous <strong>DEVEZ</strong> envoyer un email à notre support avec :
                    <ul style="margin-top: 10px; padding-left: 20px;">
                      <li>Votre référence de paiement : <code style="background: #f5f5f5; padding: 3px 8px; border-radius: 3px; font-weight: bold; color: #F3BA2F;">${reference}</code></li>
                      <li>La preuve de paiement (screenshot de la transaction ou hash de transaction)</li>
                      <li>Le montant payé et la cryptomonnaie utilisée</li>
                    </ul>
                  </li>
                  
                  <li><strong>Contactez notre support</strong><br>
                    Envoyez un email à : <a href="mailto:support@appsmobs.com" style="color: #F3BA2F; font-weight: bold;">support@appsmobs.com</a><br>
                    <strong>Sujet de l'email :</strong> "Validation paiement Binance - ${reference}"
                  </li>
                  
                  <li><strong>Attendez la validation</strong><br>
                    Notre équipe validera votre paiement sous <strong>24-48 heures</strong> après réception de votre email.</li>
                  
                  <li><strong>Recevez votre licence</strong><br>
                    Une fois le paiement validé, vous recevrez automatiquement votre <strong>clé de licence par email</strong>.</li>
                </ol>
              </div>

              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Le paiement ne sera pas validé automatiquement</li>
                  <li>Vous <strong>DEVEZ</strong> envoyer votre référence au support pour validation</li>
                  <li>Incluez toujours la référence <code style="background: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;">${reference}</code> dans votre email au support</li>
                  <li>La validation prend 24-48 heures après réception de votre email</li>
                </ul>
              </div>

              <div class="support-box">
                <strong>📧 Contact Support :</strong><br>
                <a href="mailto:support@appsmobs.com">support@appsmobs.com</a><br>
                <small>N'oubliez pas d'inclure votre référence dans votre email !</small>
              </div>

              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

              <p>Cordialement,<br><strong>L'équipe AppsMobs</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AppsMobs. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Erreur envoi email Binance:', error);
      return false;
    }

    console.log(`✅ Email instructions Binance envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email Binance:', error);
    return false;
  }
}

// Fonction pour envoyer les instructions de virement bancaire
async function sendBankTransferInstructions(email, firstName, lastName, reference, amount, plan, months) {
  const planNames = { normal: 'Normal', pro: 'Pro', team: 'Team' };
  
  // Récupérer les coordonnées bancaires depuis .env ou utiliser des valeurs par défaut
  const bankName = process.env.BANK_NAME || 'Votre Banque';
  const bankAccount = process.env.BANK_ACCOUNT || '1234567890';
  const bankIBAN = process.env.BANK_IBAN || 'MA64 1234 5678 9012 3456 7890 123';
  const bankSWIFT = process.env.BANK_SWIFT || 'BKCHMAMMXXX';
  const bankHolder = process.env.BANK_HOLDER || 'AppsMobs';

  console.log(`📧 Envoi instructions virement bancaire à ${email}`);
  console.log(`   Référence: ${reference}`);
  console.log(`   Montant: €${amount.toFixed(2)}`);

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Instructions de virement bancaire - AppsMobs (Référence: ${reference})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22d3ee, #a78bfa); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reference-box { background: #fff; border: 2px solid #22d3ee; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .reference { font-size: 24px; font-weight: bold; color: #22d3ee; letter-spacing: 2px; }
            .bank-details { background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #22d3ee; }
            .bank-details p { margin: 10px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #22d3ee; text-align: center; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Instructions de Virement Bancaire</h1>
              <p>AppsMobs License Purchase</p>
            </div>
            <div class="content">
              <p>Bonjour ${firstName} ${lastName},</p>
              <p>Vous avez choisi de payer par virement bancaire pour votre licence <strong>${planNames[plan]}</strong> (${months} ${months === 1 ? 'mois' : 'mois'}).</p>
              
              <div class="reference-box">
                <p style="margin: 0; color: #666;">Votre référence de paiement :</p>
                <div class="reference">${reference}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">⚠️ IMPORTANT : Incluez cette référence dans votre virement</p>
              </div>

              <div class="amount">Montant à payer : €${amount.toFixed(2)}</div>

              <div class="bank-details">
                <h3 style="margin-top: 0; color: #22d3ee;">Coordonnées Bancaires :</h3>
                <p><strong>Nom du bénéficiaire :</strong> ${bankHolder}</p>
                <p><strong>Nom de la banque :</strong> ${bankName}</p>
                <p><strong>Numéro de compte :</strong> ${bankAccount}</p>
                <p><strong>IBAN :</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${bankIBAN}</code></p>
                <p><strong>SWIFT/BIC :</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${bankSWIFT}</code></p>
              </div>

              <div class="warning">
                <strong>⚠️ Instructions importantes :</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Effectuez le virement depuis votre banque en ligne ou à votre agence</li>
                  <li><strong>Incluez la référence ${reference} dans les détails du virement</strong></li>
                  <li>Le montant exact doit être de <strong>€${amount.toFixed(2)}</strong></li>
                  <li>Une fois le virement effectué, nous validerons votre paiement sous 24-48h</li>
                  <li>Vous recevrez votre clé de licence par email une fois le paiement validé</li>
                </ul>
              </div>

              <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@appsmobs.com">support@appsmobs.com</a></p>

              <p>Cordialement,<br><strong>L'équipe AppsMobs</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AppsMobs. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Erreur envoi email virement:', error);
      return false;
    }

    console.log(`✅ Email instructions virement envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email virement:', error);
    return false;
  }
}

// Fonction helper: Attribuer 10 jetons au référant après un achat
async function awardReferralTokens(refereeEmail) {
  try {
    // Vérifier si cet utilisateur a utilisé un code de parrainage
    const { data: referral, error: refError } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('referee_email', refereeEmail)
      .eq('purchase_made', false)
      .single();

    if (refError || !referral) {
      // Pas de referral actif pour cet utilisateur
      return;
    }

    // Vérifier que l'achat n'a pas déjà été comptabilisé
    if (referral.tokens_awarded > 0) {
      return;
    }

    const referrerEmail = referral.referrer_email;
    const TOKENS_PER_REFERRAL = 10;

    // Récupérer ou créer l'enregistrement de jetons pour le référant
    const { data: referrerTokens, error: tokensError } = await supabaseClient
      .from('user_tokens')
      .select('*')
      .eq('email', referrerEmail)
      .single();

    if (tokensError && tokensError.code !== 'PGRST116') {
      console.error('Erreur récupération jetons référant:', tokensError);
      return;
    }

    // Si pas de jetons, créer l'enregistrement
    if (!referrerTokens) {
      const { data: referrerUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', referrerEmail)
        .single();

      if (referrerUser) {
        await supabaseClient
          .from('user_tokens')
          .insert({
            user_id: referrerUser.id,
            email: referrerEmail,
            tokens: TOKENS_PER_REFERRAL,
            total_earned: TOKENS_PER_REFERRAL,
            total_redeemed: 0
          });
      }
    } else {
      // Mettre à jour les jetons du référant
      await supabaseClient
        .from('user_tokens')
        .update({
          tokens: referrerTokens.tokens + TOKENS_PER_REFERRAL,
          total_earned: referrerTokens.total_earned + TOKENS_PER_REFERRAL,
          updated_at: Math.floor(Date.now() / 1000)
        })
        .eq('email', referrerEmail);
    }

    // Marquer le referral comme complété
    await supabaseClient
      .from('referrals')
      .update({
        tokens_awarded: TOKENS_PER_REFERRAL,
        purchase_made: true,
        updated_at: Math.floor(Date.now() / 1000)
      })
      .eq('id', referral.id);

    console.log(`✅ ${TOKENS_PER_REFERRAL} jetons attribués à ${referrerEmail} pour le referral de ${refereeEmail}`);
  } catch (error) {
    console.error('Erreur attribution jetons referral:', error);
  }
}

// Route pour créer une licence et l'envoyer par email (après achat au shop)
app.post('/api/purchase-license',
  authenticateToken,
  [
    body('plan').isIn(['normal', 'pro', 'team']).withMessage('Plan invalide'),
    body('months').isInt({ min: 1, max: 12 }).withMessage('Nombre de mois invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { plan, months } = req.body;
      const userEmail = req.user.email;

      // Vérifier que l'utilisateur a vérifié son email
      const { data: user } = await supabaseClient
        .from('users')
        .select('email_verified')
        .eq('email', userEmail)
        .single();

      if (!user || !user.email_verified) {
        return res.status(403).json({ error: 'Vous devez vérifier votre email avant d\'acheter une licence' });
      }

      // Récupérer le profil pour avoir le nom/prénom
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('email', userEmail)
        .single();

      const firstName = profile?.first_name || 'Utilisateur';
      const lastName = profile?.last_name || '';

      // Générer une clé de licence unique
      const licenseKey = crypto.randomBytes(16).toString('base64url').substring(0, 24);
      
      // Calculer la date d'expiration (en timestamp Unix)
      const expiresAt = Math.floor(Date.now() / 1000) + (months * 30 * 24 * 60 * 60);

      // Créer la licence directement dans Supabase
      // (Plus simple et direct que passer par l'Edge Function)
      const { data: license, error: licenseError } = await supabaseClient
        .from('licenses')
        .insert({
          email: userEmail,
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt,
          created_at: Math.floor(Date.now() / 1000)
        })
        .select()
        .single();

      if (licenseError) {
        console.error('Erreur création licence:', licenseError);
        return res.status(500).json({ error: 'Erreur lors de la création de la licence' });
      }

      // Envoyer l'email avec la licence
      const emailSent = await sendLicenseEmail(
        userEmail,
        firstName,
        lastName,
        licenseKey,
        plan,
        expiresAt
      );

      // Attribuer 10 jetons au référant si applicable
      await awardReferralTokens(userEmail);

      res.json({
        success: true,
        message: 'Licence créée avec succès. Un email a été envoyé.',
        license: {
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt
        },
        emailSent
      });
    } catch (error) {
      console.error('Erreur achat licence:', error);
      res.status(500).json({ error: 'Erreur lors de l\'achat de la licence' });
    }
  }
);

// Dashboard: Récupérer les licences de l'utilisateur
app.get('/api/my-licenses', authenticateToken, async (req, res) => {
  try {
    const { data: licenses, error } = await supabaseClient
      .from('licenses')
      .select('*')
      .eq('email', req.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération licences:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des licences' });
    }

    res.json({ licenses: licenses || [] });
  } catch (error) {
    console.error('Erreur my-licenses:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Dashboard: Historique des commandes
app.get('/api/my-orders', authenticateToken, async (req, res) => {
  try {
    // Récupérer les commandes depuis pending_payments (PayPal, Binance, Stripe)
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('pending_payments')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    // Récupérer aussi les licences créées (pour Stripe/PayPal réussis)
    const { data: licenses, error: licensesError } = await supabaseClient
      .from('licenses')
      .select('*')
      .eq('email', req.user.email)
      .order('created_at', { ascending: false });

    if (paymentsError || licensesError) {
      console.error('Erreur récupération commandes:', paymentsError || licensesError);
      return res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
    }

    // Combiner et formater
    const orders = [];
    
    // Ajouter les paiements en attente
    (payments || []).forEach(payment => {
      orders.push({
        id: `payment_${payment.id}`,
        type: 'payment',
        status: payment.status,
        plan: payment.plan,
        months: payment.months,
        amount: payment.amount,
        payment_method: payment.payment_method,
        reference: payment.reference,
        created_at: payment.created_at,
        updated_at: payment.updated_at || payment.created_at
      });
    });

    // Ajouter les licences créées (achats réussis)
    (licenses || []).forEach(license => {
      orders.push({
        id: `license_${license.id}`,
        type: 'license',
        status: 'completed',
        plan: license.plan,
        months: null, // Calculer depuis expires_at
        amount: null,
        payment_method: 'completed',
        license_key: license.key || license.license_key,
        expires_at: license.expires_at,
        created_at: license.created_at,
        updated_at: license.created_at
      });
    });

    // Trier par date (plus récent d'abord)
    orders.sort((a, b) => new Date(b.created_at * 1000) - new Date(a.created_at * 1000));

    res.json({ orders });
  } catch (error) {
    console.error('Erreur my-orders:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Dashboard: Récupérer le profil
app.get('/api/my-profile', authenticateToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', req.user.email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur récupération profil:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }

    res.json({ profile: profile || null });
  } catch (error) {
    console.error('Erreur my-profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Referral: Générer ou récupérer le code de parrainage
app.get('/api/my-referral-code', authenticateToken, async (req, res) => {
  try {
    const { data: existingCode, error: fetchError } = await supabaseClient
      .from('referral_codes')
      .select('*')
      .eq('email', req.user.email)
      .single();

    if (existingCode && !fetchError) {
      return res.json({ code: existingCode.code, usageCount: existingCode.usage_count });
    }

    // Générer un nouveau code de parrainage unique
    const code = `REF-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    // Trouver l'ID utilisateur depuis la table users
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', req.user.email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: newCode, error: insertError } = await supabaseClient
      .from('referral_codes')
      .insert({
        user_id: user.id,
        email: req.user.email,
        code: code,
        usage_count: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erreur création code parrainage:', insertError);
      return res.status(500).json({ error: 'Erreur lors de la création du code de parrainage' });
    }

    res.json({ code: newCode.code, usageCount: 0 });
  } catch (error) {
    console.error('Erreur my-referral-code:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Referral: Appliquer un code de parrainage (à l'inscription ou lors de l'achat)
app.post('/api/apply-referral-code',
  [
    body('code').notEmpty().withMessage('Code de parrainage requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code } = req.body;
      const userEmail = req.body.email || req.user?.email;

      if (!userEmail) {
        return res.status(400).json({ error: 'Email requis pour appliquer le code de parrainage' });
      }

      // Vérifier que le code existe
      const { data: referralCode, error: codeError } = await supabaseClient
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (codeError || !referralCode) {
        return res.status(400).json({ error: 'Code de parrainage invalide' });
      }

      // Vérifier que l'utilisateur n'applique pas son propre code
      if (referralCode.email === userEmail) {
        return res.status(400).json({ error: 'Vous ne pouvez pas utiliser votre propre code de parrainage' });
      }

      // Vérifier que ce code n'a pas déjà été utilisé par cet utilisateur
      const { data: existingReferral, error: refError } = await supabaseClient
        .from('referrals')
        .select('*')
        .eq('referrer_email', referralCode.email)
        .eq('referee_email', userEmail)
        .single();

      if (existingReferral && !refError) {
        return res.status(400).json({ error: 'Ce code de parrainage a déjà été utilisé' });
      }

      // Trouver l'ID de l'utilisateur référant
      const { data: referrerUser, error: refUserError } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', referralCode.email)
        .single();

      if (refUserError || !referrerUser) {
        return res.status(404).json({ error: 'Referrer not found' });
      }

      // Créer l'enregistrement de referral (les jetons seront attribués après l'achat)
      const { data: newReferral, error: insertError } = await supabaseClient
        .from('referrals')
        .insert({
          referrer_id: referrerUser.id,
          referrer_email: referralCode.email,
          referee_email: userEmail,
          referral_code: code.toUpperCase(),
          tokens_awarded: 0,
          purchase_made: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erreur création referral:', insertError);
        return res.status(500).json({ error: 'Erreur lors de l\'application du code de parrainage' });
      }

      // Incrémenter le compteur d'utilisation
      await supabaseClient
        .from('referral_codes')
        .update({ usage_count: referralCode.usage_count + 1 })
        .eq('id', referralCode.id);

      res.json({ 
        success: true, 
        message: 'Code de parrainage appliqué avec succès. Vous recevrez 10% de réduction sur votre premier achat !',
        referrer: referralCode.email
      });
    } catch (error) {
      console.error('Erreur apply-referral-code:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Referral: Récupérer les jetons de l'utilisateur
app.get('/api/my-tokens', authenticateToken, async (req, res) => {
  try {
    const { data: tokens, error } = await supabaseClient
      .from('user_tokens')
      .select('*')
      .eq('email', req.user.email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur récupération jetons:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des jetons' });
    }

    // Si pas de jetons, créer une entrée avec 0 jetons
    if (!tokens) {
      const { data: user } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', req.user.email)
        .single();

      if (user) {
        const { data: newTokens, error: insertError } = await supabaseClient
          .from('user_tokens')
          .insert({
            user_id: user.id,
            email: req.user.email,
            tokens: 0,
            total_earned: 0,
            total_redeemed: 0
          })
          .select()
          .single();

        if (insertError) {
          return res.status(500).json({ error: 'Erreur lors de la création de l\'enregistrement de jetons' });
        }

        return res.json({ tokens: newTokens });
      }
    }

    res.json({ tokens: tokens || { tokens: 0, total_earned: 0, total_redeemed: 0 } });
  } catch (error) {
    console.error('Erreur my-tokens:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Referral: Récupérer l'historique des referrals
app.get('/api/my-referrals', authenticateToken, async (req, res) => {
  try {
    const { data: referrals, error } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('referrer_email', req.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération referrals:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des referrals' });
    }

    res.json({ referrals: referrals || [] });
  } catch (error) {
    console.error('Erreur my-referrals:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Referral: Échanger 100 jetons contre 1 semaine gratuite
app.post('/api/redeem-tokens', authenticateToken,
  [
    body('weeks').isInt({ min: 1, max: 4 }).withMessage('Nombre de semaines invalide (1-4 max)')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { weeks } = req.body;
      const userEmail = req.user.email;
      const tokensRequired = weeks * 100; // 100 jetons par semaine

      // Récupérer les jetons de l'utilisateur
      const { data: userTokens, error: tokensError } = await supabaseClient
        .from('user_tokens')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (tokensError || !userTokens || userTokens.tokens < tokensRequired) {
        return res.status(400).json({ 
          error: `Pas assez de jetons. Vous avez ${userTokens?.tokens || 0} jetons, ${tokensRequired} requis.` 
        });
      }

      // Retirer les jetons
      const newTokenBalance = userTokens.tokens - tokensRequired;
      const newTotalRedeemed = userTokens.total_redeemed + tokensRequired;

      const { error: updateError } = await supabaseClient
        .from('user_tokens')
        .update({
          tokens: newTokenBalance,
          total_redeemed: newTotalRedeemed,
          updated_at: Math.floor(Date.now() / 1000)
        })
        .eq('email', userEmail);

      if (updateError) {
        console.error('Erreur mise à jour jetons:', updateError);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour des jetons' });
      }

      // Créer une licence de 1 semaine (ou plusieurs semaines)
      const expiresAt = Math.floor(Date.now() / 1000) + (weeks * 7 * 24 * 60 * 60);
      const licenseKey = crypto.randomBytes(16).toString('base64url').substring(0, 24);

      // Déterminer le plan (par défaut "normal", ou récupérer le plan actuel de l'utilisateur)
      const { data: userLicense } = await supabaseClient
        .from('licenses')
        .select('plan')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const plan = userLicense?.plan || 'normal';

      const { data: license, error: licenseError } = await supabaseClient
        .from('licenses')
        .insert({
          email: userEmail,
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt,
          created_at: Math.floor(Date.now() / 1000)
        })
        .select()
        .single();

      if (licenseError) {
        console.error('Erreur création licence:', licenseError);
        // Rollback: remettre les jetons
        await supabaseClient
          .from('user_tokens')
          .update({
            tokens: userTokens.tokens,
            total_redeemed: userTokens.total_redeemed
          })
          .eq('email', userEmail);
        return res.status(500).json({ error: 'Erreur lors de la création de la licence' });
      }

      // Récupérer le profil pour l'email
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('email', userEmail)
        .single();

      const firstName = profile?.first_name || 'Utilisateur';
      const lastName = profile?.last_name || '';

      // Envoyer l'email avec la licence
      if (resend) {
        await sendLicenseEmail(userEmail, firstName, lastName, licenseKey, plan, expiresAt);
      }

      res.json({
        success: true,
        message: `${weeks} semaine${weeks > 1 ? 's' : ''} gratuite${weeks > 1 ? 's' : ''} activée avec succès !`,
        license: {
          key: licenseKey,
          plan: plan,
          expires_at: expiresAt,
          weeks: weeks
        },
        tokens: {
          remaining: newTokenBalance,
          redeemed: tokensRequired
        }
      });
    } catch (error) {
      console.error('Erreur redeem-tokens:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Dashboard: Mettre à jour le profil
app.put('/api/update-profile', authenticateToken,
  [
    body('firstName').optional().notEmpty().withMessage('Prénom invalide'),
    body('lastName').optional().notEmpty().withMessage('Nom invalide'),
    body('country').optional().notEmpty().withMessage('Pays invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, country } = req.body;
      const userEmail = req.user.email;

      const updateData = {};
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (country) updateData.country = country;
      updateData.updated_at = Math.floor(Date.now() / 1000);

      const { data, error } = await supabaseClient
        .from('profiles')
        .upsert({
          email: userEmail,
          ...updateData
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour profil:', error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
      }

      res.json({ success: true, profile: data });
    } catch (error) {
      console.error('Erreur update-profile:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Forgot Password: Demander un reset
app.post('/api/forgot-password', authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Vérifier si l'utilisateur existe
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

      if (userError || !user) {
        // Pour la sécurité, on ne révèle pas si l'email existe
        return res.json({ 
          success: true, 
          message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
        });
      }

      // Générer un token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + (60 * 60 * 1000); // 1 heure

      // Sauvegarder le token dans la base
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({
          reset_token: resetToken,
          reset_token_expires: resetTokenExpires
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur sauvegarde token reset:', updateError);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      // Envoyer l'email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;
      
      console.log(`📧 Envoi email reset password à ${email}`);
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - AppsMobs',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00D4FF, #0099CC); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00D4FF, #0099CC); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reset Your Password</h1>
                <p>AppsMobs Account</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>You requested to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <div class="warning">
                  <strong>⚠️ Important:</strong> This link expires in 1 hour. If you didn't request this, please ignore this email.
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #00D4FF;">${resetUrl}</p>
                <p>Best regards,<br><strong>The AppsMobs Team</strong></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} AppsMobs. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

      if (emailError) {
        console.error('❌ Erreur envoi email reset:', emailError);
      } else {
        console.log(`✅ Email reset password envoyé à ${email}`);
      }

      res.json({ 
        success: true, 
        message: 'If this email exists, a password reset link has been sent.' 
      });
    } catch (error) {
      console.error('Erreur forgot-password:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Reset Password: Réinitialiser avec token
app.post('/api/reset-password',
  [
    body('token').notEmpty().withMessage('Token requis'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      // Trouver l'utilisateur avec ce token
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('id, email, reset_token_expires')
        .eq('reset_token', token)
        .single();

      if (userError || !user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Vérifier l'expiration
      if (user.reset_token_expires && user.reset_token_expires < Date.now()) {
        return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Mettre à jour le mot de passe et supprimer le token
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({
          password: hashedPassword,
          reset_token: null,
          reset_token_expires: null
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur reset password:', updateError);
        return res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
      }

      console.log(`✅ Password reset réussi pour ${user.email}`);
      res.json({ success: true, message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) {
      console.error('Erreur reset-password:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur d'authentification démarré sur le port ${PORT}`);
  console.log(`📧 Email: ${process.env.RESEND_API_KEY ? `Resend actif - Envoi depuis: ${EMAIL_FROM}` : 'Inactif (configurez RESEND_API_KEY)'}`);
  if (process.env.RESEND_API_KEY) {
    if (EMAIL_FROM.includes('resend.dev')) {
      console.log(`   ⚠️  Utilisation du domaine de test Resend. Pour utiliser support@appsmobs.com, vérifiez votre domaine dans https://resend.com/domains`);
    } else {
      console.log(`   ✅ Domaine personnalisé configuré`);
    }
  }
  
  // Vérification PayPal
  console.log(`💳 PayPal: ${process.env.PAYPAL_CLIENT_ID ? '✅ Configuré' : '❌ Non configuré'} (${process.env.PAYPAL_MODE || 'sandbox'})`);
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    console.log(`   ✅ Client ID: ${process.env.PAYPAL_CLIENT_ID.substring(0, 20)}...`);
  } else {
    console.log(`   ⚠️  Ajoutez PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET dans .env`);
  }
  console.log(`🤖 reCAPTCHA: ${RECAPTCHA_SECRET ? 'Actif' : 'Mode développement'}`);
  console.log(`🔗 Supabase: ${supabaseUrl}`);
  console.log(`🎫 Licence: ${LICENSE_SERVER_URL ? 'Intégrée' : 'Non configurée'}`);
  console.log(`💬 Chat AI: ${process.env.HUGGINGFACE_API_KEY ? '✅ Hugging Face configuré (optionnel)' : '✅ Mode gratuit (réponses contextuelles intelligentes)'}`);
});

// ============================================================================
// SYSTÈME DE CODES DE RÉDUCTION
// ============================================================================

// Vérifier un code de réduction
app.post('/api/discount/verify',
  [
    body('code').trim().notEmpty().withMessage('Code requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code } = req.body;
      const authHeader = req.headers.authorization;
      const userEmail = authHeader ? (await jwt.verify(authHeader.split(' ')[1], JWT_SECRET || 'temp'))?.email : null;

      // Chercher le code dans Supabase
      const { data: discountCode, error } = await supabaseClient
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !discountCode) {
        return res.status(404).json({ error: 'Code de réduction invalide' });
      }

      // Vérifier la validité temporelle
      const now = new Date();
      if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
        return res.status(400).json({ error: 'Ce code n\'est pas encore valide' });
      }
      if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
        return res.status(400).json({ error: 'Ce code a expiré' });
      }

      // Vérifier les limites d'utilisation
      if (discountCode.max_uses !== null && discountCode.current_uses >= discountCode.max_uses) {
        return res.status(400).json({ error: 'Ce code a atteint sa limite d\'utilisation' });
      }

      // Vérifier si l'utilisateur a déjà utilisé ce code (si email fourni)
      if (userEmail) {
        const { data: usage } = await supabaseClient
          .from('discount_code_usage')
          .select('id')
          .eq('code', code.toUpperCase())
          .eq('user_email', userEmail)
          .single();

        if (usage) {
          return res.status(400).json({ error: 'Vous avez déjà utilisé ce code' });
        }
      }

      res.json({
        valid: true,
        discount_percent: discountCode.discount_percent,
        description: discountCode.description || `Réduction de ${discountCode.discount_percent}%`
      });
    } catch (error) {
      console.error('Erreur vérification code:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// Appliquer un code de réduction à une commande
app.post('/api/discount/apply',
  [
    body('code').trim().notEmpty(),
    body('order_id').notEmpty()
  ],
  async (req, res) => {
    try {
      const { code, order_id } = req.body;
      const authHeader = req.headers.authorization;
      const userEmail = authHeader ? (await jwt.verify(authHeader.split(' ')[1], JWT_SECRET || 'temp'))?.email : null;

      // Vérifier le code
      const { data: discountCode } = await supabaseClient
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (!discountCode) {
        return res.status(404).json({ error: 'Code invalide' });
      }

      // Enregistrer l'utilisation
      if (userEmail) {
        await supabaseClient
          .from('discount_code_usage')
          .insert({
            code: code.toUpperCase(),
            user_email: userEmail,
            order_id
          });

        // Incrémenter current_uses
        await supabaseClient
          .from('discount_codes')
          .update({ current_uses: discountCode.current_uses + 1 })
          .eq('id', discountCode.id);
      }

      res.json({
        success: true,
        discount_percent: discountCode.discount_percent
      });
    } catch (error) {
      console.error('Erreur application code:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// ============================================================================
// CHAT AI GRATUIT POUR LE DASHBOARD
// ============================================================================

app.post('/api/chat-ai',
  authLimiter,
  [
    body('message').trim().notEmpty().withMessage('Message requis')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message, conversation_history = [] } = req.body;
      
      // Validation du message
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const authHeader = req.headers.authorization;
      let userEmail = 'anonymous';
      try {
        if (authHeader && JWT_SECRET) {
          const token = authHeader.split(' ')[1];
          if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            userEmail = decoded.email || 'anonymous';
          }
        }
      } catch (jwtError) {
        // JWT invalide ou expiré, on continue en anonymous
        console.warn('JWT verification failed:', jwtError.message);
      }

      // Système intelligent de réponses contextuelles amélioré (ROBUSTE)
      // Toujours utiliser le système de réponses contextuelles (100% gratuit)
      let aiResult;
      
      // Utiliser Hugging Face Inference API (GRATUIT, optionnel)
      const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
      
      if (HUGGINGFACE_API_KEY) {
        try {
          // Essayer Hugging Face (gratuit avec compte)
          const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: {
                past_user_inputs: conversation_history.filter(m => m.role === 'user').slice(-3).map(m => m.content || ''),
                generated_responses: conversation_history.filter(m => m.role === 'assistant').slice(-3).map(m => m.content || ''),
                text: message
              }
            })
          });

          if (hfResponse.ok) {
            const hfData = await hfResponse.json();
            if (hfData && hfData.generated_text) {
              // Hugging Face a répondu, mais vérifier la qualité avec notre système
              aiResult = generateContextualResponse(message, conversation_history);
              // Si notre système a une meilleure confiance, utiliser la nôtre
              if (aiResult.confidence >= 0.7) {
                // Notre réponse est meilleure
              } else {
                // Hugging Face a peut-être mieux répondu, mais ajouter support suggestion si faible
                aiResult = {
                  response: hfData.generated_text,
                  confidence: 0.5, // Hugging Face - confiance moyenne
                  topic: 'general'
                };
              }
            } else {
              aiResult = generateContextualResponse(message, conversation_history);
            }
          } else {
            aiResult = generateContextualResponse(message, conversation_history);
          }
        } catch (error) {
          console.error('Hugging Face error:', error);
          aiResult = generateContextualResponse(message, conversation_history);
        }
      } else {
        // Système de réponses contextuelles amélioré (100% gratuit, pas besoin d'API)
        aiResult = generateContextualResponse(message, conversation_history);
      }
      
      // S'assurer qu'on a toujours un résultat valide
      if (!aiResult || !aiResult.response || typeof aiResult.response !== 'string') {
        aiResult = generateContextualResponse(message, conversation_history);
      }

      // Validation supplémentaire : s'assurer que la réponse n'est pas vide
      if (!aiResult || !aiResult.response || typeof aiResult.response !== 'string' || aiResult.response.trim().length === 0) {
        console.error('[CHAT AI] Empty response generated, using fallback');
        // Fallback ultime
        const isFrenchFallback = /\b(français|fr|français)\b/i.test(message.toLowerCase());
        aiResult = {
          response: isFrenchFallback
            ? 'Désolé, je rencontre des difficultés à traiter votre demande. N\'hésitez pas à reformuler votre question ou à contacter notre équipe de support. (Sorry, I\'m having trouble processing your request. Please rephrase your question or contact our support team.)'
            : 'Sorry, I\'m having trouble processing your request. Please rephrase your question or contact our support team.',
          confidence: 0.1,
          topic: 'error',
          isFrench: isFrenchFallback
        };
      }

      // Construire la réponse finale avec suggestion de support si confiance faible
      let finalResponse = aiResult.response.trim();
      const confidence = aiResult.confidence || 0;
      const shouldSuggestSupport = confidence < 0.5 || detectNeedsHuman(message.toLowerCase());

      // Ajouter suggestion de contacter le support si confiance faible ou question complexe
      if (shouldSuggestSupport || finalResponse.includes('Je ne suis pas sûr') || finalResponse.includes('I\'m not sure')) {
        const supportMessage = aiResult.isFrench 
          ? '\n\n💡 Si cela ne répond pas à votre question, n\'hésitez pas à contacter notre équipe de support. Nous sommes là pour vous aider !'
          : '\n\n💡 If this doesn\'t answer your question, please don\'t hesitate to contact our support team. We\'re here to help!';
        
        finalResponse += supportMessage;
      }

      // Détecter si le support humain est nécessaire
      const needsHuman = detectNeedsHuman(message.toLowerCase()) || 
                        detectNeedsHuman(finalResponse.toLowerCase()) ||
                        shouldSuggestSupport;

      // Logger les questions à faible confiance pour amélioration future
      if (confidence < 0.5) {
        console.log(`[CHAT AI] Low confidence response (${confidence.toFixed(2)}): "${message.substring(0, 50)}..." | User: ${userEmail}`);
        // TODO: Optionnel - sauvegarder dans Supabase pour analyse
      }

      // Validation finale avant d'envoyer la réponse
      if (!finalResponse || finalResponse.trim().length === 0) {
        console.error('[CHAT AI] Final response is empty, using emergency fallback');
        finalResponse = 'Hello! I\'m the AppsMobs assistant. How can I help you today? If your question wasn\'t answered, please contact our support team. (Bonjour ! Je suis l\'assistant AppsMobs. Comment puis-je vous aider aujourd\'hui ? Si votre question n\'a pas été répondue, veuillez contacter notre équipe de support.)';
        needsHuman = true;
      }

      res.json({
        response: finalResponse.trim(),
        needsHuman,
        confidence: confidence,
        conversation_id: `conv_${Date.now()}`
      });

    } catch (error) {
      console.error('Erreur chat AI:', error);
      console.error('Stack:', error.stack);
      // Fallback vers réponses contextuelles - toujours essayer
      try {
        const msg = message || req.body?.message || 'help';
        const hist = conversation_history || [];
        const fallbackResult = generateContextualResponse(msg, hist);
        const fallbackResponse = typeof fallbackResult === 'string' 
          ? fallbackResult 
          : fallbackResult.response || fallbackResult;
        
        // Ajouter suggestion support en cas d'erreur
        let finalFallback = typeof fallbackResponse === 'string' ? fallbackResponse : 'Je rencontre des difficultés. N\'hésitez pas à contacter notre équipe de support pour de l\'aide. (I\'m experiencing difficulties. Please don\'t hesitate to contact our support team for assistance.)';
        if (!finalFallback.includes('support') && !finalFallback.includes('contacter')) {
          finalFallback += '\n\n💡 Si cela ne répond pas à votre question, n\'hésitez pas à contacter notre équipe de support. Nous sommes là pour vous aider ! (If this doesn\'t answer your question, please don\'t hesitate to contact our support team. We\'re here to help!)';
        }
        
        res.json({
          response: finalFallback,
          needsHuman: true,
          confidence: 0.2
        });
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError);
        console.error('Fallback stack:', fallbackError.stack);
        // Dernière réponse de secours avec suggestion support
        res.json({
          response: 'Bonjour ! Je suis l\'assistant AppsMobs. AppsMobs est une application Windows pour contrôler et automatiser des appareils Android. Si votre question n\'a pas été répondue, n\'hésitez pas à contacter notre équipe de support pour de l\'aide. (Hello! I\'m the AppsMobs assistant. AppsMobs is a Windows app to control and automate Android devices. If your question wasn\'t answered, please don\'t hesitate to contact our support team for assistance.)',
          needsHuman: true,
          confidence: 0.1
        });
      }
    }
  }
);

// Système de réponses contextuelles robuste (100% gratuit, intelligent)
// Retourne: { response: string, confidence: number (0-1), topic: string, isFrench: boolean }
function generateContextualResponse(message, conversationHistory = []) {
  // Protection contre les valeurs nulles/undefined
  if (!message || typeof message !== 'string') {
    message = 'help';
  }
  if (!Array.isArray(conversationHistory)) {
    conversationHistory = [];
  }
  
  try {
    // Normaliser le message : enlever la ponctuation excessive, normaliser les espaces
    const normalizedMessage = message.trim().replace(/\s+/g, ' ').replace(/[^\w\s?.,!]/gi, '');
    const lowerMessage = normalizedMessage.toLowerCase();
    
    // Construire un contexte enrichi depuis l'historique
    const recentContext = conversationHistory.slice(-5).map(m => {
      if (m && m.content && typeof m.content === 'string') {
        return m.content.toLowerCase().trim();
      }
      return '';
    }).filter(c => c.length > 0).join(' ');
    
    const fullContext = `${recentContext} ${lowerMessage}`.trim();
    
    // Détection de langue améliorée avec plus d'indicateurs
    const frenchIndicators = /\b(c'est|qu'est|qu\'est|quoi|comment|pourquoi|salut|bonjour|merci|français|fr|prix|tarif|coût|combien|télécharger|installer|appareil|débogage|licence|comment faire|peux tu|peut on|j'aimerais|je veux|aide moi)\b/i;
    const isFrench = frenchIndicators.test(lowerMessage) || frenchIndicators.test(fullContext) || 
                     (message.match(/[àâäéèêëîïôöùûüÿç]/i) && message.length > 3); // Caractères français
    
    // Fonction helper pour détection de pattern améliorée
    const matchPattern = (patterns, text = lowerMessage, context = fullContext) => {
      if (typeof patterns === 'string') patterns = [patterns];
      
      // Vérifier chaque pattern
      for (const pattern of patterns) {
        // Si c'est une regex, l'utiliser directement
        if (pattern instanceof RegExp) {
          if (pattern.test(text) || pattern.test(context)) return true;
        } 
        // Si c'est une string, créer une recherche flexible
        else if (typeof pattern === 'string') {
          const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Recherche exacte
          if (text === pattern.toLowerCase() || text === pattern.toLowerCase() + '?' || text === pattern.toLowerCase() + '!') {
            return true;
          }
          // Recherche dans le texte (mots complets ou partiels selon le pattern)
          const regex = new RegExp(`\\b${escapedPattern}|${escapedPattern}\\b|${escapedPattern}`, 'i');
          if (regex.test(text) || regex.test(context)) return true;
        }
      }
      return false;
    };
    
    // Fonction helper pour score de confiance basé sur multiple matches
    const calculateConfidence = (baseConfidence, matches = [], contextMatches = false) => {
      let confidence = baseConfidence;
      // Bonus pour multiple matches
      if (matches.length > 1) confidence += 0.1;
      if (contextMatches) confidence += 0.15;
      // Bonus si le message est court et direct
      if (lowerMessage.length < 50 && matches.length > 0) confidence += 0.1;
      return Math.min(confidence, 0.98);
    };
    
    // Score de confiance initial (sera augmenté si on trouve un match fort)
    let confidence = 0.3; // Par défaut faible confiance
    let matchedTopic = 'general';

  // What is AppsMobs? (French and English) - HIGHEST PRIORITY: Check FIRST before everything else
  // Normaliser pour gérer "whats apps mobs" avec espaces
  const normalizedForWhatIs = lowerMessage.replace(/\s+/g, ' ').replace(/apps?\s+mobs?/gi, 'appsmobs');
  
  const whatIsPatterns = [
    /whats?\s+appmobs?/i,
    /whats?\s+appsmobs?/i,
    /what\s+is\s+appmobs?/i,
    /what\s+is\s+appsmobs?/i,
    /what\s+are\s+appmobs?/i,
    /what\s+appmobs?/i,
    /what\s+appsmobs?/i,
    /c'?est\s+quoi\s+appmobs?/i,
    /c'?est\s+quoi\s+appsmobs?/i,
    /^(appsmobs|appmobs|appsmobs\s*\?|appmobs\s*\?|what\s+appsmobs|what\s+appmobs)$/i,
    /define\s+appsmobs?/i,
    /explain\s+appsmobs?/i,
    /tell\s+me\s+about\s+appsmobs?/i,
    /^(whats?\s*appsmobs?|whats?\s*appmobs?)$/i, // "whats appsmobs" ou "whats appmobs"
    /^(what\s+is\s+appsmobs?|what\s+is\s+appmobs?)$/i // "what is appsmobs"
  ];
  
  const whatIsKeywords = [
    'qu\'est', 'qu\'est-ce', 'c\'est quoi', 'c quoi', 'what is', 'what\'s', 'whats',
    'define', 'explain appsmobs', 'appsmobs c\'est', 'what does', 'describe appsmobs',
    'tell me about', 'informations sur', 'info sur', 'information about'
  ];
  
  // Tester sur le message normalisé aussi
  const whatIsMatches = [
    ...whatIsPatterns.filter(p => p.test(lowerMessage) || p.test(normalizedForWhatIs) || p.test(fullContext)),
    ...whatIsKeywords.filter(k => lowerMessage.includes(k) || normalizedForWhatIs.includes(k) || fullContext.includes(k))
  ];
  
  // Détection spéciale pour juste "appsmobs" ou "appmobs" ou variations
  const isSimpleNameQuery = lowerMessage.trim() === 'appsmobs' || 
                            lowerMessage.trim() === 'appmobs' ||
                            lowerMessage.trim() === 'appsmobs?' ||
                            lowerMessage.trim() === 'appmobs?' ||
                            normalizedForWhatIs.includes('what') && (normalizedForWhatIs.includes('appsmobs') || normalizedForWhatIs.includes('appmobs'));
  
  // Détection améliorée pour "whats apps mobs" (avec espaces)
  const hasWhatAndAppsMobs = (lowerMessage.includes('what') || lowerMessage.includes('whats') || lowerMessage.includes('what\'s')) &&
                             (lowerMessage.includes('appsmobs') || lowerMessage.includes('appmobs') || 
                              normalizedForWhatIs.includes('appsmobs') || normalizedForWhatIs.includes('appmobs') ||
                              lowerMessage.match(/apps?\s+mobs?/i));
  
  const whatIsMatch = whatIsMatches.length > 0 || isSimpleNameQuery || hasWhatAndAppsMobs;
  
  if (whatIsMatch) {
    confidence = calculateConfidence(0.98, whatIsMatches, isSimpleNameQuery || hasWhatAndAppsMobs || recentContext.includes('what is'));
    matchedTopic = 'what_is';
    // Détecter si français ou anglais pour la réponse
    const isFrenchResponse = isFrench || /\b(français|fr|c'est|qu'est)\b/i.test(lowerMessage);
    
    if (isFrenchResponse) {
      const responses = [
        'AppsMobs est une application Windows puissante qui vous permet de contrôler un ou plusieurs appareils Android, de refléter leurs écrans avec une implémentation optimisée de scrcpy, et d\'automatiser des actions avec ou sans code. ✨ Fonctionnalités clés : contrôle multi-appareils, miroir d\'écran optimisé (2M bitrate), scripts Python d\'automatisation, reconnaissance d\'images (OpenCV), actions rapides (Wi-Fi, mode avion, navigation), et exécution locale garantissant confidentialité et performances. Tout s\'exécute sur votre PC Windows - pas besoin de cloud !',
        'AppsMobs est votre solution tout-en-un pour l\'automatisation Android ! 🚀 C\'est une application desktop Windows prête à l\'emploi (tous les outils inclus : ADB, scrcpy, Python). Elle permet de : contrôler plusieurs appareils simultanément, créer des scripts Python avec 34+ fonctions, utiliser la reconnaissance d\'images pour interagir avec n\'importe quelle app, gérer des licences flexibles. Parfait pour les débutants (interface simple) et les utilisateurs avancés (scripting complet). Tout fonctionne localement sur votre machine.',
        'AppsMobs = Automatisation Android pour Windows ! 📱💻 C\'est une application qui combine contrôle d\'appareils, miroir d\'écran optimisé (scrcpy), et scripting Python puissant. Fonctionnalités : plug-and-play (installer et utiliser), multi-appareils, 35+ fonctions d\'automatisation, reconnaissance visuelle (OpenCV), actions rapides, gestion de licences. Tout est inclus et fonctionne localement - pas d\'installation séparée de Python ou ADB nécessaire !'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: true
      };
    } else {
      const responses = [
        'AppsMobs is a powerful desktop application for Windows that allows you to control one or multiple Android devices, mirror their screens with an optimized scrcpy implementation, and automate actions with or without code. ✨ Key features: multi-device control, optimized screen mirroring (2M bitrate default), Python automation scripts, image recognition (OpenCV), quick actions (Wi-Fi toggle, airplane mode, navigation), and local execution ensuring privacy and performance. Everything runs on your Windows PC - no cloud needed!',
        'AppsMobs is your all-in-one Android automation solution! 🚀 It\'s a ready-to-use Windows desktop app (all tools included: ADB, scrcpy, Python runtime). It lets you: control multiple devices simultaneously, create Python scripts with 34+ functions, use image recognition to interact with any app, manage flexible licenses. Perfect for beginners (simple interface) and power users (full scripting capabilities). Everything runs locally on your machine.',
        'AppsMobs = Android automation for Windows! 📱💻 It\'s an app that combines device control, optimized screen mirroring (scrcpy), and powerful Python scripting. Features: plug-and-play (install and use), multi-device support, 35+ automation functions, visual recognition (OpenCV), quick actions, license management. Everything is bundled and runs locally - no separate Python or ADB installation needed!'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: false
      };
    }
  }

  // Pricing & Licenses - Check AFTER "what is" but before installation
  const pricingPatterns = [
    'price', 'prix', 'tarif', 'cost', 'coût', 'combien', 'how much', 'license', 'licence',
    'plan', 'abonnement', 'subscription', 'purchase', 'buy', 'acheter', 'pricing',
    'tarifs', 'prix des', 'prix du', 'prix de', 'combien coûte', 'combien ça coûte',
    'how much does', 'how much is', 'pricing plans', 'plans pricing', 'buy license',
    'acheter licence', 'subscription price', 'prix abonnement', 'monthly price',
    'prix mensuel', 'annual price', 'prix annuel', 'discount', 'réduction', 'promo',
    'promotion', 'code promo', 'promo code'
  ];
  
  // Exclure les questions "what is" des matches pricing
  const isWhatIsQuestion = lowerMessage.includes('what') && (lowerMessage.includes('appsmobs') || lowerMessage.includes('appmobs'));
  
  // Détection pricing améliorée - fonctionne même pour messages courts comme "price?"
  // Normaliser le message pour enlever ponctuation
  const normalizedMsg = lowerMessage.trim().replace(/[?!.,;:]+$/g, '').toLowerCase();
  
  const pricingMatches = pricingPatterns.filter(p => {
    if (isWhatIsQuestion) return false;
    const normalizedPattern = p.toLowerCase().trim();
    
    // Match exact (ex: "price?" doit matcher "price", "prix?" doit matcher "prix")
    if (normalizedMsg === normalizedPattern || 
        lowerMessage.trim().toLowerCase() === normalizedPattern + '?' ||
        lowerMessage.trim().toLowerCase() === normalizedPattern + '!' ||
        normalizedMsg === normalizedPattern) {
      return true;
    }
    
    // Match dans le texte (mots complets)
    const wordBoundaryRegex = new RegExp(`\\b${normalizedPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (wordBoundaryRegex.test(lowerMessage) || wordBoundaryRegex.test(fullContext)) {
      return true;
    }
    
    // Match simple (contenu dans le texte)
    if (lowerMessage.includes(normalizedPattern) || fullContext.includes(normalizedPattern)) {
      return true;
    }
    
    return false;
  });
  
  const pricingMatch = pricingMatches.length > 0 && !isWhatIsQuestion;
  
  if (pricingMatch) {
    confidence = calculateConfidence(0.95, pricingMatches, recentContext.includes('price') || recentContext.includes('prix'));
    matchedTopic = 'pricing';
    if (isFrench || /\b(prix|tarif|coût|combien|licence)\b/i.test(lowerMessage)) {
      const responses = [
        'AppsMobs propose trois plans : Normal (9€/mois - 1 appareil), Pro (15€/mois - 3 appareils), et Team (45€/mois - appareils illimités). Les abonnements annuels font économiser jusqu\'à 20%. Tu peux aussi utiliser des tokens pour obtenir des licences hebdomadaires gratuites. Consulte la page Pricing pour plus de détails.',
        'Nous avons des tarifs flexibles : Plan Normal à 9€/mo, Pro à 15€/mo (le plus populaire), et Team à 45€/mo. Les abonnements annuels incluent des réductions. Tu peux également utiliser des tokens de parrainage pour obtenir des semaines gratuites. Quel plan correspond à tes besoins ?',
        'Les licences commencent à 9€/mois pour le plan Normal. Pro (15€/mo) supporte 3 appareils, et Team (45€/mo) est illimité. Tous les plans incluent toutes les fonctionnalités - la différence réside dans les limites d\'appareils et le niveau de support. Les plans annuels te font économiser de l\'argent ! 🎁',
        'Tarifs AppsMobs : 💰 Normal = 9€/mois (1 appareil), Pro = 15€/mois (3 appareils), Team = 45€/mois (illimité). Réductions jusqu\'à 20% pour les abonnements annuels. Tu peux aussi gagner des tokens gratuits avec le système de parrainage ! Consulte notre page Pricing pour les détails complets.'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: true
      };
    } else {
      const responses = [
        'AppsMobs offers three plans: Normal (€9/month - 1 device), Pro (€15/month - 3 devices), and Team (€45/month - unlimited devices). Annual subscriptions save up to 20%. You can also redeem tokens for weekly licenses. Check the Pricing page for details.',
        'We have flexible pricing: Normal plan for €9/mo, Pro at €15/mo (most popular), and Team at €45/mo. Annual subscriptions include discounts. You can also use referral tokens to get free weeks. Which plan fits your needs?',
        'Licenses start at €9/month for the Normal plan. Pro (€15/mo) supports 3 devices, and Team (€45/mo) is unlimited. All plans include all features - the difference is device limits and support level. Annual plans save you money!'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: false
      };
    }
  }

  // Installation & Setup (French and English) - Vérifié APRÈS "What is AppsMobs"
  const installPatterns = [
    'install', 'setup', 'download', 'how to start', 'télécharger', 'installer',
    'get started', 'commencer', 'how to install', 'comment installer', 'how do i install',
    'setup guide', 'installation guide', 'getting started', 'débuter', 'démarrer',
    'how to get', 'where to download', 'où télécharger', 'download link', 'lien de téléchargement',
    'installer apps', 'installer appmobs', 'install appsmobs', 'how to setup'
  ];
  const installMatches = installPatterns.filter(p => matchPattern(p));
  const installMatch = installMatches.length > 0;
  
  if (installMatch) {
    confidence = calculateConfidence(0.9, installMatches, recentContext.includes('install') || recentContext.includes('setup'));
    matchedTopic = 'installation';
    if (isFrench) {
      const responses = [
        'Pour installer AppsMobs, télécharge l\'installeur Windows depuis notre page Téléchargement. Une fois téléchargé, exécute l\'installeur et suis l\'assistant de configuration. Assure-toi que le débogage USB est activé sur ton appareil Android avant de le connecter. Besoin d\'aide pour activer le débogage USB ?',
        'L\'installation est simple : 1) Télécharge l\'installeur, 2) Exécute-le et suis les instructions, 3) Active le débogage USB sur ton appareil Android (Paramètres → À propos du téléphone → Appuie 7 fois sur Numéro de build), 4) Connecte ton appareil via USB. Consulte notre guide de démarrage pour les étapes détaillées.',
        'Pour l\'installation, tu auras besoin de : PC Windows, appareil Android, et câble USB. Télécharge AppsMobs, installe-le, active le débogage USB sur ton appareil, puis connecte. L\'app détectera automatiquement ton appareil. As-tu déjà activé les options développeur ?'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: true
      };
    } else {
      const responses = [
        'To install AppsMobs, download the Windows installer from our Download page. Once downloaded, run the installer and follow the setup wizard. Make sure USB debugging is enabled on your Android device before connecting. Need help enabling USB debugging?',
        'Installation is straightforward: 1) Download the installer, 2) Run it and follow the prompts, 3) Enable USB debugging on your Android device (Settings → About Phone → Tap Build Number 7 times), 4) Connect your device via USB. Check our Getting Started guide for detailed steps.',
        'For installation, you\'ll need: Windows PC, Android device, and USB cable. Download AppsMobs, install it, enable USB debugging on your device, then connect. The app will detect your device automatically. Have you enabled developer options yet?'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: false
      };
    }
  }

  // USB Debugging & Connection
  const usbPatterns = [
    'usb debug', 'debugging', 'developer option', 'connect device', 'device not found',
    'connexion', 'connecter', 'usb debugging', 'enable usb', 'activate usb',
    'device connection', 'device connected', 'connect android', 'connecter android',
    'device detected', 'appareil détecté', 'not detected', 'pas détecté',
    'build number', 'numéro de build', 'developer options', 'options développeur'
  ];
  const usbMatches = usbPatterns.filter(p => matchPattern(p));
  if (usbMatches.length > 0) {
    confidence = calculateConfidence(0.85, usbMatches, recentContext.includes('usb') || recentContext.includes('connect'));
    matchedTopic = 'connection';
    const responses = [
      'To enable USB debugging: Go to Settings → About Phone → Tap "Build Number" 7 times. Then go back to Settings → Developer Options → Enable "USB Debugging". Connect your device via USB and accept the prompt on your phone.',
      'If your device isn\'t detected, check: 1) USB debugging is enabled, 2) You\'ve accepted the USB debugging prompt on your phone, 3) USB cable is data-capable (not charging-only), 4) Try a different USB port. Need more help?',
      'USB debugging allows your computer to control your Android device. Enable it in Developer Options (tap Build Number 7 times in About Phone). Once connected, you should see your device in the AppsMobs Dashboard.'
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: confidence,
      topic: matchedTopic,
      isFrench: isFrench
    };
  }

  // Scripts & Automation
  const scriptPatterns = [
    'script', 'automation', 'python', 'playground', 'function', 'fonction',
    'create script', 'écrire script', 'how to script', 'comment créer',
    'python script', 'automation script', 'script example', 'exemple script',
    'write script', 'écrire un script', 'scripting', 'automation tool',
    'automatiser', 'automatisation', 'functions list', 'liste fonctions'
  ];
  const scriptMatches = scriptPatterns.filter(p => matchPattern(p));
  if (scriptMatches.length > 0) {
    confidence = calculateConfidence(0.9, scriptMatches, recentContext.includes('script') || recentContext.includes('python'));
    matchedTopic = 'scripts';
    const responses = [
      'AppsMobs scripts use Python with image detection (OpenCV). You can find all available functions in the Playground documentation. Functions include: click, swipe, find images, wait, screenshot, and more. Need help with a specific function?',
      'To create scripts: Write Python code using AppsMobs functions. Place images in the "img" folder for image detection. Check the Scripts documentation for structure and examples. The Playground section lists all 34+ available functions with examples.',
      'Scripts use computer vision to detect UI elements. Place reference images in the img/ folder, then use functions like Find() or FindPosClick() to interact with your device. All functions are documented in the Playground section. What would you like to automate?'
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: confidence,
      topic: matchedTopic,
      isFrench: isFrench
    };
  }

  // Errors & Troubleshooting
  const errorPatterns = [
    'error', 'problem', 'issue', 'not work', 'broken', 'fix', 'erreur', 'problème', 'marche pas',
    'doesn\'t work', 'ne marche pas', 'not working', 'pas de travail', 'help problem',
    'help error', 'aide problème', 'troubleshooting', 'dépannage', 'solve issue',
    'résoudre problème', 'how to fix', 'comment réparer', 'bug', 'glitch',
    'something wrong', 'quelque chose ne va pas', 'need help', 'besoin d\'aide'
  ];
  const errorMatches = errorPatterns.filter(p => matchPattern(p));
  if (errorMatches.length > 0) {
    confidence = calculateConfidence(0.85, errorMatches, recentContext.includes('error') || recentContext.includes('problem'));
    matchedTopic = 'troubleshooting';
    const responses = [
      'I\'m sorry you\'re experiencing issues. Let\'s troubleshoot: 1) Check if your device appears in the Dashboard, 2) Verify USB debugging is enabled, 3) Try restarting AppsMobs and your device, 4) Check the device connection. If it persists, contact support with error details.',
      'For troubleshooting: Ensure your device is properly connected, USB debugging is enabled, and you\'ve accepted the debugging prompt. Try disconnecting and reconnecting the USB cable. If the issue continues, contact our support team with the specific error message.',
      'Common fixes: Restart AppsMobs, reconnect USB cable, disable and re-enable USB debugging, check Windows USB drivers. If problems persist, create a support ticket in the Dashboard with error details and screenshots if possible.'
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: confidence,
      topic: matchedTopic,
      isFrench: isFrench
    };
  }

  // Image Detection
  const imagePatterns = [
    'image', 'detect', 'find', 'screenshot', 'opencv', 'détection', 'trouver',
    'image detection', 'détection image', 'find image', 'trouver image',
    'detect image', 'image recognition', 'reconnaissance image', 'template matching',
    'find button', 'trouver bouton', 'detect element', 'détecter élément'
  ];
  const imageMatches = imagePatterns.filter(p => matchPattern(p));
  if (imageMatches.length > 0) {
    confidence = calculateConfidence(0.85, imageMatches, recentContext.includes('image') || recentContext.includes('detect'));
    matchedTopic = 'image_detection';
    const responses = [
      'Image detection uses OpenCV template matching. Place reference images in the img/ folder, then use Find(), Findd(), or FindPosClick() functions. The system searches for these images on your device screen. Make sure images are clear and unique for best results.',
      'For image detection: Capture screenshots of UI elements you want to interact with, save them in the img/ folder, then reference them in your scripts. Use confidence thresholds (default 0.8) to adjust detection sensitivity. Need help with a specific detection?'
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: confidence,
      topic: matchedTopic,
      isFrench: isFrench
    };
  }

  // Functions & API
  const functionPatterns = [
    'function', 'api', 'how to use', 'example', 'exemple', 'utiliser',
    'functions list', 'liste fonctions', 'available functions', 'fonctions disponibles',
    'function example', 'exemple fonction', 'how function', 'comment utiliser fonction',
    'api functions', 'fonctions api', 'use function', 'appeler fonction'
  ];
  const functionMatches = functionPatterns.filter(p => matchPattern(p));
  if (functionMatches.length > 0) {
    confidence = calculateConfidence(0.8, functionMatches, recentContext.includes('function') || recentContext.includes('api'));
    matchedTopic = 'functions';
    const responses = [
      'AppsMobs has 34+ functions available. Common ones: Click(x, y), Swipe(), Find(image), Write(text), Sleep(seconds). Check the Playground documentation for the complete list with examples and parameters. What function are you interested in?',
      'You can use functions like: Click() for taps, Swipe() for scrolling, Find() to detect images, Write() to type text, and many more. Each function is documented in Playground with code examples. Which function do you want to learn about?'
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: confidence,
      topic: matchedTopic,
      isFrench: isFrench
    };
  }

  // Features & Capabilities
  const featurePatterns = [
    'feature', 'fonctionnalité', 'capability', 'peut', 'can do', 'que peut', 'what can',
    'features', 'fonctionnalités', 'what does', 'que fait', 'capabilities',
    'what can do', 'que peut faire', 'what features', 'quelles fonctionnalités',
    'what offers', 'ce que offre', 'has features', 'a fonctionnalités'
  ];
  const featureMatches = featurePatterns.filter(p => matchPattern(p));
  if (featureMatches.length > 0) {
    confidence = calculateConfidence(0.9, featureMatches, recentContext.includes('feature') || recentContext.includes('what can'));
    matchedTopic = 'features';
    if (isFrench) {
      const responses = [
        'AppsMobs offre de nombreuses fonctionnalités : ✨ Contrôle multi-appareils simultané, miroir d\'écran optimisé (scrcpy avec bitrate 2M), scripts Python avec 35+ fonctions (click, swipe, find images, write, etc.), reconnaissance d\'images (OpenCV) pour détecter des éléments UI, actions rapides (Wi-Fi, mode avion, volume), gestion de licences flexible, et tout fonctionne localement sur votre PC Windows. Aucun outil externe à installer !',
        'Voici ce qu\'AppsMobs peut faire : 🎯 Contrôler plusieurs appareils Android en même temps, refléter les écrans avec un scrcpy optimisé, créer et exécuter des scripts Python d\'automatisation, utiliser la vision par ordinateur pour détecter et cliquer sur des images, actions rapides depuis l\'interface, et gérer vos licences. Tout est inclus dans l\'installeur Windows - ADB, scrcpy et Python sont déjà là !',
        'Fonctionnalités principales AppsMobs : 📱 Contrôle d\'appareils Android, 🔄 Miroir d\'écran en temps réel (scrcpy), 🤖 Automatisation Python (34+ fonctions), 👁️ Reconnaissance d\'images (OpenCV), ⚡ Actions rapides (Wi-Fi, mode avion, navigation), 📜 Éditeur de scripts intégré, 🔐 Gestion de licences sécurisée. Parfait pour automatiser des tâches répétitives sur Android !'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: true
      };
    } else {
      const responses = [
        'AppsMobs offers many features: ✨ Simultaneous multi-device control, optimized screen mirroring (scrcpy with 2M bitrate), Python scripts with 35+ functions (click, swipe, find images, write, etc.), image recognition (OpenCV) to detect UI elements, quick actions (Wi-Fi, airplane mode, volume), flexible license management, and everything runs locally on your Windows PC. No external tools to install!',
        'Here\'s what AppsMobs can do: 🎯 Control multiple Android devices simultaneously, mirror screens with optimized scrcpy, create and run Python automation scripts, use computer vision to detect and click on images, quick actions from the interface, and manage your licenses. Everything is included in the Windows installer - ADB, scrcpy and Python are already there!',
        'Main AppsMobs features: 📱 Android device control, 🔄 Real-time screen mirroring (scrcpy), 🤖 Python automation (34+ functions), 👁️ Image recognition (OpenCV), ⚡ Quick actions (Wi-Fi, airplane mode, navigation), 📜 Built-in script editor, 🔐 Secure license management. Perfect for automating repetitive tasks on Android!'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: false
      };
    }
  }

  // General help
  const helpPatterns = [
    'help', 'aide', 'how', 'comment', 'guide', 'help me', 'aide moi',
    'need help', 'besoin aide', 'how can', 'comment puis', 'how to',
    'comment faire', 'can you help', 'peux tu aider', 'assistance',
    'support', 'documentation', 'tutorial', 'tutoriel', 'guide me'
  ];
  const helpMatches = helpPatterns.filter(p => matchPattern(p));
  if (helpMatches.length > 0) {
    confidence = calculateConfidence(0.85, helpMatches, recentContext.includes('help') || recentContext.includes('aide'));
    matchedTopic = 'help';
    if (isFrench) {
      const responses = [
        'Je suis là pour t\'aider avec AppsMobs ! Je peux assister avec l\'installation, les scripts, la connexion d\'appareils, les licences, les fonctions, et le dépannage. Que veux-tu savoir ?',
        'AppsMobs est un outil d\'automatisation Android. Tu peux automatiser des tâches en utilisant des scripts Python avec détection d\'images. Commence par le guide Getting Started, puis explore le Playground pour voir toutes les fonctions disponibles. En quoi puis-je t\'aider ?',
        'Je peux t\'aider avec : configurer AppsMobs, écrire des scripts d\'automatisation, connecter des appareils, comprendre les fonctions, les tarifs, et le dépannage. Consulte notre documentation pour des guides détaillés. Quelle est ta question ?'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: true
      };
    } else {
      const responses = [
        'I\'m here to help with AppsMobs! I can assist with installation, scripts, device connection, licenses, functions, and troubleshooting. What would you like to know?',
        'AppsMobs is an Android automation tool. You can automate tasks using Python scripts with image detection. Start with the Getting Started guide, then explore the Playground for available functions. What can I help you with?',
        'I can help you with: setting up AppsMobs, writing automation scripts, connecting devices, understanding functions, pricing, and troubleshooting. Check our documentation for detailed guides. What\'s your question?'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: false
      };
    }
  }


  // Greetings (French and English) - Amélioré avec plus de variations
  const greetingPatterns = [
    /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|salut|bonjour|bonsoir)[\s,!.?]*$/i,
    /^(hi there|hello there|hey there|hey you)[\s,!.?]*$/i,
    /^(sup|yo|wassup|waddup)[\s,!.?]*$/i,
    /^(salut|bonjour|bonsoir|bonne (journée|soirée))[\s,!.?]*$/i
  ];
  const greetingMatch = greetingPatterns.some(p => p.test(lowerMessage.trim()));
  
  if (greetingMatch) {
    confidence = calculateConfidence(0.9, [], true);
    matchedTopic = 'greeting';
    if (isFrench) {
      const responses = [
        'Salut ! 👋 Je suis l\'assistant AppsMobs. Comment puis-je t\'aider aujourd\'hui ? Tu peux me poser des questions sur l\'installation, les scripts, les licences, ou n\'importe quelle fonctionnalité AppsMobs !',
        'Bonjour ! Je suis là pour t\'aider avec AppsMobs. Que veux-tu savoir ? Je peux t\'aider avec l\'installation, les scripts, le dépannage et plus encore !',
        'Hey ! Bienvenue sur le support AppsMobs. N\'hésite pas à me poser des questions sur l\'app, les scripts ou pour commencer !'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: true
      };
    } else {
      const responses = [
        'Hello! 👋 I\'m your AppsMobs assistant. How can I help you today? You can ask about installation, scripts, licenses, or any AppsMobs feature!',
        'Hi there! I\'m here to help with AppsMobs. What would you like to know? I can help with setup, scripts, troubleshooting, and more!',
        'Hey! Welcome to AppsMobs support. Feel free to ask me anything about the app, scripts, or getting started!'
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        confidence: confidence,
        topic: matchedTopic,
        isFrench: false
      };
    }
  }

  // Default intelligent response (French and English) - Faible confiance, suggère support
  confidence = 0.3; // Faible confiance pour réponses génériques
  matchedTopic = 'general';
  const defaultResponses = isFrench ? [
    'Je comprends que tu demandes à propos d\'AppsMobs. Peux-tu fournir plus de détails ? Je peux aider avec l\'installation, les scripts, la connexion d\'appareils, les licences, les fonctions, ou le dépannage.',
    'C\'est une question intéressante ! Pour mieux t\'aider, peux-tu préciser ce que tu veux savoir ? Je me spécialise dans les fonctionnalités AppsMobs, les scripts, l\'installation et le dépannage.',
    'Je suis là pour t\'aider ! Pourrais-tu être plus spécifique sur ce dont tu as besoin ? Je peux assister avec : guides d\'installation, création de scripts, gestion d\'appareils, tarifs, ou support technique.',
    'Laisse-moi t\'aider ! AppsMobs peut automatiser des tâches Android en utilisant des scripts Python. Que veux-tu savoir précisément ? Consulte notre documentation ou demande-moi des détails sur n\'importe quelle fonctionnalité.'
  ] : [
    'I understand you\'re asking about AppsMobs. Could you provide more details? I can help with installation, scripts, device connection, licenses, functions, or troubleshooting.',
    'That\'s an interesting question! To help you better, could you clarify what you\'d like to know? I specialize in AppsMobs features, scripts, setup, and troubleshooting.',
    'I\'m here to help! Could you be more specific about what you need? I can assist with: setup guides, script creation, device management, pricing, or technical support.',
    'Let me help you with that! AppsMobs can automate Android tasks using Python scripts. What specifically would you like to know? Check our documentation or ask me for details on any feature.'
  ];
  return {
    response: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    confidence: confidence,
    topic: matchedTopic,
    isFrench: isFrench
  };
  } catch (error) {
    // Si une erreur survient dans la fonction, retourner une réponse de secours avec suggestion support
    console.error('Error in generateContextualResponse:', error);
    return {
      response: 'AppsMobs est une application Windows pour contrôler et automatiser des appareils Android avec Python. Que souhaitez-vous savoir ? Si votre question n\'a pas été répondue, n\'hésitez pas à contacter notre équipe de support. (AppsMobs is a Windows app to control and automate Android devices with Python. What would you like to know? If your question wasn\'t answered, please don\'t hesitate to contact our support team.)',
      confidence: 0.2,
      topic: 'error',
      isFrench: false
    };
  }
}

// Détecter si le support humain est nécessaire
function detectNeedsHuman(message) {
  const humanKeywords = [
    'refund', 'cancel', 'billing', 'payment issue',
    'critical bug', 'data loss', 'security', 'hack',
    'urgent', 'asap', 'immediately'
  ];
  return humanKeywords.some(keyword => message.includes(keyword));
}
