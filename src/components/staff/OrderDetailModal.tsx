import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Truck, 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  MessageCircle, 
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { CustomerOrder, PaymentStatus } from '../../types';
import { STORE_CENTRE_INFO } from '../../data/clothingData';
import { formatPrice, STORE_GSTIN } from '../../lib/format';
import { buildLink, buildStatusMessage } from '../../lib/whatsapp';

interface OrderDetailModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: CustomerOrder['status']) => Promise<void>;
  onUpdatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDeleteOrder
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Permanently delete Order #${order.id}? This cannot be undone.`);
    if (confirmed) {
      onDeleteOrder(order.id);
      onClose();
    }
  };

  const currentPaymentStatus: PaymentStatus = order.paymentStatus || 'unpaid';

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery (COD)';
      case 'pay_at_store': return 'Pay at Store Counter';
      case 'upi': return 'Instant UPI / QR';
      case 'card': return 'Card Payment';
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

  const isPickup = order.customer.deliveryType === 'store_pickup';
  const whatsappUrl = buildLink(order.customer.phone, buildStatusMessage(order, order.status));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Header */}
        <div className="p-6 bg-[#F5F5F7] border-b border-[#E8E8ED] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D1A33] text-[#C9A45C] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              Y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-[#1D1D1F]">Order #{order.id}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F3E8EB] text-[#6D1A33] border border-[#6D1A33]/20">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-[#6E6E73] mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{new Date(order.createdAt).toLocaleString()}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">GSTIN: {STORE_GSTIN}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 transition-colors cursor-pointer shadow-2xs"
              title="Print Boutique Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-7 space-y-6 text-xs">
          {/* Fulfillment Status Stepper Row */}
          <div className="p-4 bg-[#FBFBFC] rounded-2xl border border-[#E8E8ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-[#1D1D1F] text-sm">Fulfillment Status</span>
              <p className="text-[11px] text-[#6E6E73]">Update progression as garments are packed or dispatched</p>
            </div>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#6D1A33] cursor-pointer shadow-2xs"
            >
              <option value="Confirmed">Confirmed (Processing)</option>
              <option value="Ready for Pickup">Ready for Store Pickup</option>
              <option value="Dispatched">Dispatched (With Courier)</option>
              <option value="Completed">Completed (Delivered)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Details & Action Controls */}
          <div className="p-4 bg-[#FBFBFC] rounded-2xl border border-[#E8E8ED] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[#1D1D1F] flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-4 h-4 text-[#6D1A33]" />
                  <span>Payment Status</span>
                </span>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  Method: <strong className="text-stone-900">{formatPaymentMethod(order.paymentMethod)}</strong>
                  {order.paymentReference && (
                    <> • UTR / Ref: <span className="font-mono font-bold text-stone-900">{order.paymentReference}</span></>
                  )}
                </p>
              </div>

              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider self-start sm:self-auto ${getPaymentBadge(currentPaymentStatus)}`}>
                {currentPaymentStatus === 'verification_pending' ? 'Verification Pending' : currentPaymentStatus}
              </span>
            </div>

            {/* Quick Payment Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => onUpdatePaymentStatus(order.id, 'paid')}
                disabled={currentPaymentStatus === 'paid'}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-800 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Mark as Paid
              </button>
              <button
                type="button"
                onClick={() => onUpdatePaymentStatus(order.id, 'unpaid')}
                disabled={currentPaymentStatus === 'unpaid'}
                className="px-3 py-1.5 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 hover:text-stone-900 border border-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Mark as Unpaid
              </button>
              <button
                type="button"
                onClick={() => onUpdatePaymentStatus(order.id, 'refunded')}
                disabled={currentPaymentStatus === 'refunded'}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-rose-800 hover:text-white border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Mark as Refunded
              </button>
            </div>
          </div>

          {/* Customer & Delivery Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#E8E8ED] bg-white space-y-2.5">
              <h4 className="font-bold text-[#1D1D1F] text-xs uppercase tracking-wider">
                Customer Information
              </h4>
              <p className="font-bold text-[#1D1D1F] text-sm">{order.customer.name}</p>
              <p className="flex items-center gap-2 text-stone-600 font-mono">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <a href={`tel:${order.customer.phone}`} className="hover:underline hover:text-[#6D1A33]">{order.customer.phone}</a>
              </p>
              <p className="flex items-center gap-2 text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <a href={`mailto:${order.customer.email}`} className="hover:underline hover:text-[#6D1A33] truncate">{order.customer.email}</a>
              </p>

              {order.customer.phone && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Update</span>
                </a>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-[#E8E8ED] bg-white space-y-2.5">
              <h4 className="font-bold text-[#1D1D1F] text-xs uppercase tracking-wider flex items-center gap-1.5">
                {isPickup ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-[#6D1A33]" />
                    <span>In-Store Counter Pickup</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Home Delivery</span>
                  </>
                )}
              </h4>

              {isPickup ? (
                <>
                  <p className="text-stone-700">
                    Collection Centre: <strong className="text-[#1D1D1F]">{STORE_CENTRE_INFO.name}</strong>
                  </p>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Kallimandayam & Oddanchatram Flagship Boutique
                  </p>
                  <p className="flex items-center gap-1.5 text-stone-600 font-mono text-[11px] pt-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{order.customer.pickupSlot || 'Ready for boutique collection'}</span>
                  </p>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-stone-700 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 inline mr-1" />
                    {order.customer.shippingAddress || 'No address specified'}
                  </p>
                  <p className="text-[11px] text-stone-500">Pan-India Courier Logistics</p>
                </div>
              )}

              {order.customer.notes && (
                <div className="pt-2 border-t border-stone-100 text-stone-500 text-[11px]">
                  <strong className="text-stone-800">Special Instructions:</strong> {order.customer.notes}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Garments Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1D1D1F] text-xs uppercase tracking-wider">
              Itemized Garments ({order.items.length})
            </h4>
            <div className="border border-[#E8E8ED] rounded-2xl overflow-hidden divide-y divide-stone-100">
              {order.items.map((cartItem, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-12 rounded-xl bg-[#F5F5F7] border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {cartItem.item.images?.[0] ? (
                        <img src={cartItem.item.images[0]} alt={cartItem.item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 leading-tight truncate">{cartItem.item.name}</p>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        Size: <strong className="text-stone-800">{cartItem.selectedSize}</strong> · Color: {cartItem.selectedColor?.name || 'Standard'} · Qty: {cartItem.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-stone-900 shrink-0">
                    {formatPrice(cartItem.item.price * cartItem.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & GST Totals */}
          <div className="p-5 bg-[#FBFBFC] rounded-2xl border border-[#E8E8ED] space-y-2 font-mono text-stone-600">
            <div className="flex justify-between text-xs">
              <span>Subtotal:</span>
              <span className="text-stone-900 font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountApplied > 0 && (
              <div className="flex justify-between text-xs text-[#6D1A33]">
                <span>Discount Applied ({order.couponCode || 'Promo'}):</span>
                <span>-{formatPrice(order.discountApplied)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span>Delivery Fee:</span>
              <span className="text-stone-900 font-semibold">{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>GST (5% Apparel):</span>
              <span className="text-stone-900 font-semibold">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#1D1D1F] pt-2.5 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="text-lg text-[#6D1A33]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Delete Order Record
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#1D1D1F] hover:bg-[#6D1A33] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
            >
              Close Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
