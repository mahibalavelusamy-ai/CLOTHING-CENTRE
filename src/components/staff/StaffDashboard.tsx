import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { StaffOutletContext } from './StaffPortalLayout';
import { formatPrice } from '../../lib/format';
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
  DollarSign
} from 'lucide-react';
import { CustomerOrder } from '../../types';

export const StaffDashboard: React.FC = () => {
  const { 
    inventory, 
    orders, 
    onUpdateOrderStatus, 
    lowStockCount 
  } = useOutletContext<StaffOutletContext>();

  // Metrics calculation
  const totalOrders = orders.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
  
  const pendingOrders = orders.filter(
    (o) => o.status === 'Confirmed' || o.status === 'Ready for Pickup'
  );
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  
  const totalProducts = inventory.length;
  const totalGarmentUnits = inventory.reduce((sum, item) => sum + item.inStockTotal, 0);
  
  const lowStockItems = inventory.filter((item) => item.inStockTotal <= 10);
  
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const recentOrders = orders.slice(0, 6);

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready for Pickup':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dispatched':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900">
            Store Operations Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time sales, order processing, and boutique inventory overview
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/staff/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Add Garment</span>
          </Link>
          <Link
            to="/staff/inventory"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Boxes className="w-4 h-4 text-stone-600" />
            <span>Manage Stock</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-stone-900">{totalOrders}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              <strong className="text-stone-700 font-semibold">{todayOrders.length}</strong> placed today
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Orders</span>
            <div className={`p-2 rounded-xl ${pendingOrders.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className={`text-2xl font-bold font-mono ${pendingOrders.length > 0 ? 'text-amber-800' : 'text-stone-900'}`}>
              {pendingOrders.length}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Requires fulfillment or dispatch
            </p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Completed Orders</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-stone-900">{completedOrders.length}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Delivered or collected at counter
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-stone-900">{formatPrice(totalRevenue)}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Avg Order: <span className="font-semibold text-stone-700">{formatPrice(avgOrderValue)}</span>
            </p>
          </div>
        </div>

        {/* Catalogue Products */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Products Listed</span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-stone-900">{totalProducts}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Garment styles in store catalog
            </p>
          </div>
        </div>

        {/* Total Inventory Stock Units */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Stock</span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-stone-900">{totalGarmentUnits} units</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Physical inventory units in store
            </p>
          </div>
        </div>

        {/* Low Stock Styles */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Low-Stock Alerts</span>
            <div className={`p-2 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-stone-100 text-stone-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className={`text-2xl font-bold font-mono ${lowStockItems.length > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
              {lowStockItems.length} styles
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Items with 10 or fewer units
            </p>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Today's Sales</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-stone-900">{formatPrice(todayRevenue)}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {todayOrders.length} transaction{todayOrders.length !== 1 ? 's' : ''} logged today
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Recent Customer Orders</h2>
              <p className="text-[11px] text-stone-500">Latest orders placed for pickup or home delivery</p>
            </div>
            <Link
              to="/staff/orders"
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                No orders logged yet. Orders placed by customers will appear here in real time.
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-stone-200/80 hover:border-stone-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-stone-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">#{order.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-stone-600 text-[11px]">
                      <span className="font-medium text-stone-800">{order.customer.name}</span>
                      <span>·</span>
                      <span>{order.customer.phone}</span>
                      <span>·</span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Status quick select */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                      className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-700 font-medium focus:outline-none focus:border-amber-600"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Low-Stock Warning</span>
              </h2>
              <p className="text-[11px] text-stone-500">Items needing restock</p>
            </div>
            <Link
              to="/staff/inventory"
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
            >
              Inventory
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                All inventory items currently have healthy stock levels (&gt; 10 units).
              </div>
            ) : (
              lowStockItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-stone-500 font-mono">{item.sku} · {item.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                      {item.inStockTotal} left
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
