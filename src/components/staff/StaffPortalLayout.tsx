import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { STORE_CENTRE_INFO } from '../../data/clothingData';
import { 
  ClothingItem, 
  CustomerOrder, 
  PaymentStatus,
  Size 
} from '../../types';
import { 
  subscribeToClothingItems, 
  subscribeToOrders,
  addOrUpdateClothingItemInFirestore,
  updateGarmentStockInFirestore,
  updateGarmentPriceInFirestore,
  deleteClothingItemInFirestore,
  updateOrderStatusInFirestore,
  updateOrderPaymentStatusInFirestore,
  deleteOrderInFirestore,
  parseFriendlyErrorMessage
} from '../../lib/firebase';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Receipt, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Calendar
} from 'lucide-react';

export interface StaffOutletContext {
  inventory: ClothingItem[];
  orders: CustomerOrder[];
  onUpdateItemStock: (itemId: string, size: Size, newStock: number) => Promise<void>;
  onUpdateItemPrice: (itemId: string, newPrice: number, newOriginalPrice?: number) => Promise<void>;
  onAddNewItem: (item: ClothingItem) => Promise<void>;
  onUpdateItem: (item: ClothingItem) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: CustomerOrder['status']) => Promise<void>;
  onUpdateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  lowStockCount: number;
  pendingOrdersCount: number;
}

export const StaffPortalLayout: React.FC = () => {
  const { user, profile, role, isStaff, isAdmin, signOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [inventory, setInventory] = useState<ClothingItem[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');

  const showNotice = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionNotice(msg);
    setNoticeType(type);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Real-time synchronization for staff portal
  useEffect(() => {
    const unsubItems = subscribeToClothingItems((items) => {
      setInventory(items || []);
      setIsSynced(true);
    });

    let unsubOrders: (() => void) | undefined;
    if (user && isStaff) {
      unsubOrders = subscribeToOrders(
        (ordersList) => {
          setOrders(ordersList || []);
          setIsSynced(true);
        },
        (err) => {
          console.warn('Orders sync notice:', err);
        }
      );
    }

    return () => {
      unsubItems();
      if (unsubOrders) unsubOrders();
    };
  }, [user, isStaff]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleUpdateItemStock = async (itemId: string, size: Size, newStock: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const prevInventory = [...inventory];
    const updatedSizes = item.sizes.map((s) =>
      s.size === size ? { ...s, stock: Math.max(0, newStock) } : s
    );

    const exists = updatedSizes.some((s) => s.size === size);
    if (!exists) {
      updatedSizes.push({ size, stock: Math.max(0, newStock) });
    }

    const newTotal = updatedSizes.reduce((sum, s) => sum + s.stock, 0);

    // Optimistic UI update
    setInventory((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, sizes: updatedSizes, inStockTotal: newTotal } : i
      )
    );

    try {
      await updateGarmentStockInFirestore(itemId, updatedSizes, newTotal);
      showNotice(`Stock updated for ${item.name} (${size}: ${newStock})`, 'success');
    } catch (err: unknown) {
      console.error('Failed to update stock:', err);
      setInventory(prevInventory);
      showNotice(`Stock update failed: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  const handleUpdateItemPrice = async (itemId: string, newPrice: number, newOriginalPrice?: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const prevInventory = [...inventory];
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, price: newPrice } : i))
    );

    try {
      await updateGarmentPriceInFirestore(itemId, newPrice, newOriginalPrice);
      showNotice(`Price updated for ${item.name}`, 'success');
    } catch (err: unknown) {
      console.error('Failed to update price:', err);
      setInventory(prevInventory);
      showNotice(`Price update failed: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  const handleAddNewItem = async (newItem: ClothingItem) => {
    const prevInventory = [...inventory];
    setInventory((prev) => [newItem, ...prev]);
    try {
      await addOrUpdateClothingItemInFirestore(newItem);
      showNotice(`Published "${newItem.name}" to inventory`, 'success');
    } catch (err: unknown) {
      console.error('Failed to add garment:', err);
      setInventory(prevInventory);
      showNotice(`Failed to publish garment: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  const handleUpdateItem = async (updatedItem: ClothingItem) => {
    const prevInventory = [...inventory];
    setInventory((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
    try {
      await addOrUpdateClothingItemInFirestore(updatedItem);
      showNotice(`Updated details for "${updatedItem.name}"`, 'success');
    } catch (err: unknown) {
      console.error('Failed to update garment:', err);
      setInventory(prevInventory);
      showNotice(`Failed to save garment changes: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    const prevInventory = [...inventory];
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await deleteClothingItemInFirestore(itemId);
      showNotice(`Deleted "${item?.name || itemId}" from inventory`, 'success');
    } catch (err: unknown) {
      console.error('Failed to delete garment:', err);
      setInventory(prevInventory);
      showNotice(`Failed to delete garment: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: CustomerOrder['status']) => {
    const prevOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await updateOrderStatusInFirestore(orderId, status);
      showNotice(`Order #${orderId} moved to "${status}"`, 'success');
    } catch (err: unknown) {
      console.error('Failed to update order status:', err);
      setOrders(prevOrders);
      showNotice(`Status change rejected: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  const handleUpdateOrderPaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    const prevOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
    );
    try {
      await updateOrderPaymentStatusInFirestore(orderId, paymentStatus);
      showNotice(`Order #${orderId} payment marked as "${paymentStatus}"`, 'success');
    } catch (err: unknown) {
      console.error('Failed to update payment status:', err);
      setOrders(prevOrders);
      showNotice(`Payment status change rejected: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const prevOrders = [...orders];
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await deleteOrderInFirestore(orderId);
      showNotice(`Order #${orderId} deleted`, 'success');
    } catch (err: unknown) {
      console.error('Failed to delete order:', err);
      setOrders(prevOrders);
      showNotice(`Failed to delete order: ${parseFriendlyErrorMessage(err)}`, 'error');
    }
  };

  // 30-minute inactivity auto-logout with warning 1 minute before
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(60);

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const signoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIMEOUT_MS = 29 * 60 * 1000;    // 29 minutes (1 minute before)

  const handleAutoSignOut = useCallback(async () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (signoutTimerRef.current) clearTimeout(signoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowInactivityWarning(false);
    await signOutUser();
    navigate('/staff/login', { replace: true, state: { notice: 'Session timed out due to 30 minutes of inactivity.' } });
  }, [signOutUser, navigate]);

  const startInactivityTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (signoutTimerRef.current) clearTimeout(signoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowInactivityWarning(false);

    warningTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
      setCountdownSeconds(60);
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_TIMEOUT_MS);

    signoutTimerRef.current = setTimeout(() => {
      handleAutoSignOut();
    }, INACTIVITY_TIMEOUT_MS);
  }, [handleAutoSignOut]);

  useEffect(() => {
    startInactivityTimers();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleUserActivity = () => {
      if (!showInactivityWarning) {
        startInactivityTimers();
      }
    };

    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (signoutTimerRef.current) clearTimeout(signoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
    };
  }, [startInactivityTimers, showInactivityWarning]);

  const lowStockCount = inventory.filter((i) => i.inStockTotal <= 10).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Ready for Pickup').length;

  const navLinks = [
    { to: '/staff/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/staff/products', label: 'Products & Catalogue', icon: Package, badge: inventory.length },
    { to: '/staff/inventory', label: 'Stock & Inventory', icon: Boxes, alert: lowStockCount > 0 ? lowStockCount : undefined },
    { to: '/staff/orders', label: 'Customer Orders', icon: Receipt, alert: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    ...(isAdmin ? [{ to: '/staff/team', label: 'Staff Whitelist & RBAC', icon: Users }] : [])
  ];

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/staff/login');
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row text-[#1D1D1F] font-sans antialiased selection:bg-[#6D1A33] selection:text-white">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-white text-[#1D1D1F] text-xs px-4 py-3 rounded-2xl shadow-xl border border-stone-200/90 flex items-center gap-2.5 animate-in slide-in-from-top-2">
          {noticeType === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#111113] text-white px-4 py-3 border-b border-[#222226] flex items-center justify-between sticky top-0 z-40 safe-area-top shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6D1A33] border border-[#C9A45C]/30 text-white flex items-center justify-center font-bold font-serif-display shadow-sm">
            Y
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold font-serif-display leading-tight">Yaazh</h1>
              <span className="text-[10px] text-[#C9A45C] font-serif">யாழ்</span>
            </div>
            <p className="text-[10px] text-stone-400 font-medium">Boutique Staff Portal</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 text-stone-300 hover:text-white cursor-pointer transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop & Mobile Executive Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:block w-full lg:w-72 bg-[#111113] text-stone-300 flex-shrink-0 lg:min-h-screen border-r border-[#222226] flex flex-col justify-between z-30 shadow-2xl`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-[#222226] hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D1A33] to-[#451020] border border-[#C9A45C]/40 text-[#C9A45C] flex items-center justify-center font-bold text-lg font-serif-display shadow-lg shadow-[#6D1A33]/20">
                Y
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-serif-display text-white tracking-wide">
                    Yaazh
                  </h2>
                  <span className="text-xs text-[#C9A45C] font-serif">யாழ்</span>
                </div>
                <p className="text-[10px] text-stone-400 font-medium tracking-wider uppercase">
                  Staff & Operations
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-[#222226]/80">
              <span className="truncate">Kallimandayam & Oddanchatram</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live DB
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#6D1A33] text-white shadow-lg shadow-[#6D1A33]/30 font-bold'
                        : 'text-stone-400 hover:text-white hover:bg-white/[0.06]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>

                  {item.alert !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                      {item.alert}
                    </span>
                  )}
                  {item.badge !== undefined && item.alert === undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-stone-300 border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions footer */}
        <div className="p-3.5 border-t border-[#222226] bg-[#0E0E10] space-y-2.5">
          {/* Quick link to Storefront */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-stone-400 hover:text-amber-400 hover:bg-white/[0.05] text-xs transition-colors group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Customer Storefront</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">↗</span>
          </a>

          {/* User profile card */}
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                  isAdmin
                    ? 'bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {profile?.displayName?.[0] || user?.email?.[0] || 'S'}
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-stone-100 truncate block text-xs">
                    {profile?.displayName || user?.email?.split('@')[0] || 'Staff'}
                  </span>
                  <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
                </div>
              </div>

              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                isAdmin 
                  ? 'bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isAdmin ? 'Admin' : 'Staff'}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Desktop Top Bar */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-[#F8F9FA]">
        {/* Top desktop header strip */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-[#E8E8ED] sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[#6E6E73]">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{todayFormatted}</span>
            </div>
            <span className="text-stone-300">·</span>
            <span className="text-xs font-medium text-stone-600">
              Oddanchatram & Kallimandayam Operations
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {lowStockCount > 0 && (
              <NavLink
                to="/staff/inventory"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lowStockCount} Low Stock</span>
              </NavLink>
            )}

            {pendingOrdersCount > 0 && (
              <NavLink
                to="/staff/orders"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingOrdersCount} Orders Pending</span>
              </NavLink>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-semibold bg-[#F5F5F7] text-[#1D1D1F] border border-[#E8E8ED] hover:bg-[#EFEFF2] transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3 text-stone-500" />
            </a>
          </div>
        </header>

        {/* View content outlet */}
        <div className="flex-1">
          <Outlet
            context={{
              inventory,
              orders,
              onUpdateItemStock: handleUpdateItemStock,
              onUpdateItemPrice: handleUpdateItemPrice,
              onAddNewItem: handleAddNewItem,
              onUpdateItem: handleUpdateItem,
              onDeleteItem: handleDeleteItem,
              onUpdateOrderStatus: handleUpdateOrderStatus,
              onUpdateOrderPaymentStatus: handleUpdateOrderPaymentStatus,
              onDeleteOrder: handleDeleteOrder,
              lowStockCount,
              pendingOrdersCount
            } satisfies StaffOutletContext}
          />
        </div>
      </main>

      {/* Toast Notification Alert */}
      {actionNotice && (
        <div className={`fixed bottom-5 right-5 z-50 text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border animate-in fade-in slide-from-bottom-2 ${
          noticeType === 'error'
            ? 'bg-rose-950 text-rose-100 border-rose-800'
            : 'bg-stone-900 text-stone-100 border-stone-700'
        }`}>
          {noticeType === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Inactivity Warning Modal */}
      {showInactivityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-sm w-full text-stone-900 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif-display">
                Session Inactivity Warning
              </h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                You have been inactive for 29 minutes. For security, your staff session will automatically sign out in:
              </p>
              <div className="text-3xl font-mono font-bold text-amber-700 mt-2">
                {countdownSeconds}s
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleAutoSignOut}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer bg-stone-50"
              >
                Sign Out Now
              </button>
              <button
                type="button"
                onClick={startInactivityTimers}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-md"
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
