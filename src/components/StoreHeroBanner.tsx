import React from 'react';
import { Sparkles, Scissors, Clock, ShieldCheck, MapPin, ChevronRight } from 'lucide-react';
import { Department } from '../types';

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
            <span>Autumn & Festive Collection Now Racked</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-bold text-white tracking-tight leading-tight">
            Crafted Elegance for Every Occasion.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            Welcome to the Clothing Centre emporium. Discover bespoke silks, tailored linens, breathable supima cottons, and kids festive wear. Enjoy complimentary fitting room trial suites and master tailor alterations on every purchase.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => onSelectDepartment('ethnic')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Festive & Traditional</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectDepartment('women')}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              Women's Apparel
            </button>

            <button
              onClick={() => onSelectDepartment('men')}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              Men's Tailoring
            </button>

            <button
              onClick={onOpenSizeGuide}
              className="px-4 py-2.5 bg-transparent hover:bg-stone-800/80 text-amber-300 font-semibold text-xs sm:text-sm rounded-xl border border-amber-500/40 transition-colors cursor-pointer"
            >
              Sizing Calculator
            </button>
          </div>
        </div>

        {/* Right Centre Services Highlight Card */}
        <div className="w-full lg:w-80 bg-stone-800/80 backdrop-blur-md rounded-xl p-5 border border-stone-700 text-xs space-y-3.5 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-700 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Clothing Centre Highlights</span>
          </div>

          <div className="flex items-start gap-2.5 text-stone-300">
            <Scissors className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Master Tailor On-Site</strong>
              <span className="text-stone-400 text-[11px]">Free cuff, hem, and waist alterations on all purchases.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-stone-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">2-Hour Express Click & Collect</strong>
              <span className="text-stone-400 text-[11px]">Order online and pick up at the Regent Blvd counter today.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-stone-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Quality & Fit Guarantee</strong>
              <span className="text-stone-400 text-[11px]">30-day hassle-free exchange & in-person trial rooms.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
