import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

interface StaffProtectedRouteProps {
  children: React.ReactNode;
}

export const StaffProtectedRoute: React.FC<StaffProtectedRouteProps> = ({ children }) => {
  const { user, role, isStaff, loading, signOutUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <div className="w-8 h-8 border-2 border-pink border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">Verifying Staff Authorization...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to /staff/login
  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  // Logged in but not staff or admin -> Access Denied screen
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-text font-serif-display mb-1">
            Access Restricted
          </h2>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Your account (<span className="text-text font-mono">{user.email}</span>) has{' '}
            <span className="font-semibold text-pink">Customer</span> privileges.
            Access to Yaazh Boutique Staff & Administration portal is restricted to authorized store staff.
          </p>
          <div className="flex flex-col gap-2.5">
            <a
              href="/"
              className="w-full py-2.5 px-4 bg-pink hover:bg-pink-strong text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Storefront</span>
            </a>
            <button
              onClick={() => signOutUser()}
              className="w-full py-2 px-4 bg-surface-2 border border-border hover:border-pink/40 text-text rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign In with Different Staff Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
