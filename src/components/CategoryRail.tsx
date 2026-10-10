import React from 'react';
import { Department } from '../types';

interface CategoryRailProps {
  currentDepartment: Department;
  currentCategory: string;
  categories: string[];
  categoryCounts: Record<string, number>;
  onSelectCategory: (category: string) => void;
  onSelectDepartment: (dept: Department) => void;
}

export const CategoryRail: React.FC<CategoryRailProps> = ({
  currentCategory,
  categories,
  categoryCounts,
  onSelectCategory,
}) => {
  // Hide any category that currently has zero products
  const visibleCategories = categories.filter((cat) => {
    const count = categoryCounts[cat] ?? 0;
    return count > 0;
  });

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile/Tablet Horizontal Subcategories Bar (< md) */}
      <div className="md:hidden w-full overflow-x-auto no-scrollbar touch-scroll pb-2 mb-2">
        <div className="flex items-center gap-2">
          {visibleCategories.map((cat) => {
            const isSelected = currentCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={`mob-sub-${cat}`}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs font-bold'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-amber-600 hover:text-stone-900'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-amber-400' : 'text-stone-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Subcategories Rail (md and above) */}
      <nav 
        aria-label="Subcategories"
        className="hidden md:block sticky top-28 w-44 shrink-0 bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-2 self-start max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar"
      >
        <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-2 py-1 text-center">
          Subcategories
        </div>

        <div className="flex flex-col gap-1.5">
          {visibleCategories.map((cat) => {
            const isSelected = currentCategory === cat;
            const count = categoryCounts[cat] ?? 0;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`group flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-amber-50 border border-amber-300 text-amber-950 shadow-2xs font-bold'
                    : 'hover:bg-stone-50 border border-transparent text-stone-700 hover:text-stone-900'
                }`}
              >
                {/* Neutral tinted monogram badge */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-serif-display font-bold transition-colors ${
                  isSelected
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-100 text-stone-700 border border-stone-200 group-hover:border-amber-300/60'
                }`}>
                  {cat === 'All' ? '✦' : cat.slice(0, 2).toUpperCase()}
                </div>

                {/* Label & Count */}
                <div className="min-w-0 flex-1">
                  <span className="block text-xs leading-tight truncate">
                    {cat}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-mono mt-0.5 ${
                      isSelected ? 'text-amber-800 font-semibold' : 'text-stone-400'
                    }`}
                  >
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
