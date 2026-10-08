import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { STORE_CENTRE_INFO } from '../../data/clothingData';
import { 
  ClothingItem, 
  CustomerOrder, 
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
  deleteOrderInFirestore
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
  AlertTriangle
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
  onDeleteOrder: (orderId: string) => Promise<void>;
  lowStockCount: number;
  pendingOrdersCount: number;
}

export const StaffPortalLayout: React.FC = () => {
  const { user, profile, role, isAdmin, signOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [inventory, setInventory] = useState<ClothingItem[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Real-time synchronization for staff portal
  useEffect(() => {
    const unsubItems = subscribeToClothingItems((items) => {
      setInventory(items || []);
      setIsSynced(true);
    });

    const unsubOrders = subscribeToOrders((ordersList) => {
      setOrders(ordersList || []);
      setIsSynced(true);
    });

    return () => {
      unsubItems();
      unsubOrders();
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleUpdateItemStock = async (itemId: string, size: Size, newStock: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

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
      showNotice(`Stock updated for ${item.name} (${size}: ${newStock})`);
    } catch (err) {
      console.error('Failed to update stock:', err);
      showNotice('Failed to update stock in Firestore');
    }
  };

  const handleUpdateItemPrice = async (itemId: string, newPrice: number, newOriginalPrice?: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, price: newPrice } : i))
    );

    try {
      await updateGarmentPriceInFirestore(itemId, newPrice, newOriginalPrice);
      showNotice(`Price updated for ${item.name}`);
    } catch (err) {
      console.error('Failed to update price:', err);
      showNotice('Failed to update price');
    }
  };

  const handleAddNewItem = async (newItem: ClothingItem) => {
    setInventory((prev) => [newItem, ...prev]);
    try {
      await addOrUpdateClothingItemInFirestore(newItem);
      showNotice(`Published "${newItem.name}" to inventory`);
    } catch (err) {
      console.error('Failed to add garment:', err);
      showNotice('Failed to publish garment to Firestore');
    }
  };

  const handleUpdateItem = async (updatedItem: ClothingItem) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
    try {
      await addOrUpdateClothingItemInFirestore(updatedItem);
      showNotice(`Updated details for "${updatedItem.name}"`);
    } catch (err) {
      console.error('Failed to update garment:', err);
      showNotice('Failed to save garment changes');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await deleteClothingItemInFirestore(itemId);
      showNotice(`Deleted "${item?.name || itemId}" from inventory`);
    } catch (err) {
      console.error('Failed to delete garment:', err);
      showNotice('Failed to delete garment');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: CustomerOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await updateOrderStatusInFirestore(orderId, status);
      showNotice(`Order #${orderId} marked as "${status}"`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      showNotice('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await deleteOrderInFirestore(orderId);
      showNotice(`Order #${orderId} deleted`);
    } catch (err) {
      console.error('Failed to delete order:', err);
      showNotice('Failed to delete order');
    }
  };

  const lowStockCount = inventory.filter((i) => i.inStockTotal <= 10).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Ready for Pickup').length;

  const navLinks = [
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/products', label: 'Products & Catalogue', icon: Package, badge: inventory.length },
    { to: '/staff/inventory', label: 'Stock & Inventory', icon: Boxes, alert: lowStockCount > 0 ? lowStockCount : undefined },
    { to: '/staff/orders', label: 'Customer Orders', icon: Receipt, alert: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { to: '/staff/settings', label: 'Settings & RBAC', icon: Settings }
  ];

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col lg:flex-row text-stone-900 font-sans">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-3 rounded-xl shadow-2xl border border-stone-700 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-stone-950 text-white px-4 py-3 border-b border-stone-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-serif-display leading-tight">Yaazh Boutique</h1>
            <p className="text-[10px] text-amber-400 font-medium">Staff Portal</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-stone-900 text-stone-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:block w-full lg:w-64 bg-stone-950 text-stone-300 flex-shrink-0 lg:min-h-screen border-r border-stone-800 flex flex-col justify-between z-30`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-stone-800/80 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-serif-display text-white tracking-wide">
                  Yaazh Boutique
                </h2>
                <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                  Staff & Admin Portal
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-850">
              <span className="truncate">{STORE_CENTRE_INFO.address.split(',')[1]?.trim() || 'Oddanchatram'}</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live DB
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/40'
                        : 'text-stone-400 hover:text-white hover:bg-stone-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.alert !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                      {item.alert}
                    </span>
                  )}
                  {item.badge !== undefined && item.alert === undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-950/60 space-y-2">
          {/* Quick link to Storefront */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-900 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">/</span>
          </a>

          {/* User profile info */}
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white truncate max-w-[130px]">
                {profile?.displayName || user?.email?.split('@')[0] || 'Staff'}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
              }`}>
                {isAdmin ? 'Admin' : 'Staff'}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">{user?.email}</p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen bg-stone-50">
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
            onDeleteOrder: handleDeleteOrder,
            lowStockCount,
            pendingOrdersCount
          } satisfies StaffOutletContext}
        />
      </main>
    </div>
  );
};
