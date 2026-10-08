import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck
} from 'lucide-react';
import { CartItem, Size } from '../types';
import { COUPONS } from '../data/clothingData';
import { formatPrice, FREE_DELIVERY_THRESHOLD } from '../lib/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onUpdateSize: (index: number, newSize: Size) => void;
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
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  );

  const couponData = appliedCoupon ? COUPONS[appliedCoupon] : null;
  const discountAmount = couponData ? (subtotal * couponData.percent) / 100 : 0;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) return;

    if (!COUPONS[cleaned]) {
      setCouponError('Invalid coupon code. Try "CENTRE15" or "WELCOME10"');
      return;
    }

    if (subtotal < COUPONS[cleaned].minOrder) {
      setCouponError(`Requires minimum order of ${formatPrice(COUPONS[cleaned].minOrder)}`);
      return;
    }

    const success = onApplyCoupon(cleaned);
    if (success) {
      setCouponInput('');
      setCouponError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 font-serif-display">
                  Your Boutique Bag
                </h2>
                <p className="text-xs text-stone-500">
                  {cartItems.length} {cartItems.length === 1 ? 'garment' : 'garments'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-stone-400 hover:text-rose-600 transition-colors p-1"
                  title="Empty Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/60 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-medium text-stone-800">
                <span className="flex items-center gap-1 text-amber-900">
                  <Truck className="w-3.5 h-3.5" />
                  {remainingForFreeShipping === 0 ? (
                    <strong className="text-emerald-800 font-bold">You qualify for Complimentary Delivery!</strong>
                  ) : (
                    <span>Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more for Free Delivery</span>
                  )}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {Math.round(progressToFreeShipping)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-300 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800 mb-1">
                  Your boutique shopping bag is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-4">
                  Browse our Sarees, Kurtis & Chudidars, and Kidswear collections to add items.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
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
                    <div className="w-18 h-22 rounded-lg overflow-hidden bg-[#f6f3ed] shrink-0 border border-stone-200 flex items-center justify-center p-1 text-center">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-serif-display font-bold text-stone-800 leading-tight line-clamp-3">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {item.category} • {cartItem.selectedColor.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-stone-900 font-mono">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-semibold border border-stone-200/80">
                            Size: {cartItem.selectedSize}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & line subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center border border-stone-200 rounded-md">
                          <button
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold font-mono text-stone-800">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-stone-900 font-mono">
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
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              {/* Coupon input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
                    <div>
                      <span className="font-bold text-amber-900">{appliedCoupon}</span>
                      <span className="text-[10px] text-amber-700 ml-1">
                        ({couponData?.percent}% Off Applied)
                      </span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-stone-400 hover:text-stone-600 text-xs font-bold p-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon (e.g. CENTRE15, FESTIVE25)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg uppercase placeholder:normal-case focus:outline-none focus:border-amber-600"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-semibold hover:bg-stone-700 cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponError}</p>
                )}
              </div>

              {/* Subtotal & Discount rows */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal:</span>
                  <span className="font-mono text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Savings:</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Delivery & GST:</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-sm text-stone-900">
                  <span>Estimated Total:</span>
                  <span className="font-mono">{formatPrice(Math.max(0, subtotal - discountAmount))}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                id="proceed-to-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
