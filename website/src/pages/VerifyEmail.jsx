import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Erreur lors de la vérification');
        return;
      }

      setStatus('success');
      setMessage('Votre email a été vérifié avec succès !');
    } catch (err) {
      setStatus('error');
      setMessage('Erreur de connexion. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass rounded-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Vérification en cours...
            </h2>
            <p className="text-gray-300">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Email vérifié !
            </h2>
            <p className="text-gray-300 mb-6">
              {message}
            </p>
            <Link
              to="/login"
              className="inline-block bg-cyan text-bg font-semibold py-2 px-6 rounded-md hover:bg-cyan/90 transition-colors"
            >
              Se connecter
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Erreur de vérification
            </h2>
            <p className="text-gray-300 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-block bg-cyan text-bg font-semibold py-2 px-6 rounded-md hover:bg-cyan/90 transition-colors"
              >
                Aller à la connexion
              </Link>
              <p className="text-sm text-gray-400">
                Besoin d'un nouveau lien de vérification ?{' '}
                <Link to="/resend-verification" className="text-cyan hover:text-cyan/80">
                  Renvoyer l'email
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

