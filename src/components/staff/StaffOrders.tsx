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
  MessageCircle,
  ChevronRight,
  X,
  CreditCard,
  QrCode,
  FileText
} from 'lucide-react';
import { buildLink, buildStatusMessage } from '../../lib/whatsapp';

const STATUS_OPTIONS: { id: 'all' | CustomerOrder['status']; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'Confirmed', label: 'Confirmed (Packing)' },
  { id: 'Ready for Pickup', label: 'Ready for Pickup' },
  { id: 'Dispatched', label: 'Dispatched (In Transit)' },
  { id: 'Completed', label: 'Completed (Delivered)' },
  { id: 'Cancelled', label: 'Cancelled' }
];

const PAYMENT_STATUS_OPTIONS: { id: 'all' | PaymentStatus; label: string }[] = [
  { id: 'all', label: 'All Payments' },
  { id: 'paid', label: 'Paid' },
  { id: 'verification_pending', label: 'Pending Verification' },
  { id: 'unpaid', label: 'Unpaid (COD)' },
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
  const readyPickupCount = orders.filter(o => o.status === 'Ready for Pickup').length;

  const handleOpenDetail = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

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
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'pay_at_store': return 'Pay at Store Counter';
      case 'upi': return 'Instant UPI / QR';
      case 'card': return 'Card Online';
      default: return method || 'Standard';
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
        return 'bg-stone-100 text-stone-700 border-stone-200';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6D1A33] uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Order Processing & Logistics</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-[#1D1D1F] tracking-tight">
              Customer Orders & Fulfilment
            </h1>
            <span className="text-xs bg-[#F3E8EB] text-[#6D1A33] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#6D1A33]/20">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Track customer purchases, advance fulfillment pipelines, verify payments, and generate printable slips
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6E6E73] font-medium uppercase tracking-wider text-[10px]">Active Pipeline</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-800 font-mono mt-1">{pendingCount}</p>
            <p className="text-[11px] text-[#6E6E73] mt-0.5">{readyPickupCount} ready at counter for pickup</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6E6E73] font-medium uppercase tracking-wider text-[10px]">Completed & Delivered</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-800 font-mono mt-1">{completedCount}</p>
            <p className="text-[11px] text-[#6E6E73] mt-0.5">Fulfilled orders successfully closed</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6E6E73] font-medium uppercase tracking-wider text-[10px]">Total Order Value</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] font-mono mt-1">{formatPrice(totalRevenue)}</p>
            <p className="text-[11px] text-[#6E6E73] mt-0.5">Across all confirmed customer carts</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F3E8EB] border border-[#6D1A33]/20 flex items-center justify-center text-[#6D1A33]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs space-y-4">
        {/* Status Pipeline Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = selectedStatus === opt.id;
            const count = opt.id === 'all' 
              ? orders.length 
              : orders.filter(o => o.status === opt.id).length;

            return (
              <button
                key={opt.id}
                onClick={() => setSelectedStatus(opt.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1D1D1F] text-white shadow-2xs font-bold'
                    : 'bg-[#F5F5F7] text-stone-600 hover:bg-[#EFEFF2] hover:text-stone-900'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search bar & Payment Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-stone-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by Order ID (#1234), customer name, phone number, email, or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-[#6D1A33] focus:bg-white font-medium transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-[#6D1A33] focus:bg-white font-medium transition-colors cursor-pointer"
            >
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6E6E73] pt-1 border-t border-stone-100">
          <span>
            Showing <strong className="text-[#1D1D1F]">{filteredOrders.length}</strong> of{' '}
            <strong className="text-[#1D1D1F]">{orders.length}</strong> orders
          </span>
          {(filteredOrders.length !== orders.length || searchTerm || selectedStatus !== 'all' || selectedPaymentStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedPaymentStatus('all');
              }}
              className="text-[#6D1A33] hover:underline text-[11px] font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display text-base font-bold text-stone-900">
              No Matching Orders
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              No customer orders matched your search criteria or status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedPaymentStatus('all');
              }}
              className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5F7] border-b border-[#E8E8ED] text-stone-500 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Fulfilment Mode</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Order Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
                  const isPickup = order.customer.deliveryType === 'store_pickup';
                  const nextStatus = getNextStatus(order.status);
                  const whatsappUrl = buildLink(order.customer.phone, buildStatusMessage(order, order.status));

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-mono font-bold text-[#6D1A33] text-sm">
                          #{order.id}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                          <span className="font-mono text-stone-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-stone-900">{order.customer.name}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono mt-0.5">
                          <span>{order.customer.phone}</span>
                        </div>
                      </td>

                      {/* Fulfilment Mode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPickup ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                              <Store className="w-3.5 h-3.5 text-purple-700" />
                              Store Pickup
                            </span>
                            {order.customer.pickupSlot && (
                              <p className="text-[10px] text-stone-500 font-mono">{order.customer.pickupSlot}</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              <Truck className="w-3.5 h-3.5 text-blue-700" />
                              Home Delivery
                            </span>
                            {order.customer.shippingAddress && (
                              <p className="text-[10px] text-stone-500 truncate max-w-[130px]" title={order.customer.shippingAddress}>
                                {order.customer.shippingAddress}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-stone-800 text-xs">
                              {formatPaymentMethod(order.paymentMethod)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${getPaymentBadge(order.paymentStatus || 'unpaid')}`}>
                              {order.paymentStatus === 'verification_pending' ? 'Verification Pending' : (order.paymentStatus || 'unpaid')}
                            </span>
                          </div>
                          {order.paymentReference && (
                            <p className="text-[10px] font-mono text-stone-500">
                              Ref: <span className="font-bold text-stone-700">{order.paymentReference}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateOrderPaymentStatus(order.id, 'paid')}
                              disabled={(order.paymentStatus || 'unpaid') === 'paid'}
                              className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                              title="Mark Paid"
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderPaymentStatus(order.id, 'unpaid')}
                              disabled={(order.paymentStatus || 'unpaid') === 'unpaid'}
                              className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                              title="Mark Unpaid"
                            >
                              Unpaid
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900">{itemCount} pieces</span>
                        <p className="text-[11px] text-stone-500 truncate max-w-[150px] mt-0.5">
                          {order.items[0]?.item.name}
                          {order.items.length > 1 && ` (+${order.items.length - 1} more)`}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1D1D1F] text-sm whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as CustomerOrder['status'])}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Fast forward status button */}
                          {nextStatus && (
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                              className="px-2.5 py-1.5 bg-stone-900 hover:bg-[#6D1A33] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title={`Advance to ${nextStatus}`}
                            >
                              <span>{nextStatus}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {/* WhatsApp Customer */}
                          {order.customer.phone && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                              title={`WhatsApp ${order.customer.name}`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {/* View Slip / Invoice */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                            title="View Printable Order Invoice"
                          >
                            <FileText className="w-4 h-4" />
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

      {/* Order Detail Modal */}
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
