import React from 'react';
import { Home, Grid, Heart, ShoppingBag, Receipt } from 'lucide-react';
import { formatPrice } from '../lib/format';

interface MobileBottomNavProps {
  activeTab: 'home' | 'collections';
  onNavigateHome: () => void;
  onOpenCategories: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateHome,
  onOpenCategories,
  wishlistCount,
  onOpenWishlist,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenOrders,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] px-1 py-1 safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Home */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center min-h-[46px] py-1 transition-all cursor-pointer rounded-xl active:scale-95 ${
            activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Home</span>
          {activeTab === 'home' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Categories / Catalog */}
        <button
          onClick={onOpenCategories}
          className={`flex flex-col items-center justify-center min-h-[46px] py-1 transition-all cursor-pointer rounded-xl active:scale-95 ${
            activeTab === 'collections' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Catalog"
        >
          <Grid className={`w-5 h-5 mb-0.5 transition-transform ${activeTab === 'collections' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Catalog</span>
          {activeTab === 'collections' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="flex flex-col items-center justify-center min-h-[46px] py-1 text-stone-400 hover:text-stone-200 relative transition-all cursor-pointer rounded-xl active:scale-95"
          aria-label="Wishlist"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Wishlist</span>
        </button>

        {/* Orders / Receipts */}
        <button
          onClick={onOpenOrders}
          className="flex flex-col items-center justify-center min-h-[46px] py-1 text-stone-400 hover:text-stone-200 transition-all cursor-pointer rounded-xl active:scale-95"
          aria-label="Orders & Receipts"
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Orders</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center min-h-[46px] py-1 text-amber-400 font-bold relative transition-all cursor-pointer rounded-xl active:scale-95"
          aria-label="Shopping Bag"
        >
          <div className="relative">
            <div className="w-6 h-6 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-stone-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-semibold">
            {cartCount > 0 ? formatPrice(cartTotal) : 'Bag'}
          </span>
        </button>
      </div>
    </nav>
  );
};
