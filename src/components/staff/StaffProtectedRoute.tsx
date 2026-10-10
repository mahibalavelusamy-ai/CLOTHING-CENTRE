import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { ShieldAlert, LogOut, ArrowLeft, Lock } from 'lucide-react';

interface StaffProtectedRouteProps {
  children: React.ReactNode;
}

export const StaffProtectedRoute: React.FC<StaffProtectedRouteProps> = ({ children }) => {
  const { user, isStaff, loading, signOutUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-300">
          <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-[#C9A45C]">Verifying Staff Whitelist Authorization...</p>
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
      <div className="min-h-screen bg-[#0E0E10] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#18181B] border border-white/10 rounded-3xl p-7 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-rose-950/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" />
            <span>Restricted Territory</span>
          </div>

          <h2 className="text-xl font-bold text-white font-serif-display mb-1.5">
            Staff Portal Access Denied
          </h2>

          <p className="text-xs text-stone-400 mb-6 leading-relaxed">
            Your logged-in account (<span className="text-stone-200 font-mono font-semibold">{user.email}</span>) holds{' '}
            <span className="font-semibold text-[#C9A45C]">Customer privileges</span>.
            Access to Yaazh Boutique inventory, catalogue, orders, and financial data is strictly limited to authorized boutique staff on the store whitelist.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="w-full py-3 px-4 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6D1A33]/30 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Storefront</span>
            </a>
            <button
              onClick={() => signOutUser()}
              className="w-full py-2.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-stone-300 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch to Authorized Staff Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
