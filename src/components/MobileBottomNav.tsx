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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-2 py-1.5 safe-area-bottom">
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Home */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-pink font-bold' : 'text-text-muted hover:text-text'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Categories */}
        <button
          onClick={onOpenCategories}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'collections' ? 'text-pink font-bold' : 'text-text-muted hover:text-text'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Catalog</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="flex flex-col items-center justify-center py-1 text-text-muted hover:text-text relative transition-colors cursor-pointer"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-pink text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Wishlist</span>
        </button>

        {/* Orders / Receipts */}
        <button
          onClick={onOpenOrders}
          className="flex flex-col items-center justify-center py-1 text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Orders</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 text-pink font-bold relative transition-colors cursor-pointer"
        >
          <div className="relative">
            <div className="w-6 h-6 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-pink" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-pink text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">
            {cartCount > 0 ? formatPrice(cartTotal) : 'Bag'}
          </span>
        </button>
      </div>
    </nav>
  );
};
