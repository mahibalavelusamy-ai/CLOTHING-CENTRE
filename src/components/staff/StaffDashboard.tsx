import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { StaffOutletContext } from './StaffPortalLayout';
import { formatPrice } from '../../lib/format';
import { useAuth } from '../../lib/authContext';
import { 
  Package, 
  Receipt, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Boxes, 
  ArrowRight,
  Truck,
  Store,
  DollarSign,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { CustomerOrder } from '../../types';
import { buildLink, buildStatusMessage } from '../../lib/whatsapp';

export const StaffDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { 
    inventory, 
    orders, 
    onUpdateOrderStatus, 
    lowStockCount 
  } = useOutletContext<StaffOutletContext>();

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const staffName = profile?.displayName || 'Store Associate';

  // Metrics calculation
  const totalOrders = orders.length;
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
  
  const pendingOrders = orders.filter(
    (o) => o.status === 'Confirmed' || o.status === 'Ready for Pickup' || o.status === 'Dispatched'
  );
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const readyPickupOrders = orders.filter((o) => o.status === 'Ready for Pickup');
  const dispatchedOrders = orders.filter((o) => o.status === 'Dispatched');
  
  const totalProducts = inventory.length;
  const totalGarmentUnits = inventory.reduce((sum, item) => sum + item.inStockTotal, 0);
  
  const lowStockItems = inventory.filter((item) => item.inStockTotal > 0 && item.inStockTotal <= 10);
  const outOfStockItems = inventory.filter((item) => item.inStockTotal === 0);
  const healthyStockItems = inventory.filter((item) => item.inStockTotal > 10);
  
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + (o.totalAmount || 0) : sum, 0);
  const todayRevenue = todayOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + (o.totalAmount || 0) : sum, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const recentOrders = orders.slice(0, 6);

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Ready for Pickup':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Dispatched':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const getNextStatus = (current: CustomerOrder['status']): CustomerOrder['status'] | null => {
    switch (current) {
      case 'Confirmed': return 'Ready for Pickup';
      case 'Ready for Pickup': return 'Dispatched';
      case 'Dispatched': return 'Completed';
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Executive Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#1A1A1E] via-[#221B24] to-[#2B1720] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/30 px-2.5 py-0.5 rounded-full">
              Operations Active
            </span>
            <span className="text-xs text-stone-300">
              Oddanchatram & Kallimandayam
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display tracking-tight text-white">
            {greeting}, {staffName}
          </h1>
          <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
            Here is your live boutique cockpit. You have{' '}
            <strong className="text-[#C9A45C] font-semibold">{pendingOrders.length} orders awaiting fulfillment</strong>{' '}
            and <strong className="text-rose-300 font-semibold">{lowStockCount} garments</strong> flagged for restock today.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <Link
            to="/staff/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#6D1A33]/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Add New Garment</span>
          </Link>
          <Link
            to="/staff/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Boxes className="w-4 h-4 text-[#C9A45C]" />
            <span>Stock Matrix</span>
          </Link>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#6D1A33]/20 to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F]">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-[11px] text-[#6E6E73] mt-1 flex items-center justify-between">
              <span>Today: <strong className="text-emerald-700 font-mono">{formatPrice(todayRevenue)}</strong></span>
              <span>Avg: <strong className="font-mono text-stone-800">{formatPrice(avgOrderValue)}</strong></span>
            </p>
          </div>
        </div>

        {/* Customer Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3E8EB] text-[#6D1A33] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-[#1D1D1F]">
              {totalOrders}
            </p>
            <p className="text-[11px] text-[#6E6E73] mt-1">
              <strong className="text-[#1D1D1F] font-semibold">{todayOrders.length}</strong> placed today · <span className="text-emerald-700 font-semibold">{completedOrders.length} fulfilled</span>
            </p>
          </div>
        </div>

        {/* Pending Orders (Requires action) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Pipeline</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              pendingOrders.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl sm:text-3xl font-bold font-mono ${
                pendingOrders.length > 0 ? 'text-amber-800' : 'text-[#1D1D1F]'
              }`}>
                {pendingOrders.length}
              </p>
              {pendingOrders.length > 0 && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Needs Action
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6E6E73] mt-1">
              {readyPickupOrders.length} ready pickup · {dispatchedOrders.length} in transit
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Inventory Alerts</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              lowStockCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-stone-100 text-stone-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl sm:text-3xl font-bold font-mono ${
              lowStockCount > 0 ? 'text-rose-700' : 'text-[#1D1D1F]'
            }`}>
              {lowStockCount}
            </p>
            <p className="text-[11px] text-[#6E6E73] mt-1">
              {totalGarmentUnits} physical garments across {totalProducts} styles
            </p>
          </div>
        </div>
      </div>

      {/* Visual Stock Health Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#6D1A33]" />
            <span className="font-bold text-[#1D1D1F]">Physical Store Inventory Health</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#6E6E73]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Healthy ({healthyStockItems.length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Low Stock ({lowStockItems.length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Out of Stock ({outOfStockItems.length})
            </span>
          </div>
        </div>

        <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden flex">
          {totalProducts > 0 && (
            <>
              <div 
                style={{ width: `${(healthyStockItems.length / totalProducts) * 100}%` }} 
                className="bg-emerald-500 transition-all duration-500" 
                title={`Healthy: ${healthyStockItems.length} styles`}
              />
              <div 
                style={{ width: `${(lowStockItems.length / totalProducts) * 100}%` }} 
                className="bg-amber-500 transition-all duration-500" 
                title={`Low Stock: ${lowStockItems.length} styles`}
              />
              <div 
                style={{ width: `${(outOfStockItems.length / totalProducts) * 100}%` }} 
                className="bg-rose-500 transition-all duration-500" 
                title={`Out of Stock: ${outOfStockItems.length} styles`}
              />
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Recent Orders & Urgent Restock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E8ED] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] font-serif-display">
                Recent Customer Orders
              </h2>
              <p className="text-[11px] text-[#6E6E73]">
                Orders placed via online store for counter pickup or home delivery
              </p>
            </div>
            <Link
              to="/staff/orders"
              className="text-xs text-[#6D1A33] hover:text-[#561428] font-bold flex items-center gap-1 transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                No orders logged yet. Customer orders will appear here automatically in real time.
              </div>
            ) : (
              recentOrders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                const isPickup = order.customer.deliveryType === 'store_pickup';
                const whatsappUrl = buildLink(order.customer.phone, buildStatusMessage(order, order.status));

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-stone-200/80 bg-[#FBFBFC] hover:bg-white hover:border-[#C9A45C]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-stone-900">
                          #{order.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                          {isPickup ? (
                            <><Store className="w-3 h-3 text-purple-600" /> Store Pickup</>
                          ) : (
                            <><Truck className="w-3 h-3 text-blue-600" /> Delivery</>
                          )}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[#6E6E73] text-[11px] truncate">
                        <span className="font-semibold text-stone-900">{order.customer.name}</span>
                        <span>·</span>
                        <span className="font-mono">{order.customer.phone}</span>
                        <span>·</span>
                        <span className="font-bold text-[#1D1D1F] font-mono">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <span>({order.items.length} item{order.items.length !== 1 ? 's' : ''})</span>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {/* WhatsApp trigger */}
                      {order.customer.phone && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="Send WhatsApp update to customer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {/* 1-click Advance Status button */}
                      {nextStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-[#6D1A33] text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Move to {nextStatus}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                        className="text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-700 font-medium focus:outline-none focus:border-[#6D1A33] cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Urgent Watchlist (1 col) */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] font-serif-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Restock Watchlist</span>
              </h2>
              <p className="text-[11px] text-[#6E6E73]">
                Garments with ≤ 10 units in boutique
              </p>
            </div>
            <Link
              to="/staff/inventory"
              className="text-xs text-[#6D1A33] hover:text-[#561428] font-bold transition-colors"
            >
              Stock Matrix
            </Link>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-stone-700">Healthy Inventory</p>
                <p className="text-[11px] text-stone-400 mt-0.5">All boutique styles have healthy stock levels.</p>
              </div>
            ) : (
              [...outOfStockItems, ...lowStockItems].slice(0, 7).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-stone-200/80 bg-[#FBFBFC] flex items-center justify-between text-xs hover:border-[#6D1A33]/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {item.images?.[0] ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-9 h-11 object-cover rounded-lg border border-stone-200 shrink-0" 
                      />
                    ) : (
                      <div className="w-9 h-11 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-stone-500 font-mono truncate">
                        {item.sku} · {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      item.inStockTotal === 0 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {item.inStockTotal === 0 ? 'Out of Stock' : `${item.inStockTotal} left`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
