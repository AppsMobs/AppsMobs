/**
 * Script pour obfusquer l'URL du serveur de licence dans le code
 * Utilise une simple transformation pour rendre l'URL moins visible
 */

const fs = require('fs');
const path = require('path');

// Encoder l'URL en base64 puis l'obfusquer
function obfuscateUrl(url) {
  // Encoder en base64
  const encoded = Buffer.from(url).toString('base64');
  // Ajouter un peu d'obfuscation
  return encoded.split('').reverse().join('');
}

// Décoder l'URL obfusquée
function deobfuscateUrl(obfuscated) {
  try {
    const reversed = obfuscated.split('').reverse().join('');
    return Buffer.from(reversed, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

// URL par défaut (obfusquée)
const DEFAULT_URL = 'https://encoikswoojgqilbdkwy.supabase.co/functions/v1/license';
const OBFUSCATED_URL = obfuscateUrl(DEFAULT_URL);

// Générer le code obfusqué
const obfuscatedCode = `
// URL obfusquée (désobfusquée à l'exécution)
const OBFUSCATED_LICENSE_URL = '${OBFUSCATED_URL}';
function deobfuscateUrl(obfuscated) {
  try {
    const reversed = obfuscated.split('').reverse().join('');
    return Buffer.from(reversed, 'base64').toString('utf8');
  } catch {
    return null;
  }
}
`;

console.log('URL obfusquée:', OBFUSCATED_URL);
console.log('Code généré:', obfuscatedCode);

// Export pour utilisation
module.exports = { obfuscateUrl, deobfuscateUrl, OBFUSCATED_URL };

