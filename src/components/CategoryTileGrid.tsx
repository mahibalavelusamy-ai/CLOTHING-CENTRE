import React from 'react';
import { Department } from '../types';
import { CATEGORY_TILES } from '../data/categories';

interface CategoryTileGridProps {
  onSelectCategory: (dept: Department, category: string) => void;
}

export const CategoryTileGrid: React.FC<CategoryTileGridProps> = ({ onSelectCategory }) => {
  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800">
            Curated Departments
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            Shop by Category
          </h2>
        </div>
      </div>

      {/* Grid: 4 columns on mobile, up to 8 on desktop */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORY_TILES.map((tile) => (
          <button
            key={tile.id}
            onClick={() => onSelectCategory(tile.department, tile.category)}
            className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
          >
            {/* Rounded-square tile with soft pastel tint */}
            <div
              className="w-full aspect-square rounded-2xl p-2.5 sm:p-3 flex items-center justify-center overflow-hidden border border-stone-200/80 shadow-2xs group-hover:shadow-md transition-shadow"
              style={{ backgroundColor: tile.tint }}
            >
              <img
                src={tile.image}
                alt={tile.label}
                className="w-full h-full object-cover rounded-xl group-hover:scale-108 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            {/* Label underneath */}
            <span className="mt-2 text-[11px] sm:text-xs font-semibold text-stone-800 group-hover:text-amber-800 transition-colors line-clamp-1">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
