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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif-display">
                {customerUid ? 'My Orders & Receipts' : `${STORE_CENTRE_INFO.name} Receipts & Slips`}
              </h2>
              <p className="text-xs text-stone-500">
                {customerUid ? 'View and track your boutique orders & pickup slips' : 'Official store receipts & collection slips'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
          {/* Order List / Finder */}
          <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-stone-200 pr-0 md:pr-4">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID, name, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-amber-600 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-6 text-stone-500 text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
                  <span>Loading orders...</span>
                </div>
              ) : error ? (
                <div className="text-center py-6 text-rose-600 text-xs">
                  {error}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-6 text-stone-500 text-xs">
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
                          ? 'border-amber-600 bg-amber-50/70 shadow-2xs font-medium text-stone-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-bold ${isSelected ? 'text-amber-800' : 'text-stone-900'}`}>#{order.id}</span>
                        <span className="text-[10px] bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded font-semibold text-stone-800 font-mono">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                      <p className="text-stone-900 font-semibold mt-1">{order.customer.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="text-emerald-700 font-bold">{order.status}</span>
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
              <div className="bg-stone-50 border border-stone-300 rounded-xl p-5 text-xs text-stone-800 space-y-4">
                {/* Top header */}
                <div className="flex justify-between items-start border-b border-stone-300 pb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src="/brand/logo.png"
                      alt="Yaazh Boutique logo"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h3 className="font-serif-display font-bold text-sm text-stone-900 uppercase">
                        {STORE_CENTRE_INFO.name}
                      </h3>
                      <p className="text-[11px] text-stone-500">{STORE_CENTRE_INFO.address}</p>
                      <p className="text-[11px] text-stone-500">
                        Phone: {STORE_CENTRE_INFO.phone} {STORE_CENTRE_INFO.phone2 ? `• ${STORE_CENTRE_INFO.phone2}` : ''}
                      </p>
                      {Boolean(STORE_GSTIN) && (
                        <p className="text-[11px] text-stone-500">GSTIN: {STORE_GSTIN}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-stone-900 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                      ORDER #{selectedOrder.id}
                    </span>
                    <p className="text-[10px] text-stone-500 mt-1">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Box */}
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-stone-900">Fulfilment Status: </span>
                      <span className="text-emerald-700 font-bold uppercase">{selectedOrder.status}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    {selectedOrder.customer.deliveryType === 'store_pickup' ? 'Boutique Pickup' : 'Home Delivery'}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-3 text-[11px] bg-white p-2.5 rounded-lg border border-stone-200">
                  <div>
                    <span className="text-stone-500 block">Customer:</span>
                    <span className="font-semibold text-stone-900">{selectedOrder.customer.name}</span>
                    <span className="text-stone-500 block">{selectedOrder.customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Fulfilment:</span>
                    <span className="font-medium text-stone-900">
                      {selectedOrder.customer.deliveryType === 'store_pickup'
                        ? `Pickup Slot: ${selectedOrder.customer.pickupSlot || 'Standard'}`
                        : `Address: ${selectedOrder.customer.shippingAddress || 'Standard'}`}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-bold text-stone-900 mb-2">Item Breakdown:</h4>
                  <div className="divide-y divide-stone-200 bg-white border border-stone-200 rounded-lg p-2">
                    {selectedOrder.items.map((i, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-stone-900">{i.item.name}</p>
                          <p className="text-[10px] text-stone-500 font-mono">
                            Size: {i.selectedSize} | Color: {i.selectedColor.name} | Qty: {i.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-stone-900 font-mono">
                          {formatPrice(i.item.price * i.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-stone-300 pt-2 space-y-1 text-right text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-stone-900">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountApplied > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({selectedOrder.couponCode}):</span>
                      <span className="font-mono">-{formatPrice(selectedOrder.discountApplied)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-mono text-stone-900">{selectedOrder.deliveryFee === 0 ? 'FREE' : formatPrice(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span className="font-mono text-stone-900">{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-300">
                    <span>Grand Total:</span>
                    <span className="font-mono text-stone-900">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Payment Method:</span>
                    <span className="font-medium text-stone-900">
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod === 'pay_at_store' ? 'Pay at Store' : selectedOrder.paymentMethod === 'upi' ? 'Instant UPI' : (selectedOrder.paymentMethod || 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Payment Status:</span>
                    <span className={`font-semibold uppercase tracking-wider text-[10px] ${selectedOrder.paymentStatus === 'paid' ? 'text-emerald-700' : selectedOrder.paymentStatus === 'verification_pending' ? 'text-amber-700' : 'text-stone-500'}`}>
                      {selectedOrder.paymentStatus === 'verification_pending' ? 'Verification Pending' : (selectedOrder.paymentStatus || 'Unpaid')}
                    </span>
                  </div>
                  {selectedOrder.paymentReference && (
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>Payment Ref / UTR:</span>
                      <span className="font-bold text-stone-900">{selectedOrder.paymentReference}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs">
                Select an order to view the customer receipt.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
