import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ClothingItem, Size } from '../types';
import { ProductCard } from './ProductCard';

interface TopSellingStripProps {
  items: ClothingItem[];
  wishlist: ClothingItem[];
  onToggleWishlist: (item: ClothingItem) => void;
  onQuickView: (item: ClothingItem) => void;
  onAddToCart: (item: ClothingItem, size: Size, colorIndex: number) => void;
  onOpenSizeGuide: () => void;
}

export const TopSellingStrip: React.FC<TopSellingStripProps> = ({
  items,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onOpenSizeGuide,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Bestsellers priority
  const topSellers = React.useMemo(() => {
    const bestsellers = items.filter((i) => i.tags.includes('Bestseller'));
    if (bestsellers.length >= 4) return bestsellers;

    const remaining = items
      .filter((i) => !i.tags.includes('Bestseller'))
      .sort((a, b) => b.rating - a.rating);

    return [...bestsellers, ...remaining].slice(0, 8);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (topSellers.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] leading-tight">
            Bestsellers
          </h2>
          <p className="text-sm sm:text-base text-[#6E6E73] mt-1 font-normal">
            The pieces our customers come back for.
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E8ED] hover:border-[#1D1D1F] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E8ED] hover:border-[#1D1D1F] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Grid */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-3 scroll-smooth snap-x snap-mandatory touch-scroll"
      >
        {topSellers.map((item) => (
          <div
            key={`top-${item.id}`}
            className="w-[210px] sm:w-[250px] shrink-0 snap-start flex flex-col"
          >
            <ProductCard
              item={item}
              isWishlisted={wishlist.some((w) => w.id === item.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onOpenSizeGuide={onOpenSizeGuide}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
