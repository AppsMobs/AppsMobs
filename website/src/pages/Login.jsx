import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [error, setError] = useState('');
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

    // Vérifier reCAPTCHA si configuré ET en production (pas en développement local)
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const isDevelopment = import.meta.env.DEV;
    
    if (recaptchaSiteKey && !isDevelopment && !recaptchaToken) {
      setError('Veuillez compléter la vérification reCAPTCHA');
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        email: formData.email,
        password: formData.password,
        // Envoyer le token seulement si on est en production et qu'il existe
        ...(recaptchaToken && !isDevelopment ? { recaptchaToken } : {})
      };
      
      // Debug en développement
      if (import.meta.env.DEV) {
        console.log('📤 Envoi requête login:', {
          email: requestBody.email,
          password: requestBody.password ? '***' : 'MANQUANT',
          recaptchaToken: requestBody.recaptchaToken ? 'OUI' : 'NON'
        });
      }

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Gérer les erreurs réseau
      if (!response.ok && response.status === 0) {
        setError(`Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${API_URL}`);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.');
        } else if (data.needsVerification) {
          setError('Veuillez vérifier votre email avant de vous connecter. Vérifiez votre boîte de réception.');
        } else if (response.status === 400 && data.errors) {
          // Erreur de validation - afficher les détails en dev
          const errorMessages = data.errors.map(e => e.msg).join(', ');
          setError(`Erreur de validation: ${errorMessages}`);
          console.error('Erreurs de validation:', data.errors);
        } else {
          // Message d'erreur générique pour éviter information leakage
          const genericError = data.error?.includes('incorrect') || data.error?.includes('Email') 
            ? 'Email ou mot de passe incorrect' 
            : data.error || 'Erreur lors de la connexion';
          setError(genericError);
        }
        setLoading(false);
        return;
      }

      // Sauvegarder le token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Rediriger vers la page d'accueil
      navigate('/');
      window.location.reload(); // Rafraîchir pour mettre à jour l'état d'authentification
    } catch (err) {
      // Gérer les erreurs réseau spécifiques
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError(`Erreur réseau: Impossible de contacter le serveur. Vérifiez que le backend est démarré sur ${API_URL}`);
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
      console.error('Erreur connexion:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass rounded-lg p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Connexion
          </h2>
          <p className="text-center text-gray-400">
            Connectez-vous à votre compte BootyBot
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Adresse email
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                placeholder="••••••••"
              />
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan hover:text-cyan/80 font-medium">
                Sign up
              </Link>
            </p>
            <Link to="/forgot-password" className="text-sm text-cyan hover:text-cyan/80">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

