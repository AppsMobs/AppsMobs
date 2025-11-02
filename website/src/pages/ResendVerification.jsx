import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Erreur lors du renvoi de l\'email');
        return;
      }

      setStatus('success');
      setMessage('Email de vérification renvoyé avec succès !');
    } catch (err) {
      setStatus('error');
      setMessage('Erreur de connexion. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass rounded-lg p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Renvoyer l'email de vérification
          </h2>
          <p className="text-center text-gray-400">
            Entrez votre email pour recevoir un nouveau lien
          </p>
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded ${
              status === 'success'
                ? 'bg-green-500/20 border border-green-500 text-green-300'
                : 'bg-red-500/20 border border-red-500 text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
              placeholder="vous@email.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-cyan text-bg font-semibold py-3 px-4 rounded-md hover:bg-cyan/90 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? 'Envoi en cours...' : 'Renvoyer l\'email'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm text-cyan hover:text-cyan/80">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

