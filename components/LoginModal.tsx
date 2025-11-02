import React, { useState } from 'react';
import { XIcon } from './Icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, fullName: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onPasswordReset,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else if (mode === 'register') {
        await onRegister(email, password, fullName);
      } else if (mode === 'reset') {
        await onPasswordReset(email);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'reset' && 'Reset Password'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-600"
                  required
                  minLength={8}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : 'Send Reset Email'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <>
                <span className="text-gray-400">Don't have an account? </span>
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign up
                </button>
                <span className="text-gray-400 mx-2">|</span>
                <button
                  onClick={() => setMode('reset')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === 'register' && (
              <>
                <span className="text-gray-400">Already have an account? </span>
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign in
                </button>
              </>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => setMode('login')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

