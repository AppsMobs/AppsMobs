import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Invalid or expired reset token. Please request a new one.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
            <p className="text-white/60 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <a href="/forgot-password" className="btn-pill cyan">
              Request New Reset Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-white/60">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-pill cyan w-full justify-center disabled:opacity-50"
            >
              <span className="btn-label">
                {loading ? 'Resetting...' : success ? 'Success!' : 'Reset Password'}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-cyan hover:text-cyan/80 text-sm">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

