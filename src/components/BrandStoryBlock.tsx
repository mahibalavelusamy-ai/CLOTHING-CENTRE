import React from 'react';
import { Sparkles, HeartHandshake, Scissors } from 'lucide-react';
import { STORE_CENTRE_INFO } from '../data/clothingData';

export const BrandStoryBlock: React.FC = () => {
  return (
    <section className="mb-16 py-12 px-6 sm:px-10 bg-surface rounded-3xl border border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-pink">
            About {STORE_CENTRE_INFO.name}
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-text mt-1">
            Elegance · Tradition · Style
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
            Located in MR Complex, Kallimandayam, Oddanchatram, {STORE_CENTRE_INFO.name} brings together handpicked ethnic collections, casual essentials, and handcrafted decor.
          </p>
        </div>

        {/* 3-Column Honest Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-surface-2 p-6 sm:p-8 rounded-2xl border border-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink/15 text-pink flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted block">
              Curated Collections
            </span>
            <h3 className="font-serif-display text-lg font-bold text-text">
              Sarees & Ethnic Wear
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Explore our selection of sarees, blouses, crop tops, co-ord sets, salwar materials, and comfortable lounge wear curated for grace and everyday style.
            </p>
          </div>

          <div className="bg-surface-2 p-6 sm:p-8 rounded-2xl border border-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink/15 text-pink flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted block">
              In-Store Service
            </span>
            <h3 className="font-serif-display text-lg font-bold text-text">
              Saree Pre-Pleating Service
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Saree pre-pleating service available in store. Get your sarees pre-pleated and box-folded with precision for effortless, drape-ready wear on your special days.
            </p>
          </div>

          <div className="bg-surface-2 p-6 sm:p-8 rounded-2xl border border-border shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink/15 text-pink flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted block">
              Handcrafted Decor
            </span>
            <h3 className="font-serif-display text-lg font-bold text-text">
              Plate Decor & Crafting
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Custom decorated plates and handmade craft items tailored for engagement thamboolam, festive ceremonies, and gift presentations.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
