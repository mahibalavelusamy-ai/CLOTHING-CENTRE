import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
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
      setCouponError('Invalid coupon code. Try YAAZH10, MUHURTHAM20, DEEPAVALI25 or NAMASTE10');
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
    let msg = `*வணக்கம் Yaazh Boutique, Oddanchatram - New Order Inquiry*\n\n`;
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
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-[440px] max-w-full bg-white shadow-2xl border-l border-[#E8E8ED] flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8E8ED] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F3E8EB] text-[#6D1A33] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
                  Your Boutique Bag
                </h2>
                <p className="text-[13px] text-[#6E6E73]">
                  {cartItems.length} {cartItems.length === 1 ? 'piece' : 'pieces'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-[#6E6E73] hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-[#F5F5F7] cursor-pointer"
                  title="Empty Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F5F5F7] hover:bg-[#EFEFF2] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="px-6 py-3.5 bg-[#F5F5F7] border-b border-[#E8E8ED] text-xs">
              <div className="flex items-center justify-between mb-1.5 text-[#424245]">
                <span className="font-medium">
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-[#2E7D4F] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      You get free home delivery!
                    </span>
                  ) : (
                    <span>Add <strong className="text-[#6D1A33] font-semibold">{formatPrice(remainingForFreeShipping)}</strong> more for free home delivery.</span>
                  )}
                </span>
                <span className="text-[11px] text-[#6E6E73] font-mono font-bold">
                  {Math.round(progressToFreeShipping)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#E8E8ED] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    remainingForFreeShipping === 0 ? 'bg-[#2E7D4F]' : 'bg-[#6D1A33]'
                  }`}
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-[#E8E8ED]">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6E6E73]">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] text-[#6D1A33] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">
                  Your bag is empty.
                </h3>
                <p className="text-sm text-[#6E6E73] max-w-xs mb-6 leading-relaxed">
                  Explore our handcrafted Sarees, Blouses, Crop Tops, and Co-ords collections.
                </p>
                <button
                  onClick={onClose}
                  className="btn-maroon"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((cartItem, idx) => {
                const item = cartItem.item;
                return (
                  <div key={`${item.id}-${cartItem.selectedSize}-${idx}`} className="py-4.5 flex gap-4 first:pt-0 last:pb-0">
                    {/* Thumbnail Tile */}
                    <div className="w-20 h-24 rounded-[14px] bg-[#F5F5F7] shrink-0 border border-[#E8E8ED] flex items-center justify-center p-1 overflow-hidden">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-[10px]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-[#1D1D1F] p-1 text-center">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-[14px] font-medium text-[#1D1D1F] line-clamp-1 leading-snug">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-[#6E6E73] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[12px] text-[#6E6E73] mt-0.5">
                          {item.category} • {cartItem.selectedColor.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[14px] font-semibold text-[#1D1D1F]">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[11px] bg-[#F5F5F7] px-2 py-0.5 rounded-full text-[#424245] font-medium">
                            Size: {cartItem.selectedSize}
                          </span>
                        </div>
                      </div>

                      {/* Stepper & Line Subtotal */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E8E8ED]">
                        <div className="flex items-center border border-[#D2D2D7] rounded-full bg-white overflow-hidden h-[34px]">
                          <button
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity - 1)}
                            className="px-2.5 text-xs text-[#1D1D1F] hover:bg-[#F5F5F7] cursor-pointer font-bold h-full flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="px-2 text-xs font-semibold text-[#1D1D1F]">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, cartItem.quantity + 1)}
                            className="px-2.5 text-xs text-[#1D1D1F] hover:bg-[#F5F5F7] cursor-pointer font-bold h-full flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-[14px] font-semibold text-[#1D1D1F]">
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
            <div className="p-5 sm:p-6 border-t border-[#E8E8ED] bg-[#F5F5F7] space-y-3.5 safe-area-bottom">
              
              {/* Coupon Offers & Input */}
              <div className="space-y-2">
                {!appliedCoupon && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-[#6E6E73] flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#6D1A33]" /> Offers:
                    </span>
                    {Object.entries(COUPONS).map(([code, info]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyCoupon(undefined, code)}
                        className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-[#EFEFF2] border border-dashed border-[#B9B9BF] text-[#6D1A33] rounded-full transition-colors cursor-pointer"
                        title={info.description}
                      >
                        {code} ({info.percent}% OFF)
                      </button>
                    ))}
                  </div>
                )}

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#F3E8EB] border border-[#6D1A33]/20 rounded-xl p-2.5 text-xs text-[#6D1A33]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#6D1A33]" />
                      <div>
                        <span className="font-bold">{appliedCoupon}</span>
                        <span className="text-[11px] text-[#561428] ml-1">
                          ({couponData?.percent}% Off Applied)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-[#6D1A33] hover:text-[#561428] text-xs font-semibold px-2 py-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#D2D2D7] rounded-xl uppercase text-[#1D1D1F] placeholder:normal-case placeholder:text-[#6E6E73] focus:outline-none focus:border-[#6D1A33]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 btn-outline-dark text-xs min-h-[38px] font-semibold"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                )}
              </div>

              {/* Subtotal & Breakdown */}
              <div className="space-y-1.5 text-xs text-[#6E6E73] bg-white p-3.5 rounded-2xl border border-[#E8E8ED]">
                <div className="flex justify-between">
                  <span>Bag Subtotal:</span>
                  <span className="text-[#1D1D1F] font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#6D1A33] font-semibold">
                    <span>Coupon Savings:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6E6E73] text-[11px]">
                  <span>Delivery:</span>
                  <span>{remainingForFreeShipping === 0 ? <strong className="text-[#2E7D4F]">FREE</strong> : '₹99 (free above ₹1,999)'}</span>
                </div>
                <div className="border-t border-[#E8E8ED] pt-2 flex justify-between font-bold text-sm text-[#1D1D1F]">
                  <span>Estimated Total:</span>
                  <span className="text-base text-[#6D1A33] font-bold">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-1">
                <button
                  id="proceed-to-checkout-btn"
                  onClick={onProceedToCheckout}
                  className="w-full btn-maroon font-semibold text-sm sm:text-base min-h-[50px] shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full btn-outline-dark text-[#2E7D4F] border-[#D2D2D7] hover:border-[#2E7D4F] text-xs min-h-[42px]"
                >
                  <MessageCircle className="w-4 h-4" />
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
