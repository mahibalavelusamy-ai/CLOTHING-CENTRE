import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck,
  Tag,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import { CartItem, Size } from '../types';
import { COUPONS, STORE_CENTRE_INFO } from '../data/clothingData';
import { formatPrice, FREE_DELIVERY_THRESHOLD } from '../lib/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onUpdateSize?: (index: number, newSize: Size) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  );

  const couponData = appliedCoupon ? COUPONS[appliedCoupon] : null;
  const discountAmount = couponData ? (subtotal * couponData.percent) / 100 : 0;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    setCouponError(null);
    const codeToApply = (directCode || couponInput).trim().toUpperCase();
    if (!codeToApply) return;

    if (!COUPONS[codeToApply]) {
      setCouponError('Invalid coupon code. Try YAAZH10 or FESTIVE25');
      return;
    }

    if (subtotal < COUPONS[codeToApply].minOrder) {
      setCouponError(`Requires minimum order of ${formatPrice(COUPONS[codeToApply].minOrder)}`);
      return;
    }

    const success = onApplyCoupon(codeToApply);
    if (success) {
      setCouponInput('');
      setCouponError(null);
    }
  };

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;
    const cleanPhone = STORE_CENTRE_INFO.phone.replace(/[^0-9]/g, '');
    let msg = `*New Boutique Order Inquiry - Yaazh Boutique*\n\n`;
    cartItems.forEach((c, idx) => {
      msg += `${idx + 1}. *${c.item.name}*\n`;
      msg += `   • Size: ${c.selectedSize} | Color: ${c.selectedColor.name}\n`;
      msg += `   • Qty: ${c.quantity} × ${formatPrice(c.item.price)} = ${formatPrice(c.item.price * c.quantity)}\n\n`;
    });
    msg += `*Estimated Subtotal:* ${formatPrice(subtotal)}\n`;
    if (appliedCoupon && discountAmount > 0) {
      msg += `*Coupon (${appliedCoupon}):* -${formatPrice(discountAmount)}\n`;
    }
    msg += `*Final Amount:* ${formatPrice(finalTotal)}\n\n`;
    msg += `Please confirm availability and dispatch time to my address. Thank you!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-surface shadow-2xl border-l border-border flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text font-serif-display">
                  Your Boutique Bag
                </h2>
                <p className="text-[11px] text-text-muted font-medium">
                  {cartItems.length} {cartItems.length === 1 ? 'garment' : 'garments'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-text-muted hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-surface cursor-pointer"
                  title="Empty Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="px-5 py-3 bg-surface-2 border-b border-border text-xs">
              <div className="flex items-center justify-between mb-1.5 font-medium text-text">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Truck className="w-3.5 h-3.5 text-pink shrink-0" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Free Express Delivery Unlocked!
                    </span>
                  ) : (
                    <span>Add <strong className="text-pink">{formatPrice(remainingForFreeShipping)}</strong> more for Free Shipping</span>
                  )}
                </span>
                <span className="text-[10px] text-text-muted font-mono font-bold">
                  {Math.round(progressToFreeShipping)}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full border border-border overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    remainingForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-pink'
                  }`}
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-border">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-pink mb-3.5 shadow-2xs">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-text mb-1 font-serif-display">
                  Your boutique bag is empty
                </h3>
                <p className="text-xs text-text-muted max-w-xs mb-5 leading-relaxed">
                  Explore our handcrafted Sarees, Blouses & Crop Tops, Co-ords, and Lounge Wear collections.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 btn-primary-glossy rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              cartItems.map((cartItem, idx) => {
                const item = cartItem.item;
                return (
                  <div key={`${item.id}-${cartItem.selectedSize}-${idx}`} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                    {/* Thumbnail */}
                    <div className="w-18 h-22 rounded-xl overflow-hidden bg-surface-2 shrink-0 border border-border flex items-center justify-center p-0.5 text-center shadow-2xs">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-serif-display font-bold text-text leading-tight line-clamp-3 p-1">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-text line-clamp-1 leading-snug">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-text-muted hover:text-rose-400 transition-colors p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-text-muted font-mono mt-0.5">
                          {item.category} • {cartItem.selectedColor.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-pink font-mono">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[10px] bg-surface-2 px-2 py-0.5 rounded text-text font-semibold border border-border">
                            Size: {cartItem.selectedSize}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & line subtotal */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border">
                        <div className="flex items-center border border-border rounded-lg bg-surface-2 overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity - 1)}
                            className="px-2.5 py-1 text-xs text-text hover:bg-surface hover:text-pink cursor-pointer font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 text-xs font-bold font-mono text-text">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity + 1)}
                            className="px-2.5 py-1 text-xs text-text hover:bg-surface hover:text-pink cursor-pointer font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-text font-mono">
                          {formatPrice(item.price * cartItem.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-border bg-surface-2 space-y-3">
              {/* Coupon Chips & Input */}
              <div className="space-y-2">
                {!appliedCoupon && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3 text-pink" /> Offers:
                    </span>
                    {Object.entries(COUPONS).map(([code, info]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyCoupon(undefined, code)}
                        className="text-[10px] font-bold px-2 py-0.5 bg-pink/15 hover:bg-pink/25 border border-pink/30 text-pink rounded-md transition-colors cursor-pointer"
                        title={info.description}
                      >
                        {code} ({info.percent}% OFF)
                      </button>
                    ))}
                  </div>
                )}

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-emerald-300">{appliedCoupon}</span>
                        <span className="text-[11px] text-emerald-400 ml-1">
                          ({couponData?.percent}% Off Applied)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-text-muted hover:text-text text-xs font-bold px-2 py-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-surface border border-border rounded-xl uppercase text-text placeholder:normal-case placeholder:text-text-muted focus:outline-none focus:border-pink"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 btn-secondary-pink rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-400 font-medium">{couponError}</p>
                )}
              </div>

              {/* Subtotal & Discount breakdown */}
              <div className="space-y-1.5 text-xs text-text-muted bg-surface p-3 rounded-xl border border-border">
                <div className="flex justify-between">
                  <span>Bag Subtotal:</span>
                  <span className="font-mono text-text font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon Savings:</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted text-[11px]">
                  <span>Shipping:</span>
                  <span>{remainingForFreeShipping === 0 ? <strong className="text-emerald-400">FREE</strong> : '₹100 (or free above ₹1,999)'}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-text">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-base text-pink">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout CTAs */}
              <div className="space-y-2 pt-1">
                <button
                  id="proceed-to-checkout-btn"
                  onClick={onProceedToCheckout}
                  className="w-full py-3 btn-primary-glossy rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md uppercase tracking-wider transform active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Direct WhatsApp Order Option */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-2.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Order via WhatsApp Direct</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
