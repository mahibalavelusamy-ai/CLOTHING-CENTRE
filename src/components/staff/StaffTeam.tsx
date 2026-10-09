import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { 
  getAllUsersFromFirestore, 
  updateUserRoleInFirestore, 
  parseFriendlyErrorMessage,
  BOOTSTRAPPED_ADMIN_EMAIL 
} from '../../lib/firebase';
import { UserProfile, UserRole } from '../../types';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  User as UserIcon, 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCw,
  Mail,
  Calendar,
  KeyRound
} from 'lucide-react';

export const StaffTeam: React.FC = () => {
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'customer'>('all');

  // Confirmation dialog state
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsersFromFirestore();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load team users:', err);
      setError(parseFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // If not admin, redirect to staff dashboard
  if (!authLoading && !isAdmin) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  const handleInitiateRoleChange = (targetUser: UserProfile, newRole: UserRole) => {
    setError(null);

    if (targetUser.role === newRole) return;

    // Guard 1: Admin cannot demote themselves
    if (targetUser.uid === currentUser?.uid && newRole !== 'admin') {
      setError('Action Denied: You cannot demote your own administrator account.');
      return;
    }

    // Guard 2: Cannot demote the last remaining admin
    const currentAdminsCount = users.filter((u) => u.role === 'admin').length;
    if (targetUser.role === 'admin' && newRole !== 'admin' && currentAdminsCount <= 1) {
      setError('Action Denied: You cannot demote the last remaining administrator.');
      return;
    }

    setPendingUser(targetUser);
    setPendingRole(newRole);
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingUser || !pendingRole) return;

    setIsUpdating(true);
    setError(null);
    try {
      await updateUserRoleInFirestore(pendingUser.uid, pendingRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === pendingUser.uid ? { ...u, role: pendingRole } : u))
      );
      showSuccess(`Successfully updated ${pendingUser.email} role to ${pendingRole.toUpperCase()}.`);
      setPendingUser(null);
      setPendingRole(null);
    } catch (err) {
      console.error('Failed to update role:', err);
      setError(parseFriendlyErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !query ||
      u.email.toLowerCase().includes(query) ||
      u.displayName?.toLowerCase().includes(query) ||
      u.uid.toLowerCase().includes(query);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-pink uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-text tracking-tight">
            Team & User Roles (RBAC)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage permissions, staff authorizations, and customer roles for Yaazh Boutique.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface border border-border hover:bg-surface-2 text-text text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pink/15 border border-pink/30 text-pink flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Administrators</p>
            <p className="text-xl font-bold text-text">{adminCount}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Staff Members</p>
            <p className="text-xl font-bold text-text">{staffCount}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border text-text-muted flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Registered Customers</p>
            <p className="text-xl font-bold text-text">{customerCount}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Operation Notice</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-center gap-3 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-medium flex-1">{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search by email or name */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-surface-2 border border-border text-text placeholder-text-muted/60 rounded-xl focus:outline-none focus:border-pink transition-colors"
          />
        </div>

        {/* Role tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'admin', 'staff', 'customer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-pink text-white shadow-2xs'
                  : 'bg-surface-2 hover:bg-surface text-text-muted hover:text-text border border-border'
              }`}
            >
              {r === 'all' ? 'All Users' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-pink" />
            <span>Loading user accounts and permissions...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted">
            <Users className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
            <p className="font-semibold text-text">No users match your criteria.</p>
            <p className="text-text-muted mt-1">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-2 border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const isCurrent = u.uid === currentUser?.uid;
                  const isBootstrapped = u.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.uid} className="hover:bg-surface-2/60 transition-colors">
                      {/* Name / Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            u.role === 'admin'
                              ? 'bg-pink/20 text-pink border border-pink/40'
                              : u.role === 'staff'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                              : 'bg-surface-2 text-text border border-border'
                          }`}>
                            {u.displayName?.[0] || u.email[0] || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-text flex items-center gap-1.5">
                              <span>{u.displayName || 'Boutique User'}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-pink/15 text-pink border border-pink/30 px-1.5 py-0.2 rounded font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted font-mono truncate block">
                              UID: {u.uid.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-text">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span>{u.email}</span>
                        </div>
                        {isBootstrapped && (
                          <span className="inline-block mt-0.5 text-[9px] text-pink bg-pink/10 border border-pink/30 px-1.5 py-0.2 rounded">
                            Bootstrap Admin
                          </span>
                        )}
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-pink/15 text-pink border border-pink/30'
                            : u.role === 'staff'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                            : 'bg-surface-2 text-text-muted border border-border'
                        }`}>
                          {u.role === 'admin' && <ShieldAlert className="w-3 h-3 text-pink" />}
                          {u.role === 'staff' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          {u.role === 'customer' && <UserIcon className="w-3 h-3 text-text-muted" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Created date */}
                      <td className="py-3 px-4 text-text-muted text-[11px]">
                        {u.createdAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-text-muted" />
                            <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted/50">—</span>
                        )}
                      </td>

                      {/* Actions: Role selection */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-surface-2 border border-border p-1 rounded-xl">
                          {(['customer', 'staff', 'admin'] as const).map((targetRole) => {
                            const isSelected = u.role === targetRole;
                            return (
                              <button
                                key={targetRole}
                                type="button"
                                disabled={isSelected}
                                onClick={() => handleInitiateRoleChange(u, targetRole)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer disabled:cursor-default ${
                                  isSelected
                                    ? 'bg-pink text-white shadow-2xs font-bold'
                                    : 'text-text-muted hover:text-text hover:bg-surface'
                                }`}
                              >
                                {targetRole}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Confirmation Modal */}
      {pendingUser && pendingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-surface rounded-2xl max-w-md w-full shadow-2xl border border-border overflow-hidden text-text"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-surface-2 text-text flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-pink/15 border border-pink/30 text-pink flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif-display text-white">
                    Confirm Role Modification
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Role-Based Access Control
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setPendingUser(null); setPendingRole(null); }}
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-2 text-text-muted hover:text-text border border-border flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-surface-2/60 rounded-xl border border-border space-y-1.5">
                <div className="text-xs text-text-muted">Target User:</div>
                <div className="font-bold text-text text-sm">{pendingUser.displayName || 'Boutique User'}</div>
                <div className="text-xs font-mono text-text-muted">{pendingUser.email}</div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-surface-2/80 border border-border rounded-xl text-xs">
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Current Role</span>
                  <span className="font-bold text-text uppercase">{pendingUser.role}</span>
                </div>
                <div className="text-pink font-bold text-base">➔</div>
                <div>
                  <span className="text-pink block text-[10px] uppercase font-bold">New Role</span>
                  <span className="font-bold text-white uppercase">{pendingRole}</span>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Are you sure you want to change this user's role to{' '}
                <strong className="text-text uppercase">{pendingRole}</strong>? This immediately adjusts their system privileges.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setPendingUser(null); setPendingRole(null); }}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-pink hover:bg-pink-strong text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isUpdating ? 'Updating Role...' : 'Confirm Role Change'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
