import React, { useState } from 'react';
import { Heart, Star, Sparkles } from 'lucide-react';
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
}) => {
  const [selectedColorIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeImage = item.images[isHovered && item.images.length > 1 ? 1 : 0] || item.images[0];
  const isOutOfStock = item.inStockTotal === 0;

  // Primary badge tag
  const primaryTag = item.tags.includes('Bestseller') 
    ? 'Bestseller' 
    : (item.tags.includes('New Arrival') 
        ? 'New' 
        : (item.tags.includes('Festive Special') 
            ? 'Festive' 
            : (item.tags.includes('Handloom') ? 'Handloom' : null)));

  return (
    <div
      id={`product-card-${item.id}`}
      className="card relative flex flex-col justify-between text-left group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={() => onQuickView(item)}
        className="w-full block bg-transparent border-0 p-0 text-left cursor-pointer"
        aria-label={item.name}
      >
        {/* Rounded Apple-style Neutral Tile (aspect 4/5) */}
        <div className="tile bg-[#F5F5F7] rounded-[20px] aspect-[4/5] flex items-center justify-center relative transition-colors duration-200 group-hover:bg-[#EFEFF2] overflow-hidden">
          {activeImage ? (
            <img
              src={activeImage}
              alt={item.name}
              className="w-full h-full object-cover rounded-[20px] transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            /* Fallback luxury draped textile visual */
            <div 
              style={{
                width: '54%',
                height: '74%',
                backgroundColor: item.colors[selectedColorIdx]?.hex || '#6D1A33',
                borderRadius: '16px 16px 8px 8px',
                borderBottom: '14px solid #C9A45C'
              }}
              className="shadow-sm"
            />
          )}

          {/* Primary Tag Pill */}
          {primaryTag && (
            <span className="absolute left-3.5 top-3.5 bg-white/95 text-[#1D1D1F] text-[12px] font-medium px-2.5 py-1 rounded-full shadow-xs">
              {primaryTag}
            </span>
          )}

          {/* Subtle Label */}
          <span className="absolute left-3.5 bottom-3 text-[11px] text-[#6E6E73] pointer-events-none">
            Product photo
          </span>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-[#1D1D1F] text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Meta */}
        <div className="text-[13px] text-[#6E6E73] mt-3.5 truncate font-normal">
          {item.category}
        </div>
        <div className="text-[15px] font-medium text-[#1D1D1F] line-clamp-1 leading-snug mt-0.5 group-hover:text-[#6D1A33] transition-colors">
          {item.name}
        </div>

        {/* Pricing Row */}
        <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
          <span className="text-[16px] font-semibold text-[#1D1D1F]">
            {formatPrice(item.price)}
          </span>
          {item.originalPrice && (
            <span className="text-[14px] text-[#6E6E73] line-through">
              {formatPrice(item.originalPrice)}
            </span>
          )}
          {item.discountPercent && (
            <span className="text-[14px] text-[#6D1A33] font-medium">
              {item.discountPercent}% off
            </span>
          )}
        </div>

        {/* Color Dots & Star Rating */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {item.colors.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full block border border-black/10 shadow-2xs"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          <span className="text-[13px] text-[#6E6E73] ml-1 flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{item.rating.toFixed(1)}</span>
            <span>({item.reviewCount})</span>
          </span>
        </div>
      </button>

      {/* Floating Wishlist Heart Button */}
      <button
        id={`wishlist-btn-${item.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(item);
        }}
        className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1D1D1F] flex items-center justify-center shadow-xs transition-colors cursor-pointer border border-[#E8E8ED]"
        title={isWishlisted ? 'Remove from saved' : 'Save piece'}
        aria-label={isWishlisted ? 'Remove from saved' : 'Save piece'}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? 'fill-[#6D1A33] text-[#6D1A33]' : 'text-[#1D1D1F]'
          }`}
        />
      </button>
    </div>
  );
};
