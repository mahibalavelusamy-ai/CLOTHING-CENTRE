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
    <section className="mb-16">
      <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] leading-tight">
            Shop by category
          </h2>
          <p className="text-sm sm:text-base text-[#6E6E73] mt-1 font-normal">
            Curated handpicked weaves, tailored cuts, and festive pieces.
          </p>
        </div>
        <button
          onClick={() => onSelectCategory('all', 'All')}
          className="text-[#6D1A33] hover:text-[#561428] text-sm sm:text-base font-medium hover:underline bg-transparent border-0 cursor-pointer p-0"
        >
          Shop everything →
        </button>
      </div>

      {/* Grid: 2 columns on mobile, up to 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {visibleTiles.map((tile) => {
          const count = categoryCounts ? categoryCounts[tile.category] : undefined;

          return (
            <button
              key={tile.id}
              onClick={() => onSelectCategory(tile.department, tile.category)}
              className="card bg-transparent border-0 p-0 text-left cursor-pointer group"
            >
              {/* Rounded tile with soft background */}
              <div className="tile bg-[#F5F5F7] rounded-[20px] aspect-square flex items-center justify-center transition-colors duration-200 group-hover:bg-[#EFEFF2] overflow-hidden p-3 relative">
                {tile.image ? (
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-16 rounded-lg bg-[#6D1A33] border-b-4 border-[#C9A45C]" />
                )}
              </div>
              
              {/* Labels underneath */}
              <div className="text-[15px] font-medium text-[#1D1D1F] mt-3 group-hover:text-[#6D1A33] transition-colors truncate">
                {tile.label}
              </div>
              {count !== undefined && (
                <div className="text-[13px] text-[#6E6E73] mt-0.5 font-normal">
                  {count} {count === 1 ? 'piece' : 'pieces'}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
