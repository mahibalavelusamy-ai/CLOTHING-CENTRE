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
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface shadow-2xl border-l border-border flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-surface-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink text-white flex items-center justify-center shadow-xs">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text font-serif-display">
                  Saved Garments
                </h2>
                <p className="text-xs text-text-muted">
                  {wishlistItems.length} styles saved
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-border">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-muted mb-3">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-text mb-1">
                  No garments saved yet
                </h3>
                <p className="text-xs text-text-muted max-w-xs mb-4">
                  Tap the heart icon on any garment to save your favorite styles to your wishlist.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 btn-primary-glossy rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
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
                      className="w-18 h-22 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border cursor-pointer flex items-center justify-center p-1 text-center"
                    >
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-serif-display font-bold text-text leading-tight line-clamp-3">
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
                            className="text-xs font-bold text-text line-clamp-1 hover:text-pink transition-colors cursor-pointer"
                          >
                            {item.name}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(item)}
                            className="text-text-muted hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-text-muted font-mono mt-0.5">
                          {item.category} • SKU: {item.sku}
                        </p>
                        <p className="text-xs font-bold text-pink mt-1 font-mono">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            onAddToCart(item, firstAvailableSize, 0);
                            onRemoveFromWishlist(item);
                          }}
                          className="flex-1 py-1.5 px-2.5 btn-secondary-pink rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
