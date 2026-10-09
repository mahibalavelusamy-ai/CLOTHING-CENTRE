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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
            Team & User Roles (RBAC)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage permissions, staff authorizations, and customer roles for Yaazh Boutique.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Administrators</p>
            <p className="text-xl font-bold text-stone-900">{adminCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Staff Members</p>
            <p className="text-xl font-bold text-stone-900">{staffCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Registered Customers</p>
            <p className="text-xl font-bold text-stone-900">{customerCount}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Operation Notice</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium flex-1">{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search by email or name */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-amber-600 transition-colors"
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
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              {r === 'all' ? 'All Users' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
            <span>Loading user accounts and permissions...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-900">No users match your criteria.</p>
            <p className="text-stone-500 mt-1">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u.uid === currentUser?.uid;
                  const isBootstrapped = u.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.uid} className="hover:bg-stone-50/80 transition-colors">
                      {/* Name / Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : u.role === 'staff'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}>
                            {u.displayName?.[0] || u.email[0] || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                              <span>{u.displayName || 'Boutique User'}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono truncate block">
                              UID: {u.uid.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-stone-800">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{u.email}</span>
                        </div>
                        {isBootstrapped && (
                          <span className="inline-block mt-0.5 text-[9px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            Bootstrap Admin
                          </span>
                        )}
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : u.role === 'staff'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}>
                          {u.role === 'admin' && <ShieldAlert className="w-3 h-3 text-amber-600" />}
                          {u.role === 'staff' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                          {u.role === 'customer' && <UserIcon className="w-3 h-3 text-stone-500" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Created date */}
                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        {u.createdAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>

                      {/* Actions: Role selection */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-200 p-1 rounded-xl">
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
                                    ? 'bg-stone-900 text-white shadow-2xs font-bold'
                                    : 'text-stone-600 hover:text-stone-900 hover:bg-white'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-stone-50 text-stone-900 flex items-center justify-between border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif-display text-stone-900">
                    Confirm Role Modification
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Role-Based Access Control
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setPendingUser(null); setPendingRole(null); }}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="text-xs text-stone-500">Target User:</div>
                <div className="font-bold text-stone-900 text-sm">{pendingUser.displayName || 'Boutique User'}</div>
                <div className="text-xs font-mono text-stone-500">{pendingUser.email}</div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">Current Role</span>
                  <span className="font-bold text-stone-900 uppercase">{pendingUser.role}</span>
                </div>
                <div className="text-amber-700 font-bold text-base">➔</div>
                <div>
                  <span className="text-amber-700 block text-[10px] uppercase font-bold">New Role</span>
                  <span className="font-bold text-stone-900 uppercase">{pendingRole}</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to change this user's role to{' '}
                <strong className="text-stone-900 uppercase">{pendingRole}</strong>? This immediately adjusts their system privileges.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setPendingUser(null); setPendingRole(null); }}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
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
