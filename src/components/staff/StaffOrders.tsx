import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StaffOutletContext } from './StaffPortalLayout';
import { OrderDetailModal } from './OrderDetailModal';
import { CustomerOrder, PaymentStatus } from '../../types';
import { formatPrice } from '../../lib/format';
import { 
  Receipt, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  Store, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Phone,
  User,
  ShoppingBag,
  DollarSign,
  MessageCircle
} from 'lucide-react';
import { buildLink, buildStatusMessage } from '../../lib/whatsapp';

const STATUS_OPTIONS: { id: 'all' | CustomerOrder['status']; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'Confirmed', label: 'Confirmed' },
  { id: 'Ready for Pickup', label: 'Ready for Pickup' },
  { id: 'Dispatched', label: 'Dispatched' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Cancelled', label: 'Cancelled' }
];

const PAYMENT_STATUS_OPTIONS: { id: 'all' | PaymentStatus; label: string }[] = [
  { id: 'all', label: 'All Payment Statuses' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'verification_pending', label: 'Verification Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'refunded', label: 'Refunded' }
];

export const StaffOrders: React.FC = () => {
  const { 
    orders, 
    onUpdateOrderStatus, 
    onUpdateOrderPaymentStatus,
    onDeleteOrder 
  } = useOutletContext<StaffOutletContext>();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | CustomerOrder['status']>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'all' | PaymentStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.phone.toLowerCase().includes(q) ||
      order.customer.email.toLowerCase().includes(q) ||
      (order.paymentReference && order.paymentReference.toLowerCase().includes(q)) ||
      order.items.some(it => it.item.name.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const currentPayment = order.paymentStatus || 'unpaid';
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || currentPayment === selectedPaymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
  const pendingCount = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready for Pickup' || o.status === 'Dispatched').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  const handleOpenDetail = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-950/50 text-blue-300 border-blue-800/60';
      case 'Ready for Pickup':
        return 'bg-purple-950/50 text-purple-300 border-purple-800/60';
      case 'Dispatched':
        return 'bg-amber-950/50 text-amber-300 border-amber-800/60';
      case 'Completed':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60';
      case 'Cancelled':
        return 'bg-rose-950/50 text-rose-300 border-rose-800/60';
      default:
        return 'bg-surface-2 text-text border-border';
    }
  };

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'pay_at_store': return 'Pay at Store';
      case 'upi': return 'Instant UPI';
      case 'card': return 'Card (Legacy)';
      default: return method || 'Unspecified';
    }
  };

  const getPaymentBadge = (status: PaymentStatus | string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'verification_pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'refunded':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'unpaid':
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif-display">
              Orders & Fulfilment
            </h1>
            <span className="text-xs bg-amber-50 text-amber-800 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage customer purchases, dispatch status, store pickup schedules, and tax slips.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Pending Action</p>
            <p className="text-2xl font-bold text-amber-700 font-mono mt-0.5">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Completed Orders</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Orders Value</p>
            <p className="text-2xl font-bold text-stone-900 font-mono mt-0.5">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, phone, email, or payment ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-amber-600 font-medium"
            />
          </div>

          {/* Fulfillment Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-amber-600 font-medium"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Dropdown */}
          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-amber-600 font-medium"
            >
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Payment Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mr-1 shrink-0">Payment:</span>
          {PAYMENT_STATUS_OPTIONS.map((opt) => {
            const isActive = selectedPaymentStatus === opt.id;
            const count = opt.id === 'all'
              ? orders.length
              : orders.filter((o) => (o.paymentStatus || 'unpaid') === opt.id).length;

            return (
              <button
                key={opt.id}
                onClick={() => setSelectedPaymentStatus(opt.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900 hover:border-amber-500'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Quick Fulfillment Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mr-1 shrink-0">Status:</span>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = selectedStatus === opt.id;
            const count = opt.id === 'all' 
              ? orders.length 
              : orders.filter(o => o.status === opt.id).length;

            return (
              <button
                key={opt.id}
                onClick={() => setSelectedStatus(opt.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900 hover:border-stone-400'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display text-base font-bold text-stone-900">
              No Orders Found
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search criteria or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Fulfilment</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Items</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-amber-700 whitespace-nowrap">
                        #{order.id}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-900">{order.customer.name}</p>
                        <p className="text-[11px] text-stone-500 font-mono">{order.customer.phone}</p>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-stone-500">
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-stone-400 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Fulfilment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {order.customer.deliveryType === 'store_pickup' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Store className="w-3 h-3 text-amber-600" />
                            Store Pickup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            <Truck className="w-3 h-3 text-blue-600" />
                            Home Delivery
                          </span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-stone-800 text-xs">
                              {formatPaymentMethod(order.paymentMethod)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPaymentBadge(order.paymentStatus || 'unpaid')}`}>
                              {order.paymentStatus === 'verification_pending' ? 'Verification Pending' : (order.paymentStatus || 'unpaid')}
                            </span>
                          </div>
                          {order.paymentReference && (
                            <p className="text-[10px] font-mono text-stone-500">
                              Ref: <span className="font-bold text-stone-700">{order.paymentReference}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-1 pt-1">
                            <button
                              type="button"
                              onClick={() => onUpdateOrderPaymentStatus(order.id, 'paid')}
                              disabled={(order.paymentStatus || 'unpaid') === 'paid'}
                              className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                              title="Mark as Paid"
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderPaymentStatus(order.id, 'unpaid')}
                              disabled={(order.paymentStatus || 'unpaid') === 'unpaid'}
                              className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                              title="Mark as Unpaid"
                            >
                              Mark unpaid
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderPaymentStatus(order.id, 'refunded')}
                              disabled={(order.paymentStatus || 'unpaid') === 'refunded'}
                              className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                              title="Mark as Refunded"
                            >
                              Mark refunded
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-900">{itemCount} pcs</span>
                        <p className="text-[10px] text-stone-500 truncate max-w-[140px]">
                          {order.items[0]?.item.name}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>

                      {/* Status quick select */}
                      <td className="py-3 px-4 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as CustomerOrder['status'])}
                          className={`text-[11px] font-bold px-2 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.customer.phone && (
                            <a
                              href={buildLink(order.customer.phone, buildStatusMessage(order, order.status))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer group"
                              title={`Message customer on WhatsApp (${order.customer.phone})`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                              <span className="hidden sm:inline">Message customer</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenDetail(order)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
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

      {/* Order Detail Modal with status updates */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={async (orderId, newStatus) => {
          await onUpdateOrderStatus(orderId, newStatus);
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
          }
        }}
        onUpdatePaymentStatus={async (orderId, newPaymentStatus) => {
          await onUpdateOrderPaymentStatus(orderId, newPaymentStatus);
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
          }
        }}
        onDeleteOrder={async (orderId) => {
          await onDeleteOrder(orderId);
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};
