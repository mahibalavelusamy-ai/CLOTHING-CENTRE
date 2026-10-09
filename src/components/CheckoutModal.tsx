import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Store, 
  Truck, 
  QrCode, 
  Banknote, 
  Printer, 
  ShoppingBag, 
  MessageCircle, 
  AlertCircle, 
  User as UserIcon, 
  Copy, 
  Check 
} from 'lucide-react';
import { CartItem, CustomerOrder, PaymentMethod, PaymentStatus } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { formatPrice, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE, STORE_GSTIN } from '../lib/format';
import { useAuth } from '../lib/authContext';
import { CustomerAuthModal } from './CustomerAuthModal';
import { parseFriendlyErrorMessage } from '../lib/firebase';
import { buildLink, buildOrderMessage } from '../lib/whatsapp';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  appliedCoupon: string | null;
  onOrderPlaced: (order: CustomerOrder) => Promise<void> | void;
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
  const { user, profile, sendVerificationEmail, reloadUser } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home_delivery'>('store_pickup');
  const [pickupSlot, setPickupSlot] = useState('Today (2:00 PM – 4:00 PM)');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_at_store');
  const [paymentReference, setPaymentReference] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [orderComplete, setOrderComplete] = useState<CustomerOrder | null>(null);

  const handleResendVerification = async () => {
    setErrorMessage(null);
    try {
      await sendVerificationEmail();
      setVerificationFeedback('Verification link resent. Please check your inbox.');
    } catch (err: any) {
      setErrorMessage(parseFriendlyErrorMessage(err));
    }
  };

  const handleCheckVerification = async () => {
    setErrorMessage(null);
    setCheckingVerification(true);
    try {
      const refreshed = await reloadUser();
      if (refreshed?.emailVerified) {
        setVerificationFeedback('Email successfully verified! You may now place your order.');
      } else {
        setErrorMessage('Email is not verified yet. Please click the link in your email inbox.');
      }
    } catch (err: any) {
      setErrorMessage(parseFriendlyErrorMessage(err));
    } finally {
      setCheckingVerification(false);
    }
  };

  // Auto-populate customer information if logged in
  useEffect(() => {
    if (user) {
      if (!name && (profile?.displayName || user.displayName)) {
        setName(profile?.displayName || user.displayName || '');
      }
      if (!email && (profile?.email || user.email)) {
        setEmail(profile?.email || user.email || '');
      }
      if (!phone && profile?.phone) {
        setPhone(profile.phone);
      }
      if (!shippingAddress && profile?.address) {
        setShippingAddress(profile.address);
      }
    }
  }, [user, profile]);

  const isUpiConfigured = Boolean(STORE_CENTRE_INFO.upiId?.trim());

  const handleSelectDeliveryType = (type: 'store_pickup' | 'home_delivery') => {
    setDeliveryType(type);
    if (type === 'store_pickup' && paymentMethod === 'cod') {
      setPaymentMethod('pay_at_store');
    } else if (type === 'home_delivery' && paymentMethod === 'pay_at_store') {
      setPaymentMethod('cod');
    }
  };

  const handleCopyUpi = async () => {
    if (!STORE_CENTRE_INFO.upiId) return;
    try {
      await navigator.clipboard.writeText(STORE_CENTRE_INFO.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // safe fallback
    }
  };

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'pay_at_store': return 'Pay at Store';
      case 'upi': return 'Instant UPI';
      default: return method || 'N/A';
    }
  };

  const formatPaymentStatus = (status?: string) => {
    switch (status) {
      case 'unpaid': return 'Unpaid';
      case 'verification_pending': return 'Verification Pending';
      case 'paid': return 'Paid';
      case 'refunded': return 'Refunded';
      default: return status || 'Unpaid';
    }
  };

  if (!isOpen) return null;

  const deliveryFee = deliveryType === 'home_delivery' 
    ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE) 
    : 0;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.05; // 5% GST
  const totalAmount = taxableAmount + deliveryFee + tax;

  const upiDeepLink = isUpiConfigured
    ? `upi://pay?pa=${encodeURIComponent(STORE_CENTRE_INFO.upiId)}&pn=${encodeURIComponent(STORE_CENTRE_INFO.name)}&am=${totalAmount.toFixed(2)}&cu=INR`
    : '';

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!user.emailVerified) {
      setErrorMessage(`Email verification required: Please verify your email (${user.email}) before placing an order. Check your inbox or click "Resend Email" above.`);
      return;
    }

    if (!name || !phone || !email) {
      setErrorMessage('Please fill in your name, contact phone, and email.');
      return;
    }
    if (deliveryType === 'home_delivery' && !shippingAddress) {
      setErrorMessage('Please provide your delivery address.');
      return;
    }

    if (paymentMethod === 'upi') {
      if (!isUpiConfigured) {
        setErrorMessage('UPI payment is currently not available. Please choose another method.');
        return;
      }
      if (!paymentReference.trim()) {
        setErrorMessage('Please enter your UPI transaction reference / UTR number.');
        return;
      }
    }

    // Generate order IDs with crypto.randomUUID (keep an 'OB-' prefix plus 10 characters)
    const uuidClean = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
    const orderId = `OB-${uuidClean}`;

    const paymentStatus: PaymentStatus = paymentMethod === 'upi' ? 'verification_pending' : 'unpaid';

    const newOrder: CustomerOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerUid: user.uid,
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
        notes: orderNote || undefined
      },
      paymentMethod,
      paymentStatus,
      paymentReference: paymentMethod === 'upi' ? paymentReference.trim() : undefined,
      status: 'Confirmed', // Initial status is always 'Confirmed'
      stockDeducted: false
    };

    setSubmitting(true);
    try {
      await onOrderPlaced(newOrder);
      setOrderComplete(newOrder);

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
    } catch (err: unknown) {
      console.error('Order placement failed:', err);
      const friendly = parseFriendlyErrorMessage(err);
      setErrorMessage(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-surface rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-border relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* If Order is complete -> Display Printable Tax Receipt */}
        {orderComplete ? (
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif-display font-bold text-text">
                Order Confirmed!
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Thank you for choosing {STORE_CENTRE_INFO.name}.
              </p>
            </div>

            {/* Printable Tax Invoice Container */}
            <div id="yaazh-boutique-invoice" className="bg-surface-2 border border-border rounded-xl p-6 text-text text-xs font-sans shadow-xs">
              {/* Receipt Header */}
              <div className="border-b border-border pb-4 flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src="/brand/logo.png"
                    alt="Yaazh Boutique logo"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-serif-display text-base font-bold text-text uppercase">
                      {STORE_CENTRE_INFO.name}
                    </h3>
                    <p className="text-text-muted text-[11px]">{STORE_CENTRE_INFO.address}</p>
                    <p className="text-text-muted text-[11px]">
                      Phone: {STORE_CENTRE_INFO.phone} {STORE_CENTRE_INFO.phone2 ? `• ${STORE_CENTRE_INFO.phone2}` : ''}
                    </p>
                    {Boolean(STORE_GSTIN) && (
                      <p className="text-text-muted text-[11px]">GSTIN / Tax ID: {STORE_GSTIN}</p>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block bg-pink text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                    INVOICE #{orderComplete.id}
                  </span>
                  <p className="text-text-muted text-[11px] mt-1">
                    Date: {new Date(orderComplete.createdAt).toLocaleDateString()} {new Date(orderComplete.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-emerald-400 font-bold text-[11px] mt-0.5">
                    Status: {orderComplete.status}
                  </p>
                  <p className="text-text-muted text-[11px] mt-0.5">
                    Payment: <span className="font-semibold text-text">{formatPaymentMethod(orderComplete.paymentMethod)}</span> ({formatPaymentStatus(orderComplete.paymentStatus)})
                  </p>
                  {orderComplete.paymentReference && (
                    <p className="text-text-muted text-[10px] font-mono mt-0.5">
                      Ref: {orderComplete.paymentReference}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer & Fulfilment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3.5 border-b border-border">
                <div>
                  <h4 className="font-bold text-text mb-1">Customer Information:</h4>
                  <p className="font-medium text-text">{orderComplete.customer.name}</p>
                  <p className="text-text-muted">{orderComplete.customer.phone} • {orderComplete.customer.email}</p>
                </div>
                <div>
                  <h4 className="font-bold text-text mb-1">Fulfilment Method:</h4>
                  {orderComplete.customer.deliveryType === 'store_pickup' ? (
                    <div>
                      <span className="font-semibold text-pink">Boutique Store Pickup</span>
                      <p className="text-[11px] text-text-muted">Slot: {orderComplete.customer.pickupSlot}</p>
                      <p className="text-[11px] text-text-muted">Location: {STORE_CENTRE_INFO.name}, Oddanchatram</p>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-text">Express Doorstep Delivery</span>
                      <p className="text-[11px] text-text-muted">{orderComplete.customer.shippingAddress}</p>
                    </div>
                  )}
                  {orderComplete.customer.notes && (
                    <p className="text-[11px] text-pink-tint mt-1 italic">
                      Order Note: "{orderComplete.customer.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-text-muted border-b border-border">
                      <th className="py-1.5 font-semibold">Garment Description</th>
                      <th className="py-1.5 font-semibold text-center">Size/Color</th>
                      <th className="py-1.5 font-semibold text-center">Qty</th>
                      <th className="py-1.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orderComplete.items.map((it, idx) => (
                      <tr key={idx} className="text-text">
                        <td className="py-2">
                          <p className="font-bold text-text">{it.item.name}</p>
                          <p className="text-[10px] text-text-muted font-mono">SKU: {it.item.sku}</p>
                        </td>
                        <td className="py-2 text-center text-[11px]">
                          {it.selectedSize} / {it.selectedColor.name}
                        </td>
                        <td className="py-2 text-center font-bold">
                          {it.quantity}
                        </td>
                        <td className="py-2 text-right font-bold font-mono text-pink">
                          {formatPrice(it.item.price * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1 text-right text-text-muted">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-text">{formatPrice(orderComplete.subtotal)}</span>
                </div>
                {orderComplete.discountApplied > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({orderComplete.couponCode}):</span>
                    <span className="font-mono">-{formatPrice(orderComplete.discountApplied)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Fulfilment ({orderComplete.customer.deliveryType === 'store_pickup' ? 'Boutique Pickup' : 'Delivery'}):</span>
                  <span className="font-mono text-text">{orderComplete.deliveryFee === 0 ? 'FREE' : formatPrice(orderComplete.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span className="font-mono text-text">{formatPrice(orderComplete.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-text pt-2 border-t border-border">
                  <span>Total Amount:</span>
                  <span className="font-mono text-pink">{formatPrice(orderComplete.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Payment Method:</span>
                  <span className="font-medium text-text">{formatPaymentMethod(orderComplete.paymentMethod)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Payment Status:</span>
                  <span className={`font-semibold ${orderComplete.paymentStatus === 'paid' ? 'text-emerald-400' : orderComplete.paymentStatus === 'verification_pending' ? 'text-amber-400' : 'text-text-muted'}`}>
                    {formatPaymentStatus(orderComplete.paymentStatus)}
                  </span>
                </div>
              </div>

              {/* Barcode visual */}
              <div className="mt-5 pt-4 border-t border-dashed border-border text-center">
                <div className="inline-block tracking-widest font-mono text-xl text-text font-black">
                  ||| | | |||| | ||| |||| | | |||
                </div>
                <p className="text-[10px] text-text-muted font-mono mt-1">
                  BARCODE: {orderComplete.id} • PRESENT AT YAAZH BOUTIQUE
                </p>
                <p className="text-[10px] text-text-muted mt-2 italic">
                  Thank you for visiting Yaazh Boutique, Oddanchatram.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-surface-2 hover:bg-surface border border-border text-text rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice</span>
                </button>

                <a
                  href={buildLink(STORE_CENTRE_INFO.whatsapp, buildOrderMessage(orderComplete))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send order details on WhatsApp</span>
                </a>
              </div>

              <button
                id="finish-order-btn"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 btn-primary-glossy rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Continue Browsing</span>
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-pink text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text font-serif-display">
                    {STORE_CENTRE_INFO.name} Checkout
                  </h2>
                  <p className="text-xs text-text-muted">
                    Boutique Store Collection or Doorstep Delivery
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-checkout-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface border border-border text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {verificationFeedback && (
              <div className="mb-6 p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-medium">{verificationFeedback}</span>
              </div>
            )}

            {!user && (
              <div className="mb-6 p-3.5 bg-pink/10 border border-pink/30 rounded-xl text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-text">
                  <UserIcon className="w-4 h-4 shrink-0 text-pink" />
                  <span>
                    <strong>Customer Sign-In Required:</strong> Please sign in to place your order.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3.5 py-1.5 btn-primary-glossy rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}

            {user && !user.emailVerified && (
              <div className="mb-6 p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block">Email Verification Required</span>
                    <span className="text-[11px] text-amber-200/90">
                      Please verify your email (<strong>{user.email}</strong>) before completing checkout.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="px-3 py-1.5 btn-primary-glossy rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Resend Email
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckVerification}
                    disabled={checkingVerification}
                    className="px-3 py-1.5 bg-surface-2 border border-border hover:border-pink/40 text-text font-semibold rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {checkingVerification ? 'Checking...' : 'Check Status'}
                  </button>
                </div>
              </div>
            )}

            {/* Fulfilment Type Switcher */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                1. Select Fulfilment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  id="delivery-store-pickup-btn"
                  onClick={() => handleSelectDeliveryType('store_pickup')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryType === 'store_pickup'
                      ? 'border-pink bg-pink/15 ring-2 ring-pink/20'
                      : 'border-border hover:border-pink/40 bg-surface-2'
                  }`}
                >
                  <Store className={`w-5 h-5 shrink-0 ${deliveryType === 'store_pickup' ? 'text-pink' : 'text-text-muted'}`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-text">Boutique Store Pickup</span>
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold px-1.5 py-0.2 rounded">FREE</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Collect from Yaazh Boutique, Oddanchatram
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  id="delivery-home-btn"
                  onClick={() => handleSelectDeliveryType('home_delivery')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryType === 'home_delivery'
                      ? 'border-pink bg-pink/15 ring-2 ring-pink/20'
                      : 'border-border hover:border-pink/40 bg-surface-2'
                  }`}
                >
                  <Truck className={`w-5 h-5 shrink-0 ${deliveryType === 'home_delivery' ? 'text-pink' : 'text-text-muted'}`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-text">Doorstep Delivery</span>
                      <span className="text-[10px] text-text-muted font-medium">
                        {subtotal >= FREE_DELIVERY_THRESHOLD ? 'FREE' : formatPrice(STANDARD_DELIVERY_FEE)}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Carefully packaged and delivered directly to your doorstep.
                    </p>
                  </div>
                </button>
              </div>

              {/* Pickup Time Slot if store pickup */}
              {deliveryType === 'store_pickup' && (
                <div className="mt-3 p-3 bg-surface-2 rounded-xl border border-border">
                  <label className="block text-[11px] font-bold text-text-muted mb-1">
                    Preferred Collection Window:
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-pink"
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
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                2. Customer & Contact Details
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sundaram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-pink"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1">Mobile Number (for Order & Pickup SMS) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-pink"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-text-muted mb-1">Email (for Digital Invoice) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ananya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-pink"
                  />
                </div>

                {deliveryType === 'home_delivery' && (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-text-muted mb-1">Delivery Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Flat/House No., Building, Street, Landmark, City & PIN code..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-pink"
                    />
                  </div>
                )}
              </div>

              {/* Optional Order Note */}
              <div className="mt-3">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted mb-1">
                  <span>Order Note / Special Instructions (Optional):</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special instructions or delivery preferences"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-pink"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                3. Payment Method
              </label>
              <div className={`grid grid-cols-1 ${isUpiConfigured ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                {deliveryType === 'home_delivery' ? (
                  <button
                    type="button"
                    id="pay-cod-btn"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-pink bg-pink/15 ring-1 ring-pink text-text shadow-xs'
                        : 'border-border bg-surface-2 text-text hover:border-pink/40'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mb-2 text-pink" />
                    <div>
                      <span className="text-xs font-bold block text-text">Cash on Delivery</span>
                      <span className="text-[10px] text-text-muted">Pay cash upon home delivery</span>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="pay-store-btn"
                    onClick={() => setPaymentMethod('pay_at_store')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'pay_at_store'
                        ? 'border-pink bg-pink/15 ring-1 ring-pink text-text shadow-xs'
                        : 'border-border bg-surface-2 text-text hover:border-pink/40'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mb-2 text-pink" />
                    <div>
                      <span className="text-xs font-bold block text-text">Pay at Store</span>
                      <span className="text-[10px] text-text-muted">Cash or UPI upon pickup</span>
                    </div>
                  </button>
                )}

                {isUpiConfigured && (
                  <button
                    type="button"
                    id="pay-upi-btn"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'upi'
                        ? 'border-pink bg-pink/15 ring-1 ring-pink text-text shadow-xs'
                        : 'border-border bg-surface-2 text-text hover:border-pink/40'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mb-2 text-pink" />
                    <div>
                      <span className="text-xs font-bold block text-text">Instant UPI</span>
                      <span className="text-[10px] text-text-muted">GPay, PhonePe, Paytm, QR</span>
                    </div>
                  </button>
                )}
              </div>

              {/* UPI payment box when selected */}
              {paymentMethod === 'upi' && isUpiConfigured && (
                <div className="mt-3 p-4 bg-surface-2 rounded-xl border border-border space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      Boutique UPI ID:
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-xs font-mono font-bold text-text select-all">
                        {STORE_CENTRE_INFO.upiId}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-3.5 py-2 btn-secondary-pink rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <a
                      href={upiDeepLink}
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 btn-primary-glossy font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Pay with UPI app ({formatPrice(totalAmount)})</span>
                    </a>
                    <p className="text-[10px] text-text-muted mt-1">
                      Tap to open your installed UPI app (GPay, PhonePe, Paytm, BHIM)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      Transaction Reference / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter 12-digit UPI reference / UTR number"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-pink font-mono"
                    />
                    <p className="text-[10px] text-text-muted mt-1">
                      Required for verification by boutique staff before order dispatch/collection.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Total Overview */}
            <div className="bg-surface-2 rounded-xl p-4 border border-border mb-6 space-y-1.5 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Items Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} garments):</span>
                <span className="font-semibold text-text font-mono">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Savings ({appliedCoupon}):</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-muted">
                <span>Fulfilment ({deliveryType === 'store_pickup' ? 'Boutique Pickup' : 'Express Delivery'}):</span>
                <span className="font-mono text-text">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>GST (5%):</span>
                <span className="font-mono text-text">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-text pt-2 border-t border-border">
                <span>Total Amount:</span>
                <span className="font-mono text-pink">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-border hover:bg-surface-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                Back to Bag
              </button>
              <button
                id="place-clothing-order-btn"
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 btn-primary-glossy disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Placing Order...</span>
                ) : !user ? (
                  <span>Sign In & Place Order ({formatPrice(totalAmount)})</span>
                ) : (
                  <span>Confirm & Place Order ({formatPrice(totalAmount)})</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Integrated Customer Authentication Modal */}
        <CustomerAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      </div>
    </div>
  );
};
