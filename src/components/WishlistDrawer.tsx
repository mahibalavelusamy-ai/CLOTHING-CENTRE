import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { ClothingItem, Size } from '../types';
import { formatPrice } from '../lib/format';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: ClothingItem[];
  onRemoveFromWishlist: (item: ClothingItem) => void;
  onAddToCart: (item: ClothingItem, size: Size, colorIndex: number) => void;
  onQuickView: (item: ClothingItem) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
  onQuickView
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 font-serif-display">
                  Saved Garments
                </h2>
                <p className="text-xs text-stone-500">
                  {wishlistItems.length} styles saved
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-3">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mb-1">
                  No garments saved yet
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-4">
                  Tap the heart icon on any garment to save your favorite styles to your wishlist.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-900 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlistItems.map((item) => {
                const firstAvailableSize = item.sizes.find(s => s.stock > 0)?.size || item.sizes[0].size;
                return (
                  <div key={item.id} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                    <div 
                      onClick={() => {
                        onQuickView(item);
                        onClose();
                      }}
                      className="w-18 h-22 rounded-lg overflow-hidden bg-stone-50 shrink-0 border border-stone-200 cursor-pointer flex items-center justify-center p-1 text-center"
                    >
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-serif-display font-bold text-stone-900 leading-tight line-clamp-3">
                          {item.name}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 
                            onClick={() => {
                              onQuickView(item);
                              onClose();
                            }}
                            className="text-xs font-bold text-stone-900 line-clamp-1 hover:text-amber-700 transition-colors cursor-pointer"
                          >
                            {item.name}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(item)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {item.category} • SKU: {item.sku}
                        </p>
                        <p className="text-xs font-bold text-amber-700 mt-1 font-mono">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            onAddToCart(item, firstAvailableSize, 0);
                            onRemoveFromWishlist(item);
                          }}
                          className="flex-1 py-1.5 px-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
