import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: '',
    referralCode: ''
  });

  // Préremplir le code de parrainage depuis l'URL
  useEffect(() => {
    if (referralCode) {
      // Normaliser le code (ajouter REF- si absent, nettoyer)
      const normalized = referralCode.toUpperCase().replace(/^REF-?/, '').replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, referralCode: normalized ? `REF-${normalized}` : '' }));
    }
  }, [referralCode]);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    // Vérifier reCAPTCHA si configuré ET en production (pas en développement local)
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const isDevelopment = import.meta.env.DEV;
    
    if (recaptchaSiteKey && !isDevelopment && !recaptchaToken) {
      setError('Veuillez compléter la vérification reCAPTCHA');
      setLoading(false);
      return;
    }

    try {
      console.log('Tentative d\'inscription vers:', `${API_URL}/api/register`);
      
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          country: formData.country,
          // Envoyer le token seulement si on est en production et qu'il existe
          ...(recaptchaToken && !isDevelopment ? { recaptchaToken } : {})
        })
      });

      console.log('Réponse du serveur:', response.status, response.statusText);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        setError(`Erreur serveur ${response.status}: ${response.statusText}. Vérifiez que le backend est démarré.`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        // Messages d'erreur génériques pour éviter information leakage
        let errorMsg = 'Erreur lors de l\'inscription';
        if (data.error) {
          if (data.error.includes('déjà enregistré') || data.error.includes('existe')) {
            errorMsg = 'Cet email est déjà utilisé';
          } else if (data.errors && data.errors.length > 0) {
            errorMsg = data.errors[0].msg || 'Données invalides';
          } else {
            errorMsg = data.error;
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Appliquer le code de parrainage si présent (depuis l'URL ou le champ)
      const codeToApply = formData.referralCode?.trim().toUpperCase() || referralCode;
      if (codeToApply && formData.email) {
        try {
          const refResponse = await fetch(`${API_URL}/api/apply-referral-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              code: codeToApply,
              email: formData.email
            })
          });
          // Ne pas bloquer l'inscription si le code échoue
          if (refResponse.ok) {
            console.log('Referral code applied successfully');
          } else {
            const refData = await refResponse.json();
            console.log('Referral code application failed:', refData.error);
            // Ne pas bloquer l'inscription, juste logger l'erreur
          }
        } catch (refError) {
          console.log('Referral code application skipped:', refError);
        }
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Erreur inscription:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError(`Impossible de joindre le serveur sur ${API_URL}. Vérifiez que le backend est démarré avec "npm run dev" dans website/auth-backend`);
      } else {
        setError(`Erreur: ${err.message || 'Erreur de connexion'}`);
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 glass rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✉️</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Vérifiez votre email !
          </h2>
          <p className="text-gray-300 mb-6">
            Nous avons envoyé un lien de vérification à <strong>{formData.email}</strong>
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Cliquez sur le lien dans l'email pour activer votre compte. 
            Le lien expirera dans 24 heures.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-block bg-cyan text-bg font-semibold py-2 px-6 rounded-md hover:bg-cyan/90 transition-colors"
            >
              Aller à la connexion
            </Link>
            <p className="text-sm text-gray-400">
              Pas reçu l'email ?{' '}
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({ ...formData, password: '', confirmPassword: '' });
                }}
                className="text-cyan hover:text-cyan/80"
              >
                Réessayer
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass rounded-lg p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Créer un compte
          </h2>
          <p className="text-center text-gray-400">
            Rejoignez BootyBot dès aujourd'hui
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
        <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  Prénom *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                  placeholder="Jean"
                />
        </div>
        <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Adresse email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                placeholder="vous@email.com"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                Pays *
              </label>
              <select
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
              >
                <option value="">Sélectionnez votre pays</option>
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="CA">Canada</option>
                <option value="US">États-Unis</option>
                <option value="GB">Royaume-Uni</option>
                <option value="DE">Allemagne</option>
                <option value="ES">Espagne</option>
                <option value="IT">Italie</option>
                <option value="PT">Portugal</option>
                <option value="NL">Pays-Bas</option>
                <option value="AU">Australie</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                placeholder="Au moins 8 caractères"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 caractères
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                placeholder="Répétez le mot de passe"
              />
            </div>

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-1">
                Code de parrainage <span className="text-gray-500 text-xs">(optionnel)</span>
              </label>
              <div className="flex items-center">
                <span className="bg-black/20 border border-r-0 border-white/10 rounded-l-md px-4 py-2 text-white/80 font-mono text-sm">
                  REF-
                </span>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode.replace(/^REF-/i, '')}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    setFormData({ ...formData, referralCode: value ? `REF-${value}` : '' });
                  }}
                  className="flex-1 bg-black/20 border border-white/10 rounded-r-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent font-mono"
                  placeholder="XXXXXXXX"
                  maxLength={12}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Entrez le code de parrainage d'un ami pour gagner 10 tokens après son premier achat
              </p>
            </div>
          </div>

          {/* reCAPTCHA - affiché seulement si configuré ET en production (pas en développement local) */}
          {import.meta.env.VITE_RECAPTCHA_SITE_KEY && !import.meta.env.DEV && (
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan text-bg font-semibold py-3 px-4 rounded-md hover:bg-cyan/90 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Création du compte...' : 'S\'inscrire'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-cyan hover:text-cyan/80 font-medium">
                Se connecter
              </Link>
            </p>
        </div>
      </form>
      </div>
    </div>
  );
}
