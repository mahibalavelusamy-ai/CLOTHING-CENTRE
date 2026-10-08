import React from 'react';
import { Department } from '../types';

interface CategoryRailItem {
  id: string;
  label: string;
  category: string;
  image?: string;
  count: number;
}

interface CategoryRailProps {
  currentDepartment: Department;
  currentCategory: string;
  categories: string[];
  categoryCounts: Record<string, number>;
  onSelectCategory: (category: string) => void;
  onSelectDepartment: (dept: Department) => void;
}

// Category image map for rail thumbnails
const CATEGORY_IMAGES: Record<string, string> = {
  All: 'https://picsum.photos/seed/rail-all/120/120',
  'T-Shirts & Tops': 'https://picsum.photos/seed/rail-tee/120/120',
  Dresses: 'https://picsum.photos/seed/rail-dress/120/120',
  'Jeans & Trousers': 'https://picsum.photos/seed/rail-jeans/120/120',
  Shirts: 'https://picsum.photos/seed/rail-shirt/120/120',
  Kidswear: 'https://picsum.photos/seed/rail-kids/120/120',
  'Kurtas & Sets': 'https://picsum.photos/seed/rail-kurta/120/120',
};

export const CategoryRail: React.FC<CategoryRailProps> = ({
  currentCategory,
  categories,
  categoryCounts,
  onSelectCategory,
}) => {
  return (
    <nav 
      aria-label="Subcategories"
      className="sticky top-32 w-20 sm:w-36 md:w-44 shrink-0 bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-1.5 sm:p-2 self-start max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar"
    >
      <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-stone-400 px-2 py-1 text-center hidden sm:block">
        Subcategories
      </div>

      <div className="flex flex-col gap-1.5">
        {categories.map((cat) => {
          const isSelected = currentCategory === cat;
          const count = categoryCounts[cat] ?? 0;
          const imgUrl = CATEGORY_IMAGES[cat] || `https://picsum.photos/seed/rail-${cat.toLowerCase().replace(/\s+/g, '-')}/120/120`;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`group flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer text-center sm:text-left ${
                isSelected
                  ? 'bg-amber-50 border border-amber-300/80 text-amber-950 shadow-2xs font-bold'
                  : 'hover:bg-stone-50 border border-transparent text-stone-700'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                <img
                  src={imgUrl}
                  alt={cat}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              {/* Label & Count */}
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] sm:text-xs leading-tight truncate">
                  {cat}
                </span>
                <span
                  className={`inline-block text-[9px] sm:text-[10px] font-mono mt-0.5 ${
                    isSelected ? 'text-amber-800 font-semibold' : 'text-stone-400'
                  }`}
                >
                  {count} items
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
