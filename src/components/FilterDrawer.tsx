import React from 'react';
import { X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Size, Department } from '../types';
import { DEPARTMENT_CONFIG } from '../data/catalogConfig';
import { formatPrice } from '../lib/format';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDepartment?: Department;
  availableSizes?: Size[];
  selectedSizes: Size[];
  onToggleSize: (size: Size) => void;
  priceRange: [number, number];
  onPriceChange: (val: [number, number]) => void;
  maxPossiblePrice: number;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  onSortChange: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest') => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  resultsCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  currentDepartment = 'all',
  availableSizes,
  selectedSizes,
  onToggleSize,
  priceRange,
  onPriceChange,
  maxPossiblePrice,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  onResetFilters,
  activeFilterCount,
  resultsCount,
}) => {
  if (!isOpen) return null;

  const isSizeAvailable = (s: Size) => {
    if (!availableSizes) return true;
    return availableSizes.includes(s);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-pink" />
            <h2 className="text-base font-bold text-text uppercase tracking-wide">
              Filter & Sort
            </h2>
            {activeFilterCount > 0 && (
              <span className="bg-pink/20 text-pink border border-pink/30 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={onResetFilters}
                className="text-xs text-pink hover:text-pink-tint font-semibold flex items-center gap-1 cursor-pointer px-2 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          
          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-pink cursor-pointer"
            >
              <option value="featured">Featured Curations</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rated</option>
            </select>
          </div>

          {/* Sizes Section: Driven by selected department */}
          {(() => {
            if (currentDepartment !== 'all') {
              const deptSizes = DEPARTMENT_CONFIG[currentDepartment]?.sizes.filter(isSizeAvailable) || [];
              if (deptSizes.length === 0) return null;
              return (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Available Sizes
                    </label>
                    {selectedSizes.length > 0 && (
                      <span className="text-[11px] text-pink font-medium">
                        {selectedSizes.length} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {deptSizes.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => onToggleSize(size)}
                          className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-pink text-white font-bold border-pink shadow-xs'
                              : 'bg-surface-2 border-border text-text hover:border-pink/50'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // currentDepartment === 'all'
            const hasAnySizes = (availableSizes?.length ?? 0) > 0;
            if (!hasAnySizes) return null;

            return (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Available Sizes
                  </label>
                  {selectedSizes.length > 0 && (
                    <span className="text-[11px] text-pink font-medium">
                      {selectedSizes.length} selected
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  {Object.entries(DEPARTMENT_CONFIG).map(([deptKey, deptMeta]) => {
                    const deptSizes = deptMeta.sizes.filter(isSizeAvailable);
                    if (deptSizes.length === 0) return null;
                    return (
                      <div key={deptKey}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                          {deptMeta.label}
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {deptSizes.map((size) => {
                            const isSelected = selectedSizes.includes(size);
                            return (
                              <button
                                key={`${deptKey}-${size}`}
                                onClick={() => onToggleSize(size)}
                                className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-pink text-white font-bold border-pink shadow-xs'
                                    : 'bg-surface-2 border-border text-text hover:border-pink/50'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Price Range
              </label>
              <span className="text-xs font-bold text-text font-mono">
                {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPossiblePrice}
              step={100}
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-pink cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-1 font-mono">
              <span>{formatPrice(0)}</span>
              <span>Max {formatPrice(maxPossiblePrice)}</span>
            </div>
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-4 border-t border-border">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-surface-2 rounded-xl border border-border hover:border-pink/30 transition-colors">
              <div>
                <span className="block text-xs font-bold text-text">
                  In-Stock at Boutique Only
                </span>
                <span className="block text-[11px] text-text-muted mt-0.5">
                  Hide pieces temporarily out of stock
                </span>
              </div>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={onToggleInStock}
                className="w-4 h-4 rounded text-pink focus:ring-pink accent-pink cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-surface flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="px-4 py-3 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 btn-primary-glossy rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center uppercase tracking-wider"
          >
            Show {resultsCount} {resultsCount === 1 ? 'Garment' : 'Garments'}
          </button>
        </div>

      </div>
    </div>
  );
};
