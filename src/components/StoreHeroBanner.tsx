import React from 'react';
import { Sparkles, Scissors, ChevronRight } from 'lucide-react';
import { Department } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';

interface StoreHeroBannerProps {
  onSelectDepartment: (dept: Department) => void;
  onOpenSizeGuide: () => void;
}

export const StoreHeroBanner: React.FC<StoreHeroBannerProps> = ({
  onSelectDepartment,
  onOpenSizeGuide
}) => {
  return (
    <div className="relative bg-stone-900 text-stone-100 rounded-2xl overflow-hidden border border-stone-800 shadow-lg mb-8">
      {/* Background subtle styling */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 opacity-95" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Editorial Copy */}
        <div className="max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Festive & Wedding Collection Now Available</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-bold text-white tracking-tight leading-tight">
            Crafted Elegance for Every Celebration.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            Welcome to {STORE_CENTRE_INFO.name}. Discover pure Kanchipuram and Banarasi sarees, graceful flowing kurtis and chudidar sets, and vibrant festive kidswear. Enjoy complimentary saree fall pico and custom alterations.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => onSelectDepartment('sarees')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Explore Sarees</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectDepartment('kurtis')}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              Kurtis & Sets
            </button>

            <button
              onClick={() => onSelectDepartment('kids')}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              Kidswear
            </button>

            <button
              onClick={onOpenSizeGuide}
              className="px-4 py-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 font-medium text-xs sm:text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Fitting Guide</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
