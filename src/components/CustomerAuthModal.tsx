import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Lock, LogOut, CheckCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { STORE_CENTRE_INFO } from '../data/clothingData';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders
}) => {
  const { user, profile, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error('Please enter your full name');
        }
        await signUpWithEmail(email, password, displayName, 'customer');
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = err.message || 'An error occurred during authentication.';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (message.includes('auth/email-already-in-use')) {
        message = 'This email is already registered. Please sign in instead.';
      } else if (message.includes('auth/weak-password')) {
        message = 'Password should be at least 6 characters long.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle('customer');
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onClose();
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-display text-white">
                {user ? 'My Customer Account' : (mode === 'login' ? 'Customer Sign In' : 'Create Account')}
              </h2>
              <p className="text-[11px] text-stone-400">
                {STORE_CENTRE_INFO.name} · Oddanchatram
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {user ? (
            /* Logged-in profile view */
            <div className="space-y-5">
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-lg shadow-2xs">
                  {profile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-stone-900 text-sm truncate">
                    {profile?.displayName || 'Customer'}
                  </h3>
                  <p className="text-xs text-stone-600 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                    Boutique Customer
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {onOpenOrders && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOrders();
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 transition-colors text-xs font-semibold cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span>View My Orders & Track Receipts</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign in / Register form */
            <div>
              {/* Tab toggle */}
              <div className="flex rounded-xl bg-stone-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'login' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'register' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Register
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyadarshini"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? 'Processing...' : (mode === 'login' ? 'Sign In to Storefront' : 'Create Customer Account')}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-stone-400">
                  <span className="bg-white px-2">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2 px-3 border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
