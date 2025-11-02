import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'If this email exists, a password reset link has been sent to your inbox.');
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
            <p className="text-white/60">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-300">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill cyan w-full justify-center disabled:opacity-50"
            >
              <span className="btn-label">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-cyan hover:text-cyan/80 text-sm">
              Back to Login
            </Link>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <p className="text-xs text-yellow-300">
              <strong>Note:</strong> If you don't receive an email within a few minutes, check your spam folder.
              The reset link expires in 1 hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

