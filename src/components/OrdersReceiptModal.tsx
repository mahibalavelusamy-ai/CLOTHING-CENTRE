import React, { useState } from 'react';
import { X, Receipt, Search, Printer, Store, CheckCircle, Package } from 'lucide-react';
import { CustomerOrder } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';

interface OrdersReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
}

export const OrdersReceiptModal: React.FC<OrdersReceiptModalProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(orders[0] || null);

  const filteredOrders = orders.filter(o => 
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
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif-display">
                Clothing Centre Order Receipts
              </h2>
              <p className="text-xs text-stone-500">
                Official store slips for pickup, exchange & alteration warranty
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
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
                placeholder="Search Order ID, name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs">
                  No receipts found.
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
                          ? 'border-amber-600 bg-amber-50/70 shadow-2xs font-medium'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-stone-900">#{order.id}</span>
                        <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded font-semibold text-stone-800">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-stone-800 font-semibold mt-1">{order.customer.name}</p>
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
                  <div>
                    <h3 className="font-serif-display font-bold text-sm text-stone-900 uppercase">
                      {STORE_CENTRE_INFO.name}
                    </h3>
                    <p className="text-[11px] text-stone-500">{STORE_CENTRE_INFO.address}</p>
                    <p className="text-[11px] text-stone-500">Phone: {STORE_CENTRE_INFO.phone}</p>
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
                    {selectedOrder.customer.deliveryType === 'store_pickup' ? 'Centre Pickup' : 'Home Delivery'}
                  </span>
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
                        <span className="font-bold text-stone-900">
                          ${(i.item.price * i.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-stone-300 pt-2 flex justify-between font-bold text-sm text-stone-900">
                  <span>Grand Total (Taxes Incl.):</span>
                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
