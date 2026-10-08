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
      className="group bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual media container */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        {activeImage ? (
          <img
            src={activeImage}
            alt={item.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#f6f3ed] flex flex-col items-center justify-center p-6 text-center select-none border-b border-stone-200/50">
            <div className="w-11 h-11 rounded-full bg-amber-100/80 border border-amber-200/80 text-amber-900 flex items-center justify-center mb-3 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-800" />
            </div>
            <span className="font-serif-display text-sm sm:text-base font-bold text-stone-900 leading-snug line-clamp-3">
              {item.name}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900/80 mt-2 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              {item.category}
            </span>
          </div>
        )}

        {/* Badges (rendered only if tags or discount exist) */}
        {(item.tags.length > 0 || item.discountPercent) && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none items-start">
            {item.tags.map((tag) => {
              let badgeStyle = 'bg-stone-800 text-white border-stone-700';
              if (tag === 'Bestseller') {
                badgeStyle = 'bg-amber-500 text-stone-950 border-amber-400 font-bold';
              } else if (tag === 'Sale') {
                badgeStyle = 'bg-rose-600 text-white border-rose-500 font-bold';
              } else if (tag === 'New Arrival') {
                badgeStyle = 'bg-sky-700 text-white border-sky-600 font-bold';
              } else if (tag === 'Festive Special') {
                badgeStyle = 'bg-purple-800 text-purple-100 border-purple-700 font-bold';
              } else if (tag === 'Handloom') {
                badgeStyle = 'bg-emerald-800 text-emerald-50 border-emerald-700 font-bold';
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
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-rose-600 shadow-sm flex items-center justify-center transition-all cursor-pointer z-10"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-600 text-rose-600' : ''
            }`}
          />
        </button>

        {/* Stock Alert Badge if low */}
        {item.inStockTotal > 0 && item.inStockTotal <= 6 && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-900/90 text-amber-200 text-[10px] font-medium px-2 py-1 rounded backdrop-blur-xs flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Only {item.inStockTotal} left</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-stone-950 text-white text-xs font-bold tracking-wider px-3 py-1.5 rounded uppercase">
              Temporarily Sold Out
            </span>
          </div>
        )}

        {/* Quick View Floating Overlay on Desktop */}
        <div className="absolute inset-x-2 bottom-2 hidden group-hover:flex items-center justify-center gap-2 z-10 transition-opacity">
          <button
            id={`quick-view-btn-${item.id}`}
            onClick={() => onQuickView(item)}
            className="flex-1 bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold py-2 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer hover:border-amber-600"
          >
            <Eye className="w-3.5 h-3.5 text-stone-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          {/* Category Eyebrow & SKU */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-1">
            <span className="truncate">{item.category}</span>
            <span className="font-mono text-[9px] text-stone-400 tracking-normal shrink-0 ml-1">
              {item.sku}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(item)}
            className="text-stone-900 font-semibold text-sm leading-snug line-clamp-1 hover:text-amber-800 transition-colors cursor-pointer"
            title={item.name}
          >
            {item.name}
          </h3>

          {/* Occasion & Blouse Piece Chips */}
          {(item.occasion || item.blouseIncluded) && (
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              {item.occasion && (
                <span className="text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded">
                  {item.occasion}
                </span>
              )}
              {item.blouseIncluded && (
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Blouse piece included
                </span>
              )}
            </div>
          )}

          {/* Fabric & Fit badge (Fit hidden when fitType is missing) */}
          {(item.fitType || item.fabric) && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-1">
              {[item.fitType, item.fabric?.split(',')[0]].filter(Boolean).join(' • ')}
            </p>
          )}

          {/* Price, Savings & Rating */}
          <div className="flex items-center justify-between gap-2 mt-2.5">
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 min-w-0">
              <span className="text-base font-bold text-stone-900 font-mono">
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-stone-400 line-through font-mono">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
              {item.discountPercent && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded whitespace-nowrap">
                  Save {item.discountPercent}%
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-stone-600 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-semibold text-[11px] text-stone-800">{item.rating}</span>
              <span className="text-[10px] text-stone-400">({item.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls (Sizes & Colors) */}
        <div className="mt-3 pt-3 border-t border-stone-100">
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
                        ? 'ring-2 ring-stone-900 ring-offset-1 scale-110'
                        : 'border-stone-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={`Color ${color.name}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-stone-500 font-medium truncate max-w-[110px]">
                {item.colors[selectedColorIdx]?.name}
              </span>
            </div>
          )}

          {/* Size Selector */}
          {isFreeSize ? (
            /* Free Size items: show 'Free Size' as a single label and auto-select */
            <div className="mb-3 flex items-center justify-between bg-stone-50 border border-stone-200/80 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Size</span>
              <span className="text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
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
                        ? 'opacity-40 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xs cursor-pointer font-bold'
                        : 'border-stone-200 text-stone-700 hover:border-stone-400 bg-white hover:bg-stone-50 cursor-pointer'
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
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isOutOfStock || currentSizeStock === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-amber-600 text-white'
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
