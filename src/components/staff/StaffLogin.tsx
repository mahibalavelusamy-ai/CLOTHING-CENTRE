import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { STORE_CENTRE_INFO } from '../../data/clothingData';
import { BOOTSTRAPPED_ADMIN_EMAIL, getAuthErrorMessage } from '../../lib/firebase';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  Store, 
  ArrowLeft,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export const StaffLogin: React.FC = () => {
  const { user, isStaff, signInWithEmail, signInWithGoogle, loading, signOutUser, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/staff/dashboard';

  useEffect(() => {
    if (!loading && user && isStaff) {
      navigate(from, { replace: true });
    }
  }, [user, isStaff, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setSubmitting(true);

    try {
      if (isResetMode) {
        if (!email.trim()) {
          throw new Error('Please enter your staff email address');
        }
        await sendPasswordReset(email);
        setSuccessNotice('Password reset instructions sent. Please check your email inbox.');
      } else {
        await signInWithEmail(email, password);
        // Auth listener will evaluate isStaff and navigate
      }
    } catch (err: any) {
      console.error('Staff auth error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessNotice(null);
    setSubmitting(true);
    try {
      await signInWithGoogle('customer'); // Role resolution handles admin/staff
    } catch (err: any) {
      console.error('Staff Google login error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Return to storefront link */}
      <div className="absolute top-6 left-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-pink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </a>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink/10 border border-pink/30 text-pink mb-4 shadow-lg shadow-pink/10">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold font-serif-display text-text tracking-wide">
          Yaazh Boutique
        </h1>
        <p className="mt-1 text-xs text-pink font-semibold uppercase tracking-wider">
          Staff & Administration Portal
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Oddanchatram · Inventory, Pricing & Orders Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-border">
          {successNotice && (
            <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="leading-relaxed">{successNotice}</div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {user && !isStaff && (
            <div className="mb-5 p-3.5 bg-amber-950/50 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="leading-relaxed">
                Signed in as <strong className="font-mono">{user.email}</strong>, which does not have staff privileges. Please sign in with an authorized account or sign out.
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="mt-2 block underline text-amber-200 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="staff@yaazhboutique.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-surface-2 border border-border text-text placeholder-text-muted/60 rounded-xl focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-colors"
                />
              </div>
            </div>

            {!isResetMode && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-text">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError(null);
                      setSuccessNotice(null);
                    }}
                    className="text-[11px] text-pink hover:text-pink-tint transition-colors underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-surface-2 border border-border text-text placeholder-text-muted/60 rounded-xl focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-pink hover:bg-pink-strong text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-pink/30 cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Processing...'
                  : (isResetMode ? 'Send Password Reset Link' : 'Sign In to Staff Portal')}
              </span>
            </button>

            {isResetMode && (
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError(null);
                  setSuccessNotice(null);
                }}
                className="w-full py-2 text-xs text-text-muted hover:text-text transition-colors cursor-pointer text-center block"
              >
                Back to Staff Sign In
              </button>
            )}
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-text-muted">
              <span className="bg-surface px-3">or authenticate via</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-surface-2 border border-border hover:border-pink/40 text-text font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Workspace Login</span>
          </button>

          {/* Boutique info note */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <div className="flex items-center justify-center gap-1.5 text-text-muted text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-pink" />
              <span>Role-Based Access Control Active</span>
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              Store Owner: <span className="text-text font-mono">{BOOTSTRAPPED_ADMIN_EMAIL}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
