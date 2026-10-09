import React, { useState, useEffect } from 'react';
import { X, Receipt, Search, Printer, CheckCircle, Loader2 } from 'lucide-react';
import { CustomerOrder } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { formatPrice, STORE_GSTIN } from '../lib/format';
import { subscribeToCustomerOrders } from '../lib/firebase';

interface OrdersReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: CustomerOrder[];
  customerUid?: string;
}

export const OrdersReceiptModal: React.FC<OrdersReceiptModalProps> = ({
  isOpen,
  onClose,
  orders = [],
  customerUid
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to live customer-specific orders if customerUid is passed
  useEffect(() => {
    if (!isOpen || !customerUid) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCustomerOrders(
      customerUid,
      (fetchedOrders) => {
        setCustomerOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        console.error('Customer orders error:', err);
        setError('Unable to load your orders.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, customerUid]);

  const activeOrders = customerUid ? customerOrders : orders;
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(activeOrders[0] || null);

  useEffect(() => {
    if (activeOrders.length > 0) {
      if (!selectedOrder || !activeOrders.some(o => o.id === selectedOrder.id)) {
        setSelectedOrder(activeOrders[0]);
      }
    } else {
      setSelectedOrder(null);
    }
  }, [activeOrders]);

  if (!isOpen) return null;

  const filteredOrders = activeOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.phone.includes(searchQuery) ||
    o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text font-serif-display">
                {customerUid ? 'My Orders & Receipts' : `${STORE_CENTRE_INFO.name} Receipts & Slips`}
              </h2>
              <p className="text-xs text-text-muted">
                {customerUid ? 'View and track your boutique orders & pickup slips' : 'Official store receipts & collection slips'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
          {/* Order List / Finder */}
          <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-border pr-0 md:pr-4">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID, name, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-pink placeholder:text-text-muted"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-6 text-text-muted text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-pink" />
                  <span>Loading orders...</span>
                </div>
              ) : error ? (
                <div className="text-center py-6 text-rose-400 text-xs">
                  {error}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-6 text-text-muted text-xs">
                  {customerUid ? "You haven't placed any orders yet." : "No orders or receipts found."}
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-pink bg-pink/15 shadow-2xs font-medium text-text'
                          : 'border-border hover:bg-surface-2 text-text-muted hover:text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-bold ${isSelected ? 'text-pink' : 'text-text'}`}>#{order.id}</span>
                        <span className="text-[10px] bg-surface-2 border border-border px-1.5 py-0.5 rounded font-semibold text-text font-mono">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                      <p className="text-text font-semibold mt-1">{order.customer.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-text-muted mt-1">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="text-emerald-400 font-bold">{order.status}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="md:w-2/3">
            {selectedOrder ? (
              <div className="bg-surface-2 border border-border rounded-xl p-5 text-xs text-text space-y-4">
                {/* Top header */}
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src="/brand/logo.png"
                      alt="Yaazh Boutique logo"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h3 className="font-serif-display font-bold text-sm text-text uppercase">
                        {STORE_CENTRE_INFO.name}
                      </h3>
                      <p className="text-[11px] text-text-muted">{STORE_CENTRE_INFO.address}</p>
                      <p className="text-[11px] text-text-muted">
                        Phone: {STORE_CENTRE_INFO.phone} {STORE_CENTRE_INFO.phone2 ? `• ${STORE_CENTRE_INFO.phone2}` : ''}
                      </p>
                      {Boolean(STORE_GSTIN) && (
                        <p className="text-[11px] text-text-muted">GSTIN: {STORE_GSTIN}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-pink text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                      ORDER #{selectedOrder.id}
                    </span>
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Box */}
                <div className="p-2.5 bg-surface border border-border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-text">Fulfilment Status: </span>
                      <span className="text-emerald-400 font-bold uppercase">{selectedOrder.status}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {selectedOrder.customer.deliveryType === 'store_pickup' ? 'Boutique Pickup' : 'Home Delivery'}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-3 text-[11px] bg-surface p-2.5 rounded-lg border border-border">
                  <div>
                    <span className="text-text-muted block">Customer:</span>
                    <span className="font-semibold text-text">{selectedOrder.customer.name}</span>
                    <span className="text-text-muted block">{selectedOrder.customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Fulfilment:</span>
                    <span className="font-medium text-text">
                      {selectedOrder.customer.deliveryType === 'store_pickup'
                        ? `Pickup Slot: ${selectedOrder.customer.pickupSlot || 'Standard'}`
                        : `Address: ${selectedOrder.customer.shippingAddress || 'Standard'}`}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-bold text-text mb-2">Item Breakdown:</h4>
                  <div className="divide-y divide-border bg-surface border border-border rounded-lg p-2">
                    {selectedOrder.items.map((i, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-text">{i.item.name}</p>
                          <p className="text-[10px] text-text-muted font-mono">
                            Size: {i.selectedSize} | Color: {i.selectedColor.name} | Qty: {i.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-pink font-mono">
                          {formatPrice(i.item.price * i.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-border pt-2 space-y-1 text-right text-text-muted">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-text">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountApplied > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({selectedOrder.couponCode}):</span>
                      <span className="font-mono">-{formatPrice(selectedOrder.discountApplied)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-mono text-text">{selectedOrder.deliveryFee === 0 ? 'FREE' : formatPrice(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span className="font-mono text-text">{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-text pt-1 border-t border-border">
                    <span>Grand Total:</span>
                    <span className="font-mono text-pink">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Payment Method:</span>
                    <span className="font-medium text-text">
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod === 'pay_at_store' ? 'Pay at Store' : selectedOrder.paymentMethod === 'upi' ? 'Instant UPI' : (selectedOrder.paymentMethod || 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Payment Status:</span>
                    <span className={`font-semibold uppercase tracking-wider text-[10px] ${selectedOrder.paymentStatus === 'paid' ? 'text-emerald-400' : selectedOrder.paymentStatus === 'verification_pending' ? 'text-amber-400' : 'text-text-muted'}`}>
                      {selectedOrder.paymentStatus === 'verification_pending' ? 'Verification Pending' : (selectedOrder.paymentStatus || 'Unpaid')}
                    </span>
                  </div>
                  {selectedOrder.paymentReference && (
                    <div className="flex justify-between text-[10px] text-text-muted font-mono">
                      <span>Payment Ref / UTR:</span>
                      <span className="font-bold text-text">{selectedOrder.paymentReference}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-surface hover:bg-surface-2 border border-border text-text rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-xs">
                Select an order to view the customer receipt.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
