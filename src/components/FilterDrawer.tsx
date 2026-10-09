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
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white border-l border-stone-200 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-800" />
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wide">
              Filter & Sort
            </h2>
            {activeFilterCount > 0 && (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={onResetFilters}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer px-2 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
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
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-amber-600 cursor-pointer font-medium"
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
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Available Sizes
                    </label>
                    {selectedSizes.length > 0 && (
                      <span className="text-[11px] text-amber-800 font-medium">
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
                              ? 'bg-stone-900 text-white font-bold border-stone-900 shadow-xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
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
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Available Sizes
                  </label>
                  {selectedSizes.length > 0 && (
                    <span className="text-[11px] text-amber-800 font-medium">
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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
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
                                    ? 'bg-stone-900 text-white font-bold border-stone-900 shadow-xs'
                                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
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
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Price Range
              </label>
              <span className="text-xs font-bold text-amber-800 font-mono">
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
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-500 mt-1 font-mono">
              <span>{formatPrice(0)}</span>
              <span>Max {formatPrice(maxPossiblePrice)}</span>
            </div>
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-4 border-t border-stone-200">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-stone-50 rounded-xl border border-stone-200 hover:bg-stone-100/70 transition-colors">
              <div>
                <span className="block text-xs font-bold text-stone-900">
                  In-Stock at Boutique Only
                </span>
                <span className="block text-[11px] text-stone-500 mt-0.5">
                  Hide pieces temporarily out of stock
                </span>
              </div>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={onToggleInStock}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm text-center uppercase tracking-wider"
          >
            Show {resultsCount} {resultsCount === 1 ? 'Garment' : 'Garments'}
          </button>
        </div>

      </div>
    </div>
  );
};
