import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
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

  // Use items tagged 'Bestseller'; fall back to highest rating if fewer than 4
  const topSellers = React.useMemo(() => {
    const bestsellers = items.filter((i) => i.tags.includes('Bestseller'));
    if (bestsellers.length >= 4) return bestsellers;

    const remaining = items
      .filter((i) => !i.tags.includes('Bestseller'))
      .sort((a, b) => b.rating - a.rating);

    return [...bestsellers, ...remaining].slice(0, 6);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (topSellers.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-amber-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Weekly Highlights</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            Top Selling This Week
          </h2>
        </div>

        {/* Scroll Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 hover:border-amber-600 text-stone-600 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 hover:border-amber-600 text-stone-600 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Grid */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth snap-x snap-mandatory touch-scroll"
      >
        {topSellers.map((item) => (
          <div
            key={`top-${item.id}`}
            className="w-[200px] sm:w-[260px] shrink-0 snap-start flex flex-col"
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
