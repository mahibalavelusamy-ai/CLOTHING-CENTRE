import React from 'react';
import { Home, Grid, Heart, ShoppingBag, Receipt } from 'lucide-react';

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
  onOpenCart,
  onOpenOrders,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E8E8ED] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Home */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer rounded-xl ${
            activeTab === 'home' ? 'text-[#6D1A33] font-semibold' : 'text-[#424245] hover:text-[#1D1D1F]'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Home</span>
          {activeTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D1A33] mt-0.5" />
          )}
        </button>

        {/* Shop / Catalog */}
        <button
          onClick={onOpenCategories}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer rounded-xl ${
            activeTab === 'collections' ? 'text-[#6D1A33] font-semibold' : 'text-[#424245] hover:text-[#1D1D1F]'
          }`}
          aria-label="Shop"
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Shop</span>
          {activeTab === 'collections' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D1A33] mt-0.5" />
          )}
        </button>

        {/* Saved / Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-[#424245] hover:text-[#1D1D1F] relative transition-all cursor-pointer rounded-xl"
          aria-label="Saved"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#1D1D1F] text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Saved</span>
        </button>

        {/* Orders */}
        <button
          onClick={onOpenOrders}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-[#424245] hover:text-[#1D1D1F] transition-all cursor-pointer rounded-xl"
          aria-label="Orders"
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Orders</span>
        </button>

        {/* Bag */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-[#6D1A33] font-semibold relative transition-all cursor-pointer rounded-xl"
          aria-label="Bag"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#6D1A33]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#6D1A33] text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Bag</span>
        </button>
      </div>
    </nav>
  );
};
