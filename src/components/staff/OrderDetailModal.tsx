import { X, Printer, CheckCircle, Truck, Store, Phone, Mail, MapPin, Clock, Calendar, MessageCircle, DollarSign } from 'lucide-react';
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
    const confirmed = window.confirm(`Permanently delete Order #${order.id}?`);
    if (confirmed) {
      onDeleteOrder(order.id);
      onClose();
    }
  };

  const currentPaymentStatus: PaymentStatus = order.paymentStatus || 'unpaid';

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery (COD)';
      case 'pay_at_store': return 'Pay at Store';
      case 'upi': return 'Instant UPI / QR';
      case 'card': return 'Card Online (Legacy)';
      default: return method || 'Not Specified';
    }
  };

  const getPaymentBadge = (status: PaymentStatus | string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
      case 'verification_pending':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
      case 'refunded':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/80';
      case 'unpaid':
      default:
        return 'bg-surface-2 text-text-muted border-border';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-surface rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-border flex flex-col relative text-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-surface-2 text-text flex items-center justify-between border-b border-border sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-white">Order #{order.id}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink/15 text-pink border border-pink/30">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-surface hover:bg-surface-2 text-text-muted hover:text-text border border-border transition-colors cursor-pointer"
              title="Print Receipt Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface-2 text-text-muted hover:text-text border border-border flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Status Control */}
          <div className="p-4 bg-surface-2/70 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-text">Update Fulfillment Status</span>
              <p className="text-[11px] text-text-muted">Change status as the order progresses</p>
            </div>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
              className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-pink"
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status & Quick Actions Control */}
          <div className="p-4 bg-surface-2/70 rounded-xl border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-text flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-pink" />
                  <span>Payment Details</span>
                </span>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Method: <strong className="text-text">{formatPaymentMethod(order.paymentMethod)}</strong>
                  {order.paymentReference && (
                    <> • UTR / Ref: <span className="font-mono font-bold text-pink-tint">{order.paymentReference}</span></>
                  )}
                </p>
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${getPaymentBadge(currentPaymentStatus)}`}>
                {currentPaymentStatus === 'verification_pending' ? 'Verification Pending' : currentPaymentStatus}
              </span>
            </div>

            {/* Quick action buttons: "Mark paid", "Mark unpaid" and "Mark refunded" */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => onUpdatePaymentStatus(order.id, 'paid')}
                disabled={currentPaymentStatus === 'paid'}
                className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-300 hover:text-white border border-emerald-800/60 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Mark paid
              </button>
              <button
                type="button"
                onClick={() => onUpdatePaymentStatus(order.id, 'unpaid')}
                disabled={currentPaymentStatus === 'unpaid'}
                className="px-3 py-1.5 bg-surface hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed text-text-muted hover:text-text border border-border rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Mark unpaid
              </button>
              <button
                type="button"
                onClick={() => onUpdatePaymentStatus(order.id, 'refunded')}
                disabled={currentPaymentStatus === 'refunded'}
                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-rose-300 hover:text-white border border-rose-800/60 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Mark refunded
              </button>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-2">
              <h4 className="font-bold text-text flex items-center gap-1.5">
                <span>Customer Information</span>
              </h4>
              <p className="font-semibold text-text text-sm">{order.customer.name}</p>
              <p className="flex items-center gap-2 text-text-muted">
                <Phone className="w-3.5 h-3.5 text-text-muted" />
                <a href={`tel:${order.customer.phone}`} className="hover:underline hover:text-pink">{order.customer.phone}</a>
              </p>
              <p className="flex items-center gap-2 text-text-muted">
                <Mail className="w-3.5 h-3.5 text-text-muted" />
                <a href={`mailto:${order.customer.email}`} className="hover:underline hover:text-pink">{order.customer.email}</a>
              </p>
              {order.customerUid && (
                <p className="text-[10px] text-text-muted/70 font-mono">
                  Registered UID: {order.customerUid.slice(0, 10)}...
                </p>
              )}
              {order.customer.phone && (
                <a
                  href={buildLink(order.customer.phone, buildStatusMessage(order, order.status))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 w-full py-2 px-3 bg-emerald-950/50 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-800/60 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message customer</span>
                </a>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-2">
              <h4 className="font-bold text-text flex items-center gap-1.5">
                {order.customer.deliveryType === 'store_pickup' ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-pink" />
                    <span>In-Store Collection</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 text-pink" />
                    <span>Home Delivery</span>
                  </>
                )}
              </h4>

              {order.customer.deliveryType === 'store_pickup' ? (
                <>
                  <p className="text-text-muted">
                    Collection Centre: <strong className="text-text">{STORE_CENTRE_INFO.name}</strong>
                  </p>
                  <p className="flex items-center gap-1.5 text-text-muted">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <span>{order.customer.pickupSlot || 'Ready at boutique counter'}</span>
                  </p>
                </>
              ) : (
                <p className="text-text-muted leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-text-muted inline mr-1" />
                  {order.customer.shippingAddress || 'No address specified'}
                </p>
              )}

              {order.customer.notes && (
                <div className="pt-2 border-t border-border text-text-muted text-[11px]">
                  <strong className="text-text">Notes:</strong> {order.customer.notes}
                </div>
              )}
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <h4 className="font-bold text-text mb-2">Itemized Garments ({order.items.length})</h4>
            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
              {order.items.map((cartItem, idx) => (
                <div key={idx} className="p-3 bg-surface flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {cartItem.item.images?.[0] ? (
                        <img src={cartItem.item.images[0]} alt={cartItem.item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: cartItem.selectedColor?.hex || '#2A2A2A' }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-text">{cartItem.item.name}</p>
                      <p className="text-[11px] text-text-muted font-mono">
                        Size: <strong className="text-pink-tint">{cartItem.selectedSize}</strong> · Color: {cartItem.selectedColor?.name || 'Default'} · Qty: {cartItem.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-text">
                    {formatPrice(cartItem.item.price * cartItem.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & totals */}
          <div className="p-4 bg-surface-2/70 rounded-xl border border-border space-y-1.5 font-mono text-text-muted">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-text">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountApplied > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Discount ({order.couponCode || 'Promo'}):</span>
                <span>-{formatPrice(order.discountApplied)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="text-text">{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'FREE'}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5% Apparel):</span>
              <span className="text-text">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-text pt-2 border-t border-border">
              <span>Total Amount:</span>
              <span className="text-base text-pink">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="pt-1 text-[11px] text-text-muted flex justify-between font-sans">
              <span>Payment Details:</span>
              <span className="font-semibold text-text">
                {formatPaymentMethod(order.paymentMethod)} • {currentPaymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Delete Order Record
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-pink hover:bg-pink-strong text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
