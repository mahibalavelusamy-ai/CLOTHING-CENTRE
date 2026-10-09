import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, AlertCircle, Sparkles } from 'lucide-react';
import { ClothingItem, Size } from '../types';
import { formatPrice } from '../lib/format';

interface ProductCardProps {
  item: ClothingItem;
  isWishlisted: boolean;
  onToggleWishlist: (item: ClothingItem) => void;
  onQuickView: (item: ClothingItem) => void;
  onAddToCart: (item: ClothingItem, size: Size, colorIndex: number) => void;
  onOpenSizeGuide: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const isFreeSize = item.sizes.length === 1 && item.sizes[0].size === 'Free Size';

  const [selectedSize, setSelectedSize] = useState<Size>(() => {
    if (isFreeSize) return 'Free Size';
    const available = item.sizes.find(s => s.stock > 0);
    return available ? available.size : item.sizes[0].size;
  });
  const [isHovered, setIsHovered] = useState(false);

  const activeImage = item.images[isHovered && item.images.length > 1 ? 1 : 0] || item.images[0];
  const currentSizeStock = item.sizes.find(s => s.size === selectedSize)?.stock ?? 0;
  const isOutOfStock = item.inStockTotal === 0;

  return (
    <div
      id={`product-card-${item.id}`}
      className="group product-card-glow rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual media container */}
      <div className="relative aspect-[3/4] bg-surface-2 overflow-hidden">
        {activeImage ? (
          <img
            src={activeImage}
            alt={item.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-surface-2 flex flex-col items-center justify-center p-6 text-center select-none border-b border-border">
            <div className="w-11 h-11 rounded-full bg-pink/15 border border-pink/30 text-pink flex items-center justify-center mb-3 shadow-2xs">
              <Sparkles className="w-4 h-4 text-pink" />
            </div>
            <span className="font-serif-display text-sm sm:text-base font-bold text-text leading-snug line-clamp-3">
              {item.name}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-pink mt-2 bg-pink/10 px-2 py-0.5 rounded-full border border-pink/20">
              {item.category}
            </span>
          </div>
        )}

        {/* Badges (rendered only if tags or discount exist) */}
        {(item.tags.length > 0 || item.discountPercent) && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none items-start">
            {item.tags.map((tag) => {
              let badgeStyle = 'bg-surface-2 text-text border-border';
              if (tag === 'Bestseller') {
                badgeStyle = 'bg-pink text-white border-pink font-bold shadow-xs';
              } else if (tag === 'Sale') {
                badgeStyle = 'bg-rose-600 text-white border-rose-500 font-bold';
              } else if (tag === 'New Arrival') {
                badgeStyle = 'bg-pink/20 text-pink-tint border-pink/40 font-bold';
              } else if (tag === 'Festive Special') {
                badgeStyle = 'bg-purple-900/80 text-purple-200 border-purple-700 font-bold';
              } else if (tag === 'Handloom') {
                badgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-700 font-bold';
              }
              return (
                <span
                  key={tag}
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border shadow-xs ${badgeStyle}`}
                >
                  {tag}
                </span>
              );
            })}
            {item.discountPercent && (
              <span className="bg-rose-600 text-white border border-rose-500 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                {item.discountPercent}% OFF
              </span>
            )}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          id={`wishlist-btn-${item.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(item);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-2/90 hover:bg-surface text-text-muted hover:text-pink border border-border shadow-sm flex items-center justify-center transition-all cursor-pointer z-10"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-pink text-pink' : ''
            }`}
          />
        </button>

        {/* Stock Alert Badge if low (status color amber kept) */}
        {item.inStockTotal > 0 && item.inStockTotal <= 6 && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-950/90 text-amber-300 border border-amber-800/80 text-[10px] font-medium px-2 py-1 rounded backdrop-blur-xs flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Only {item.inStockTotal} left</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-surface-2 border border-border text-text-muted text-xs font-bold tracking-wider px-3 py-1.5 rounded uppercase">
              Temporarily Sold Out
            </span>
          </div>
        )}

        {/* Quick View Floating Overlay on Desktop */}
        <div className="absolute inset-x-2 bottom-2 hidden group-hover:flex items-center justify-center gap-2 z-10 transition-opacity">
          <button
            id={`quick-view-btn-${item.id}`}
            onClick={() => onQuickView(item)}
            className="flex-1 bg-surface/95 hover:bg-pink hover:text-white text-text border border-border text-xs font-semibold py-2 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          {/* Category Eyebrow & SKU */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">
            <span className="truncate">{item.category}</span>
            <span className="font-mono text-[9px] text-pink-tint tracking-normal shrink-0 ml-1">
              {item.sku}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(item)}
            className="text-text font-semibold text-sm leading-snug line-clamp-1 hover:text-pink transition-colors cursor-pointer"
            title={item.name}
          >
            {item.name}
          </h3>

          {/* Occasion & Blouse Piece Chips */}
          {(item.occasion || item.blouseIncluded) && (
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              {item.occasion && (
                <span className="text-[10px] font-medium bg-surface-2 text-text border border-border px-2 py-0.5 rounded">
                  {item.occasion}
                </span>
              )}
              {item.blouseIncluded && (
                <span className="text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Blouse piece included
                </span>
              )}
            </div>
          )}

          {/* Fabric & Fit badge (Fit hidden when fitType is missing) */}
          {(item.fitType || item.fabric) && (
            <p className="text-xs text-text-muted mt-1 line-clamp-1">
              {[item.fitType, item.fabric?.split(',')[0]].filter(Boolean).join(' • ')}
            </p>
          )}

          {/* Price, Savings & Rating */}
          <div className="flex items-center justify-between gap-2 mt-2.5">
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 min-w-0">
              <span className="text-base font-bold text-text font-mono">
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-text-muted/60 line-through font-mono">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
              {item.discountPercent && (
                <span className="text-[10px] font-bold text-pink bg-pink/15 border border-pink/30 px-1.5 py-0.5 rounded whitespace-nowrap">
                  Save {item.discountPercent}%
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-text-muted shrink-0">
              <Star className="w-3.5 h-3.5 fill-pink text-pink shrink-0" />
              <span className="font-semibold text-[11px] text-text">{item.rating}</span>
              <span className="text-[10px] text-text-muted">({item.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls (Sizes & Colors) */}
        <div className="mt-3 pt-3 border-t border-border">
          {/* Color swatches */}
          {item.colors.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {item.colors.map((color, idx) => (
                  <button
                    key={color.name}
                    id={`color-swatch-${item.id}-${idx}`}
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                      selectedColorIdx === idx
                        ? 'ring-2 ring-pink ring-offset-1 ring-offset-bg scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={`Color ${color.name}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-text-muted font-medium truncate max-w-[110px]">
                {item.colors[selectedColorIdx]?.name}
              </span>
            </div>
          )}

          {/* Size Selector */}
          {isFreeSize ? (
            /* Free Size items: show 'Free Size' as a single label and auto-select */
            <div className="mb-3 flex items-center justify-between bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Size</span>
              <span className="text-xs font-bold text-text bg-surface px-2 py-0.5 rounded border border-border shadow-2xs">
                Free Size
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mb-3 overflow-x-auto no-scrollbar">
              {item.sizes.map((s) => {
                const isSelected = selectedSize === s.size;
                const hasStock = s.stock > 0;
                return (
                  <button
                    key={s.size}
                    id={`size-pill-${item.id}-${s.size}`}
                    disabled={!hasStock}
                    onClick={() => setSelectedSize(s.size)}
                    className={`flex-1 min-w-[28px] py-1 text-[10px] font-semibold rounded border transition-all select-none relative ${
                      !hasStock
                        ? 'opacity-40 bg-surface-2 border-border text-text-muted/50 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-pink border-pink text-white shadow-xs cursor-pointer font-bold'
                        : 'border-border text-text hover:border-pink bg-surface-2 hover:bg-surface cursor-pointer'
                    }`}
                    title={hasStock ? `${s.size} (${s.stock} in stock)` : `${s.size} - Out of stock`}
                    aria-label={hasStock ? `Select size ${s.size}` : `Size ${s.size} is out of stock`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Add to Bag Button */}
          <button
            id={`add-to-cart-btn-${item.id}`}
            disabled={isOutOfStock || currentSizeStock === 0}
            onClick={() => onAddToCart(item, selectedSize, selectedColorIdx)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isOutOfStock || currentSizeStock === 0
                ? 'bg-surface-2 border border-border text-text-muted/50 cursor-not-allowed'
                : 'bg-pink hover:bg-pink-strong text-white shadow-sm'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {isOutOfStock
                ? 'Sold Out'
                : currentSizeStock === 0
                ? `${selectedSize} Out of Stock`
                : isFreeSize
                ? 'Add to Bag'
                : `Add ${selectedSize} to Bag`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
