import React from 'react';
import { Filter, RotateCcw, Check, Layers } from 'lucide-react';
import { Size, Department } from '../types';

interface FilterSidebarProps {
  currentDepartment?: Department;
  onSelectDepartment?: (dept: Department) => void;
  departmentCounts?: Record<Department, number>;
  categories: string[];
  categoryCounts?: Record<string, number>;
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

const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const DEPARTMENTS: { id: Department; label: string }[] = [
  { id: 'all', label: 'All Collections' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
  { id: 'ethnic', label: 'Ethnic & Festive' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  currentDepartment,
  onSelectDepartment,
  departmentCounts,
  categories,
  categoryCounts,
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
  return (
    <aside id="clothing-filter-sidebar" className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-700" />
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            Filter Garments
          </h2>
          {activeFilterCount > 0 && (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            id="reset-filters-btn"
            onClick={onResetFilters}
            className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Department Selector (if available) */}
      {onSelectDepartment && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Department
            </label>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DEPARTMENTS.map((dept) => {
              const isSelected = currentDepartment === dept.id;
              const count = departmentCounts ? departmentCounts[dept.id] : undefined;
              return (
                <button
                  key={dept.id}
                  id={`filter-dept-${dept.id}`}
                  onClick={() => onSelectDepartment(dept.id)}
                  className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between border ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                  } ${dept.id === 'all' ? 'col-span-2' : ''}`}
                >
                  <span className="truncate">{dept.label}</span>
                  {count !== undefined && (
                    <span className={`text-[10px] ml-1 font-mono ${isSelected ? 'text-amber-300' : 'text-stone-400'}`}>
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
        <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-amber-600 cursor-pointer"
        >
          <option value="featured">Featured Curations</option>
          <option value="newest">New Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Categories with Counts */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
          Garment Category
        </label>
        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts ? categoryCounts[cat] : undefined;
            return (
              <button
                key={cat}
                id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => onSelectCategory(cat)}
                className={`text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span className="truncate">{cat}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {count !== undefined && (
                    <span className={`text-[11px] font-mono ${isSelected ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
                      {count}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Available Sizes
          </label>
          {selectedSizes.length > 0 && (
            <span className="text-[11px] text-stone-400">
              {selectedSizes.length} selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {ALL_SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                id={`filter-size-${size}`}
                onClick={() => onToggleSize(size)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Price Range
          </label>
          <span className="text-xs font-bold text-stone-900 font-mono">
            ${priceRange[0]} – ${priceRange[1]}
          </span>
        </div>
        <input
          id="price-range-slider"
          type="range"
          min={0}
          max={maxPossiblePrice}
          step={5}
          value={priceRange[1]}
          onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-amber-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
          <span>$0</span>
          <span>Max ${maxPossiblePrice}</span>
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-4 border-t border-stone-200">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-stone-800">
            In-Stock at Centre Only
          </span>
          <input
            id="in-stock-only-toggle"
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
          />
        </label>
      </div>
    </aside>
  );
};
