import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck, 
  Store,
  AlertCircle
} from 'lucide-react';
import { CartItem, Size } from '../types';
import { COUPONS } from '../data/clothingData';

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
  const freeShippingThreshold = 100;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

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
      setCouponError(`Requires minimum order of $${COUPONS[cleaned].minOrder}`);
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
                  Your Garment Bag
                </h2>
                <p className="text-xs text-stone-500">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected
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
                    <strong className="text-emerald-800 font-bold">You qualify for Free Express Shipping!</strong>
                  ) : (
                    <span>Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more for Free Shipping</span>
                  )}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {Math.round(progressToFreeShipping)}%
                </span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 mb-1">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-5">
                  Browse our curated collections from the Clothing Centre emporium.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              cartItems.map((cartItem, idx) => {
                const maxStock = cartItem.item.sizes.find(s => s.size === cartItem.selectedSize)?.stock ?? 10;
                return (
                  <div key={`${cartItem.item.id}-${cartItem.selectedSize}-${idx}`} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                    {/* Thumbnail */}
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img
                        src={cartItem.item.images[0]}
                        alt={cartItem.item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                            {cartItem.item.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded font-medium border border-stone-200">
                            Size: {cartItem.selectedSize}
                          </span>
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block"
                              style={{ backgroundColor: cartItem.selectedColor.hex }}
                            />
                            {cartItem.selectedColor.name}
                          </span>
                        </div>
                      </div>

                      {/* Controls and Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-200 rounded-md overflow-hidden bg-white">
                          <button
                            disabled={cartItem.quantity <= 1}
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity - 1)}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-stone-900 min-w-[24px] text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            disabled={cartItem.quantity >= maxStock}
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity + 1)}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-stone-900">
                          ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3.5">
              {/* Coupon input */}
              <div>
                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code <strong>{appliedCoupon}</strong> Applied (-{couponData?.percent}%)</span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-stone-400 hover:text-stone-700 text-xs underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon: CENTRE15 or WELCOME10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 uppercase placeholder-normal"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {couponError}
                  </p>
                )}
              </div>

              {/* Price Calculation rows */}
              <div className="text-xs space-y-1.5 text-stone-600 border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1">
                    <Store className="w-3 h-3 text-amber-700" />
                    <span>In-Store Centre Pickup</span>
                  </span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span>${(subtotal - discountAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-proceed-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
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
