import React from 'react';
import { Sparkles, Scissors, HeartHandshake } from 'lucide-react';
import { STORE_CENTRE_INFO } from '../data/clothingData';

export const BrandStoryBlock: React.FC = () => {
  return (
    <section className="mb-16 py-12 px-6 sm:px-10 bg-stone-100/70 rounded-3xl border border-stone-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800">
            {STORE_CENTRE_INFO.name} Heritage
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-stone-900 mt-1">
            Rooted in Tradition, Tailored for Grace.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            {STORE_CENTRE_INFO.tagline} — an authentic boutique curating artisan handlooms, vibrant festive silhouettes, and coordinated family ensembles with bespoke in-house tailoring.
          </p>
        </div>

        {/* 3-Column Luxury Minimal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              Pure Silk & Handlooms
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Authentic Artisan Weaves
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every saree and kurti is handpicked directly from traditional weaving hubs across Kanchipuram, Chanderi, and Jaipur — celebrated for pure natural fibers and heirloom quality.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              In-House Tailoring
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Complimentary Saree Fall & Pico
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Enjoy complete peace of mind with complimentary saree fall stitching, edge pico finishing, and master alteration assistance for chudidars, sleeves, and kidswear.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              Festive & Family Edits
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Celebration-Ready Wardrobes
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              From temple mornings and festive pujas to weddings and casual daily comfort, explore thoughtfully harmonized palettes for women and kids of all ages.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
