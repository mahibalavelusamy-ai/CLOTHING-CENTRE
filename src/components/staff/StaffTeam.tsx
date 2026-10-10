import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { 
  getAllUsersFromFirestore, 
  updateUserRoleInFirestore, 
  parseFriendlyErrorMessage,
  BOOTSTRAPPED_ADMIN_EMAIL,
  subscribeToAuthorizedStaff,
  addAuthorizedStaffMember,
  updateAuthorizedStaffRole,
  removeAuthorizedStaffMember
} from '../../lib/firebase';
import { UserProfile, UserRole, AuthorizedStaff } from '../../types';
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
  KeyRound, 
  UserPlus, 
  Trash2, 
  Crown, 
  Lock, 
  BadgeCheck, 
  Clock,
  Sparkles
} from 'lucide-react';

export const StaffTeam: React.FC = () => {
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();

  // State for authorized staff whitelist
  const [authorizedStaff, setAuthorizedStaff] = useState<AuthorizedStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // State for all registered users
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form state for adding new staff
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffNotes, setNewStaffNotes] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  // Filters & UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'authorized' | 'customers'>('authorized');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Confirmation modals
  const [pendingRevoke, setPendingRevoke] = useState<AuthorizedStaff | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    id: string;
    email: string;
    targetRole: 'staff' | 'admin';
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Subscribe to authorized staff in real-time
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = subscribeToAuthorizedStaff(
      (staffList) => {
        setAuthorizedStaff(staffList || []);
        setLoadingStaff(false);
      },
      (err) => {
        console.warn('Authorized staff subscription error:', err);
        setLoadingStaff(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  // Fetch all registered user accounts
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsersFromFirestore();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load registered users:', err);
      setError(parseFriendlyErrorMessage(err));
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  // If not admin, redirect to staff dashboard
  if (!authLoading && !isAdmin) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // Handle adding a new authorized staff member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = newStaffEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setError('Please enter a valid staff email address.');
      return;
    }

    if (!emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setError('Please provide a valid email format (e.g. staff@gmail.com).');
      return;
    }

    if (emailTrimmed === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      setError('This email is the primary Super Administrator and is already permanently authorized.');
      return;
    }

    const alreadyExists = authorizedStaff.some((s) => s.email.toLowerCase() === emailTrimmed);
    if (alreadyExists) {
      setError(`Email "${emailTrimmed}" is already registered on the authorized staff list.`);
      return;
    }

    setIsAddingStaff(true);
    try {
      await addAuthorizedStaffMember({
        email: emailTrimmed,
        role: newStaffRole,
        displayName: newStaffName.trim() || emailTrimmed.split('@')[0],
        notes: newStaffNotes.trim(),
        addedBy: currentUser?.email || 'Store Administrator'
      });

      showSuccess(`Successfully authorized "${emailTrimmed}" with ${newStaffRole.toUpperCase()} permissions.`);
      setNewStaffEmail('');
      setNewStaffName('');
      setNewStaffNotes('');
      setNewStaffRole('staff');
      fetchUsers(); // Refresh registered users table
    } catch (err) {
      console.error('Failed to add staff member:', err);
      setError(parseFriendlyErrorMessage(err));
    } finally {
      setIsAddingStaff(false);
    }
  };

  // Confirm role change for authorized staff
  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    setIsProcessingAction(true);
    setError(null);

    try {
      await updateAuthorizedStaffRole(
        pendingRoleChange.id,
        pendingRoleChange.email,
        pendingRoleChange.targetRole
      );
      showSuccess(`Role for "${pendingRoleChange.email}" updated to ${pendingRoleChange.targetRole.toUpperCase()}.`);
      setPendingRoleChange(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to change staff role:', err);
      setError(parseFriendlyErrorMessage(err));
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Confirm revoking access
  const handleConfirmRevoke = async () => {
    if (!pendingRevoke) return;
    setIsProcessingAction(true);
    setError(null);

    try {
      await removeAuthorizedStaffMember(pendingRevoke.id, pendingRevoke.email);
      showSuccess(`Revoked staff access for "${pendingRevoke.email}". Account reset to customer.`);
      setPendingRevoke(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to revoke staff access:', err);
      setError(parseFriendlyErrorMessage(err));
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Quick promote a registered customer to staff
  const handlePromoteCustomer = async (customer: UserProfile, role: 'staff' | 'admin') => {
    setError(null);
    try {
      await addAuthorizedStaffMember({
        email: customer.email,
        role,
        displayName: customer.displayName || customer.email.split('@')[0],
        notes: 'Promoted from registered customer accounts',
        addedBy: currentUser?.email || 'Store Administrator'
      });
      showSuccess(`Successfully promoted ${customer.email} to ${role.toUpperCase()}.`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to promote customer:', err);
      setError(parseFriendlyErrorMessage(err));
    }
  };

  // Filtered lists
  const filteredStaff = authorizedStaff.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || s.email.toLowerCase().includes(q) || s.displayName?.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q);
  });

  const filteredCustomers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const isCustomer = u.role === 'customer';
    const matchesQuery = !q || u.email.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);
    return isCustomer && matchesQuery;
  });

  const isBootstrapAdminUser = currentUser?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4" />
            <span>Store Security & Staff Whitelist</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
            Staff Portal Access Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Only Gmail addresses explicitly added below can log into the Yaazh Boutique Staff Portal.
          </p>
        </div>

        <button
          onClick={() => {
            fetchUsers();
          }}
          disabled={loadingUsers}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-amber-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Security Notice</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium flex-1">{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Super-Admin Permanent Showcase */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-stone-950 text-white rounded-2xl p-5 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Primary Super Administrator
              </span>
              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                Permanent Protected ID
              </span>
            </div>
            <h2 className="text-base font-bold font-mono text-white mt-1">
              {BOOTSTRAPPED_ADMIN_EMAIL}
            </h2>
            <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
              Main Store Administrator with master authority to authorize, promote, and revoke staff credentials. Cannot be removed or demoted.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <BadgeCheck className="w-4 h-4" />
            <span>Master Key Active</span>
          </span>
        </div>
      </div>

      {/* Add New Authorized Staff Member Form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-serif-display">
                Authorize New Staff Gmail / Email
              </h3>
              <p className="text-[11px] text-stone-500">
                Grant staff or administrative portal access to a specific email address.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddStaff} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Staff Email */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Staff Email (Gmail) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. staff.yaazh@gmail.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Portal Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value as 'staff' | 'admin')}
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-medium cursor-pointer"
              >
                <option value="staff">Store Staff (Catalog & Orders)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            {/* Display Name / Desk */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Staff Name or Location Note
              </label>
              <input
                type="text"
                placeholder="e.g. Priya (Kallimandayam Billing)"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Whitelisted emails can sign in via Google Workspace or email login at{' '}
              <span className="font-mono text-stone-700">/staff/login</span>. Any unauthorized email is immediately blocked.
            </p>

            <button
              type="submit"
              disabled={isAddingStaff}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAddingStaff ? 'Authorizing...' : 'Authorize Staff Member'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('authorized')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'authorized'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Authorized Staff Whitelist</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {authorizedStaff.length + 1}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'customers'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span>Registered Customers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700">
              {users.filter((u) => u.role === 'customer').length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-amber-600 transition-colors"
          />
        </div>
      </div>

      {/* Tab 1: Authorized Staff Whitelist */}
      {activeTab === 'authorized' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Authorized Identity</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Authorized On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {/* Always show the Primary Super-Admin on top */}
                <tr className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 border border-amber-300 flex items-center justify-center font-bold text-xs">
                        <Crown className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>Primary Store Owner</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-semibold">
                            Master ID
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500">Yaazh Boutique Administrator</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{BOOTSTRAPPED_ADMIN_EMAIL}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                      <ShieldAlert className="w-3 h-3 text-amber-700" />
                      <span>ADMIN</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                    <span className="font-mono">Permanent Root</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-semibold px-2 py-1">
                      <Lock className="w-3 h-3" />
                      <span>Protected</span>
                    </span>
                  </td>
                </tr>

                {/* Additional authorized staff */}
                {loadingStaff ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                        <span>Loading authorized staff list...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      <p className="font-semibold text-stone-700">No additional staff members added yet.</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Use the form above to authorize staff Gmail accounts for your store.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const isRegistered = users.some(
                      (u) => u.email.toLowerCase() === staff.email.toLowerCase()
                    );

                    return (
                      <tr key={staff.id} className="hover:bg-stone-50/80 transition-colors">
                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                              staff.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {staff.displayName?.[0] || staff.email[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                <span>{staff.displayName || 'Staff Member'}</span>
                                {isRegistered ? (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                                    Active Login
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-stone-100 text-stone-600 border border-stone-200 px-1.5 py-0.2 rounded">
                                    Pre-Authorized
                                  </span>
                                )}
                              </div>
                              {staff.notes && (
                                <span className="text-[10px] text-stone-500 truncate block">
                                  {staff.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 font-mono text-stone-800">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{staff.email}</span>
                          </div>
                        </td>

                        {/* Role badge */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            staff.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {staff.role === 'admin' ? (
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                            ) : (
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>{staff.role}</span>
                          </span>
                        </td>

                        {/* Added at */}
                        <td className="py-3 px-4 text-stone-500 text-[11px]">
                          {staff.addedAt ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              <span>{new Date(staff.addedAt).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                          <span className="text-[10px] text-stone-400 block truncate">
                            By: {staff.addedBy || 'Admin'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Role switch button */}
                            <button
                              type="button"
                              onClick={() => {
                                const targetRole = staff.role === 'admin' ? 'staff' : 'admin';
                                setPendingRoleChange({
                                  id: staff.id,
                                  email: staff.email,
                                  targetRole
                                });
                              }}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                              title={`Switch to ${staff.role === 'admin' ? 'Staff' : 'Admin'}`}
                            >
                              Make {staff.role === 'admin' ? 'Staff' : 'Admin'}
                            </button>

                            {/* Revoke access button */}
                            <button
                              type="button"
                              onClick={() => setPendingRevoke(staff)}
                              className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Revoke staff access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Customers */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Registered Customer Accounts</h3>
              <p className="text-[11px] text-stone-500">
                Customers who have registered on Yaazh Boutique. You can promote any customer to Staff.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Promote to Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-500">
                      No registered customers match the query.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.uid} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {c.displayName || 'Boutique Customer'}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">
                        {c.email}
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handlePromoteCustomer(c, 'staff')}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200 hover:border-amber-600 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          + Promote to Staff
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Revoke Staff Access */}
      {pendingRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif-display text-rose-900">
                    Revoke Staff Access
                  </h3>
                  <p className="text-[11px] text-rose-700">
                    Remove from Whitelist
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPendingRevoke(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 text-stone-500 hover:text-rose-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to revoke staff portal access for{' '}
                <strong className="font-mono text-stone-900">{pendingRevoke.email}</strong>?
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600">
                This email will immediately be blocked from logging into the Staff Portal. If they have an active login, their role will be downgraded to Customer.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingRevoke(null)}
                  disabled={isProcessingAction}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  disabled={isProcessingAction}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isProcessingAction ? 'Revoking...' : 'Confirm Revoke Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Change Role */}
      {pendingRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif-display text-stone-900">
                    Modify Staff Role
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Privilege Modification
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPendingRoleChange(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Change role for <strong className="font-mono text-stone-900">{pendingRoleChange.email}</strong> to{' '}
                <strong className="uppercase text-amber-700">{pendingRoleChange.targetRole}</strong>?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingRoleChange(null)}
                  disabled={isProcessingAction}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  disabled={isProcessingAction}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isProcessingAction ? 'Updating...' : 'Confirm Role Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
