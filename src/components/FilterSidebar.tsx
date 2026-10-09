import React from 'react';
import { Filter, RotateCcw, Check, Layers } from 'lucide-react';
import { Size, Department } from '../types';
import { DEPARTMENT_CONFIG, DEPARTMENTS } from '../data/catalogConfig';
import { formatPrice } from '../lib/format';

interface FilterSidebarProps {
  currentDepartment?: Department;
  onSelectDepartment?: (dept: Department) => void;
  departmentCounts?: Record<Department, number>;
  categories: string[];
  categoryCounts?: Record<string, number>;
  availableSizes?: Size[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
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
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  currentDepartment = 'all',
  onSelectDepartment,
  departmentCounts,
  categories,
  categoryCounts,
  availableSizes,
  selectedCategory,
  onSelectCategory,
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
  activeFilterCount
}) => {
  const visibleDepartments = DEPARTMENTS.filter((dept) => {
    if (!departmentCounts) return true;
    if (dept.id === 'all') return (departmentCounts['all'] ?? 0) > 0;
    return (departmentCounts[dept.id] ?? 0) > 0;
  });

  const visibleCategories = categories.filter((cat) => {
    if (!categoryCounts) return true;
    return (categoryCounts[cat] ?? 0) > 0;
  });

  const isSizeAvailable = (s: Size) => {
    if (!availableSizes) return true;
    return availableSizes.includes(s);
  };

  return (
    <aside id="clothing-filter-sidebar" className="bg-surface rounded-xl border border-border p-5 shadow-xs text-text">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-pink" />
          <h2 className="text-sm font-bold text-text uppercase tracking-wide">
            Filter Boutique
          </h2>
          {activeFilterCount > 0 && (
            <span className="bg-pink/15 text-pink border border-pink/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            id="reset-filters-btn"
            onClick={onResetFilters}
            className="text-xs text-pink hover:text-pink-tint font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Department Selector */}
      {onSelectDepartment && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Layers className="w-3.5 h-3.5 text-text-muted" />
            <label className="block text-xs font-bold text-text uppercase tracking-wider">
              Department
            </label>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {visibleDepartments.map((dept) => {
              const isSelected = currentDepartment === dept.id;
              const count = departmentCounts ? departmentCounts[dept.id] : undefined;
              return (
                <button
                  key={dept.id}
                  id={`filter-dept-${dept.id}`}
                  onClick={() => onSelectDepartment(dept.id)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between border ${
                    isSelected
                      ? 'bg-pink text-white border-pink font-bold shadow-xs'
                      : 'bg-surface-2 border-border text-text hover:border-pink/40 hover:bg-surface'
                  }`}
                >
                  <span className="truncate">{dept.label}</span>
                  {count !== undefined && (
                    <span className={`text-[10px] ml-1 font-mono ${isSelected ? 'text-white' : 'text-text-muted'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort By */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-pink cursor-pointer font-medium"
        >
          <option value="featured">Featured Curations</option>
          <option value="newest">New Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Categories with Counts */}
      {visibleCategories.length > 0 && (
        <div className="mb-5">
          <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2.5">
            Garment Category
          </label>
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts ? categoryCounts[cat] : undefined;
              return (
                <button
                  key={cat}
                  id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => onSelectCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-pink/15 text-pink font-bold border-pink/30'
                      : 'border-transparent text-text-muted hover:bg-surface-2 hover:text-text'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {count !== undefined && (
                      <span className={`text-[11px] font-mono ${isSelected ? 'text-pink font-bold' : 'text-text-muted'}`}>
                        {count}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-pink" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes Section: Driven by selected department */}
      {(() => {
        if (currentDepartment !== 'all') {
          const deptSizes = DEPARTMENT_CONFIG[currentDepartment]?.sizes.filter(isSizeAvailable) || [];
          if (deptSizes.length === 0) return null;
          return (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-text uppercase tracking-wider">
                  Available Sizes
                </label>
                {selectedSizes.length > 0 && (
                  <span className="text-[11px] text-pink">
                    {selectedSizes.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {deptSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      id={`filter-size-${size}`}
                      onClick={() => onToggleSize(size)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-pink text-white border-pink shadow-xs font-bold'
                          : 'bg-surface-2 border-border text-text hover:border-pink/40'
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
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-text uppercase tracking-wider">
                Available Sizes
              </label>
              {selectedSizes.length > 0 && (
                <span className="text-[11px] text-pink">
                  {selectedSizes.length} selected
                </span>
              )}
            </div>
            <div className="space-y-3">
              {Object.entries(DEPARTMENT_CONFIG).map(([deptKey, deptMeta]) => {
                const deptSizes = deptMeta.sizes.filter(isSizeAvailable);
                if (deptSizes.length === 0) return null;
                return (
                  <div key={deptKey}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                      {deptMeta.label}
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {deptSizes.map((size) => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <button
                            key={`${deptKey}-${size}`}
                            id={`filter-size-${size}`}
                            onClick={() => onToggleSize(size)}
                            className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-pink text-white border-pink shadow-xs font-bold'
                                : 'bg-surface-2 border-border text-text hover:border-pink/40'
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
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-text uppercase tracking-wider">
            Price Range
          </label>
          <span className="text-xs font-bold text-pink font-mono">
            {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
          </span>
        </div>
        <input
          id="price-range-slider"
          type="range"
          min={0}
          max={maxPossiblePrice}
          step={100}
          value={priceRange[1]}
          onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-pink cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-text-muted mt-1 font-mono">
          <span>{formatPrice(0)}</span>
          <span>Max {formatPrice(maxPossiblePrice)}</span>
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-4 border-t border-border">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-text">
            In-Stock at Boutique Only
          </span>
          <input
            id="in-stock-only-toggle"
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="w-4 h-4 rounded text-pink focus:ring-pink accent-pink cursor-pointer"
          />
        </label>
      </div>
    </aside>
  );
};
