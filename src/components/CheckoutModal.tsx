import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Store, 
  Truck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Printer, 
  ShoppingBag,
  Scissors
} from 'lucide-react';
import { CartItem, CustomerOrder } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { formatPrice, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from '../lib/format';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  appliedCoupon: string | null;
  onOrderPlaced: (order: CustomerOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discountAmount,
  appliedCoupon,
  onOrderPlaced
}) => {
  if (!isOpen) return null;

  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home_delivery'>('store_pickup');
  const [pickupSlot, setPickupSlot] = useState('Today (2:00 PM – 4:00 PM)');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [alterationNote, setAlterationNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cash_counter'>('upi');
  const [orderComplete, setOrderComplete] = useState<CustomerOrder | null>(null);

  const deliveryFee = deliveryType === 'home_delivery' 
    ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE) 
    : 0;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.05; // 5% GST
  const totalAmount = taxableAmount + deliveryFee + tax;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      alert('Please fill in your name, contact phone, and email.');
      return;
    }
    if (deliveryType === 'home_delivery' && !shippingAddress) {
      alert('Please provide your delivery address.');
      return;
    }

    const orderId = `OB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: CustomerOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items: [...cartItems],
      subtotal,
      discountApplied: discountAmount,
      couponCode: appliedCoupon || undefined,
      deliveryFee,
      tax,
      totalAmount,
      customer: {
        name,
        email,
        phone,
        deliveryType,
        pickupSlot: deliveryType === 'store_pickup' ? pickupSlot : undefined,
        shippingAddress: deliveryType === 'home_delivery' ? shippingAddress : undefined,
        notes: alterationNote || undefined
      },
      paymentMethod,
      status: deliveryType === 'store_pickup' ? 'Ready for Pickup' : 'Confirmed'
    };

    setOrderComplete(newOrder);
    onOrderPlaced(newOrder);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* If Order is complete -> Display Printable Tax Receipt */}
        {orderComplete ? (
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif-display font-bold text-stone-900">
                Order Confirmed!
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Thank you for choosing {STORE_CENTRE_INFO.name}.
              </p>
            </div>

            {/* Printable Tax Invoice Container */}
            <div id="clothing-centre-invoice" className="bg-stone-50 border border-stone-300 rounded-xl p-6 text-stone-800 text-xs font-sans shadow-xs">
              {/* Receipt Header */}
              <div className="border-b border-stone-300 pb-4 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <h3 className="font-serif-display text-base font-bold text-stone-900 uppercase">
                    {STORE_CENTRE_INFO.name}
                  </h3>
                  <p className="text-stone-500 text-[11px]">{STORE_CENTRE_INFO.address}</p>
                  <p className="text-stone-500 text-[11px]">Phone: {STORE_CENTRE_INFO.phone}</p>
                  <p className="text-stone-500 text-[11px]">GSTIN / Tax ID: 33AAAAA0000A1Z5</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block bg-stone-900 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                    INVOICE #{orderComplete.id}
                  </span>
                  <p className="text-stone-500 text-[11px] mt-1">
                    Date: {new Date(orderComplete.createdAt).toLocaleDateString()} {new Date(orderComplete.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-emerald-700 font-bold text-[11px] mt-0.5">
                    Status: {orderComplete.status}
                  </p>
                </div>
              </div>

              {/* Customer & Fulfilment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3.5 border-b border-stone-300">
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Customer Information:</h4>
                  <p className="font-medium text-stone-800">{orderComplete.customer.name}</p>
                  <p className="text-stone-500">{orderComplete.customer.phone} • {orderComplete.customer.email}</p>
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Fulfilment Method:</h4>
                  {orderComplete.customer.deliveryType === 'store_pickup' ? (
                    <div className="text-stone-700">
                      <span className="font-semibold text-amber-800">Boutique Store Pickup</span>
                      <p className="text-[11px] text-stone-500">Slot: {orderComplete.customer.pickupSlot}</p>
                      <p className="text-[11px] text-stone-500">Counter: Main Boutique Reception</p>
                    </div>
                  ) : (
                    <div className="text-stone-700">
                      <span className="font-semibold text-stone-800">Express Doorstep Delivery</span>
                      <p className="text-[11px] text-stone-500">{orderComplete.customer.shippingAddress}</p>
                    </div>
                  )}
                  {orderComplete.customer.notes && (
                    <p className="text-[11px] text-amber-900 mt-1 italic">
                      Custom Alteration Note: "{orderComplete.customer.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-stone-500 border-b border-stone-200">
                      <th className="py-1.5 font-semibold">Garment Description</th>
                      <th className="py-1.5 font-semibold text-center">Size/Color</th>
                      <th className="py-1.5 font-semibold text-center">Qty</th>
                      <th className="py-1.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {orderComplete.items.map((it, idx) => (
                      <tr key={idx} className="text-stone-800">
                        <td className="py-2">
                          <p className="font-bold text-stone-900">{it.item.name}</p>
                          <p className="text-[10px] text-stone-500 font-mono">SKU: {it.item.sku}</p>
                        </td>
                        <td className="py-2 text-center text-[11px]">
                          {it.selectedSize} / {it.selectedColor.name}
                        </td>
                        <td className="py-2 text-center font-bold">
                          {it.quantity}
                        </td>
                        <td className="py-2 text-right font-bold font-mono">
                          {formatPrice(it.item.price * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-stone-300 pt-3 space-y-1 text-right">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPrice(orderComplete.subtotal)}</span>
                </div>
                {orderComplete.discountApplied > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({orderComplete.couponCode}):</span>
                    <span className="font-mono">-{formatPrice(orderComplete.discountApplied)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Fulfilment ({orderComplete.customer.deliveryType === 'store_pickup' ? 'Boutique Pickup' : 'Delivery'}):</span>
                  <span className="font-mono">{orderComplete.deliveryFee === 0 ? 'FREE' : formatPrice(orderComplete.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (5%):</span>
                  <span className="font-mono">{formatPrice(orderComplete.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-300">
                  <span>Total Paid ({orderComplete.paymentMethod.toUpperCase()}):</span>
                  <span className="font-mono">{formatPrice(orderComplete.totalAmount)}</span>
                </div>
              </div>

              {/* Barcode visual */}
              <div className="mt-5 pt-4 border-t border-dashed border-stone-300 text-center">
                <div className="inline-block tracking-widest font-mono text-xl text-stone-800 font-black">
                  ||| | | |||| | ||| |||| | | |||
                </div>
                <p className="text-[10px] text-stone-400 font-mono mt-1">
                  BARCODE: {orderComplete.id} • PRESENT AT BOUTIQUE COUNTER
                </p>
                <p className="text-[10px] text-stone-500 mt-2 italic">
                  Keep this slip for 7-day exchange and complimentary alterations & saree fall pico.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice / Slip</span>
              </button>
              <button
                id="finish-order-btn"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Continue Browsing Boutique</span>
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-serif-display">
                    {STORE_CENTRE_INFO.name} Checkout
                  </h2>
                  <p className="text-xs text-stone-500">
                    Boutique Store Collection or Doorstep Delivery
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-checkout-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fulfilment Type Switcher */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                1. Select Fulfilment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  id="delivery-store-pickup-btn"
                  onClick={() => setDeliveryType('store_pickup')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryType === 'store_pickup'
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <Store className={`w-5 h-5 shrink-0 ${deliveryType === 'store_pickup' ? 'text-amber-800' : 'text-stone-400'}`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900">Boutique Store Pickup</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">FREE</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Ready in 2 hours at our {STORE_CENTRE_INFO.address.split(',')[1]?.trim() || 'T. Nagar'} Boutique. Try it on immediately!
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  id="delivery-home-btn"
                  onClick={() => setDeliveryType('home_delivery')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryType === 'home_delivery'
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <Truck className={`w-5 h-5 shrink-0 ${deliveryType === 'home_delivery' ? 'text-amber-800' : 'text-stone-400'}`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900">Doorstep Delivery</span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {subtotal >= FREE_DELIVERY_THRESHOLD ? 'FREE' : formatPrice(STANDARD_DELIVERY_FEE)}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Complimentary on orders above {formatPrice(FREE_DELIVERY_THRESHOLD)}. Packed in secure protective drape packaging.
                    </p>
                  </div>
                </button>
              </div>

              {/* Pickup Time Slot if store pickup */}
              {deliveryType === 'store_pickup' && (
                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Preferred Collection Window:
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-amber-600"
                  >
                    <option value="Today (2:00 PM – 4:00 PM)">Today (2:00 PM – 4:00 PM)</option>
                    <option value="Today (4:00 PM – 7:00 PM)">Today (4:00 PM – 7:00 PM)</option>
                    <option value="Today (7:00 PM – 8:30 PM)">Today (7:00 PM – 8:30 PM)</option>
                    <option value="Tomorrow (10:30 AM – 1:30 PM)">Tomorrow (10:30 AM – 1:30 PM)</option>
                    <option value="Tomorrow (2:00 PM – 6:00 PM)">Tomorrow (2:00 PM – 6:00 PM)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                2. Customer & Contact Details
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sundaram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Mobile Number (for Order & Pickup SMS) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Email (for Digital Invoice) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ananya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>

                {deliveryType === 'home_delivery' && (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">Delivery Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Flat/House No., Building, Street, Landmark, City & PIN code..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                    />
                  </div>
                )}
              </div>

              {/* Optional Custom Alterations Note */}
              <div className="mt-3">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-800 mb-1">
                  <Scissors className="w-3.5 h-3.5 text-amber-700" />
                  <span>Complimentary Saree Fall, Pico or Alteration Note (Optional):</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Attach saree fall & pico, or tailor kurti side slits"
                  value={alterationNote}
                  onChange={(e) => setAlterationNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                3. Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  id="pay-upi-btn"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'upi'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-2 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block">Instant UPI / QR</span>
                    <span className="text-[10px] opacity-80">GPay, PhonePe, Paytm</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="pay-card-btn"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'card'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-2 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block">Credit / Debit Card</span>
                    <span className="text-[10px] opacity-80">Visa, Mastercard, RuPay</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="pay-cash-counter-btn"
                  onClick={() => setPaymentMethod('cash_counter')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'cash_counter'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-2 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block">Pay at Boutique</span>
                    <span className="text-[10px] opacity-80">Cash or UPI upon pickup</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Order Total Overview */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 mb-6 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} garments):</span>
                <span className="font-semibold text-stone-900 font-mono">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Savings ({appliedCoupon}):</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Fulfilment ({deliveryType === 'store_pickup' ? 'Boutique Pickup' : 'Express Delivery'}):</span>
                <span className="font-mono">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST (5%):</span>
                <span className="font-mono">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-300">
                <span>Total Amount:</span>
                <span className="font-mono">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                Back to Bag
              </button>
              <button
                id="place-clothing-order-btn"
                type="submit"
                className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <span>Confirm & Place Order ({formatPrice(totalAmount)})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
