import React from 'react';
import { Department } from '../types';
import { CATEGORY_TILES } from '../data/categories';

interface CategoryTileGridProps {
  onSelectCategory: (dept: Department, category: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryTileGrid: React.FC<CategoryTileGridProps> = ({ 
  onSelectCategory,
  categoryCounts,
}) => {
  // Hide any category tile that currently has zero products
  const visibleTiles = CATEGORY_TILES.filter((tile) => {
    if (!categoryCounts) return true;
    return (categoryCounts[tile.category] ?? 0) > 0;
  });

  if (visibleTiles.length === 0) {
    return null;
  }

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-pink">
            Curated Departments
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-text mt-0.5">
            Shop by Category
          </h2>
        </div>
      </div>

      {/* Grid: 4 columns on mobile, up to 8 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {visibleTiles.map((tile) => {
          const count = categoryCounts ? categoryCounts[tile.category] : undefined;

          return (
            <button
              key={tile.id}
              onClick={() => onSelectCategory(tile.department, tile.category)}
              className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
            >
              {/* Rounded-square tile with solid or gradient tinted background and text only */}
              <div
                className="w-full aspect-square rounded-2xl p-3 flex flex-col items-center justify-center overflow-hidden border border-border shadow-2xs group-hover:border-pink/50 group-hover:shadow-[0_0_15px_rgba(255,61,165,0.25)] transition-all relative"
                style={{ backgroundColor: tile.tint || '#1A1A1A' }}
              >
                {tile.image ? (
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-1.5 select-none">
                    <span className="font-serif-display text-xs sm:text-sm font-bold text-text leading-tight line-clamp-2 group-hover:text-pink transition-colors">
                      {tile.label}
                    </span>
                    {count !== undefined && (
                      <span className="text-[10px] text-text-muted font-mono mt-1">
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Label underneath */}
              <span className="mt-2 text-[11px] sm:text-xs font-semibold text-text-muted group-hover:text-pink transition-colors line-clamp-1">
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
