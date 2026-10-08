import React from 'react';
import { X, Printer, CheckCircle, Truck, Store, Phone, Mail, MapPin, Clock, Calendar } from 'lucide-react';
import { CustomerOrder } from '../../types';
import { STORE_CENTRE_INFO } from '../../data/clothingData';
import { formatPrice, STORE_GSTIN } from '../../lib/format';

interface OrderDetailModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: CustomerOrder['status']) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-white">Order #{order.id}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              title="Print Receipt Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Status Control */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-amber-900">Update Fulfillment Status</span>
              <p className="text-[11px] text-amber-700">Change status as the order progresses</p>
            </div>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
              className="bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-600"
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                <span>Customer Information</span>
              </h4>
              <p className="font-semibold text-stone-800 text-sm">{order.customer.name}</p>
              <p className="flex items-center gap-2 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <a href={`tel:${order.customer.phone}`} className="hover:underline">{order.customer.phone}</a>
              </p>
              <p className="flex items-center gap-2 text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <a href={`mailto:${order.customer.email}`} className="hover:underline">{order.customer.email}</a>
              </p>
              {order.customerUid && (
                <p className="text-[10px] text-stone-400 font-mono">
                  Registered UID: {order.customerUid.slice(0, 10)}...
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                {order.customer.deliveryType === 'store_pickup' ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-amber-600" />
                    <span>In-Store Collection</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Home Delivery</span>
                  </>
                )}
              </h4>

              {order.customer.deliveryType === 'store_pickup' ? (
                <>
                  <p className="text-stone-600">
                    Collection Centre: <strong className="text-stone-800">{STORE_CENTRE_INFO.name}</strong>
                  </p>
                  <p className="flex items-center gap-1.5 text-stone-600">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{order.customer.pickupSlot || 'Ready at boutique counter'}</span>
                  </p>
                </>
              ) : (
                <p className="text-stone-700 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 inline mr-1" />
                  {order.customer.shippingAddress || 'No address specified'}
                </p>
              )}

              {order.customer.notes && (
                <div className="pt-2 border-t border-stone-200 text-stone-500 text-[11px]">
                  <strong>Notes:</strong> {order.customer.notes}
                </div>
              )}
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <h4 className="font-bold text-stone-900 mb-2">Itemized Garments ({order.items.length})</h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
              {order.items.map((cartItem, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {cartItem.item.images?.[0] ? (
                        <img src={cartItem.item.images[0]} alt={cartItem.item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: cartItem.selectedColor?.hex || '#ccc' }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{cartItem.item.name}</p>
                      <p className="text-[11px] text-stone-500 font-mono">
                        Size: <strong className="text-stone-700">{cartItem.selectedSize}</strong> · Color: {cartItem.selectedColor?.name || 'Default'} · Qty: {cartItem.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-stone-900">
                    {formatPrice(cartItem.item.price * cartItem.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & totals */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 font-mono text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountApplied > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount ({order.couponCode || 'Promo'}):</span>
                <span>-{formatPrice(order.discountApplied)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'FREE'}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5% Apparel):</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-300">
              <span>Total Paid:</span>
              <span className="text-base text-amber-900">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="pt-1 text-[11px] text-stone-500 flex justify-between font-sans">
              <span>Payment Method:</span>
              <span className="font-semibold uppercase tracking-wider text-stone-700">
                {order.paymentMethod === 'upi' ? 'UPI / QR Scan' : order.paymentMethod === 'card' ? 'Card Online' : 'Cash at Counter'}
              </span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Delete Order Record
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
