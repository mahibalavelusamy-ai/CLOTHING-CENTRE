import React from 'react';
import { Sparkles, HeartHandshake, Scissors } from 'lucide-react';
import { STORE_CENTRE_INFO } from '../data/clothingData';

export const BrandStoryBlock: React.FC = () => {
  return (
    <section className="mb-16 py-12 px-6 sm:px-10 bg-stone-100/70 rounded-3xl border border-stone-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800">
            About {STORE_CENTRE_INFO.name}
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-stone-900 mt-1">
            Elegance · Tradition · Style
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Located in MR Complex, Kallimandayam, Oddanchatram, {STORE_CENTRE_INFO.name} brings together handpicked ethnic collections, casual essentials, and handcrafted decor.
          </p>
        </div>

        {/* 3-Column Honest Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              Curated Collections
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Sarees & Ethnic Wear
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Explore our selection of sarees, blouses, crop tops, co-ord sets, salwar materials, and comfortable lounge wear curated for grace and everyday style.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              In-Store Service
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Saree Pre-Pleating Service
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Saree pre-pleating service available in store. Get your sarees pre-pleated and box-folded with precision for effortless, drape-ready wear on your special days.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              Easy Fulfilment
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Store Pickup & Delivery
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Order online and collect from MR Complex, Kallimandayam at a time slot you choose, or enjoy doorstep delivery with zero fee on orders above ₹1,999.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
