import React from 'react';
import { Sparkles, Scissors, Leaf } from 'lucide-react';

export const BrandStoryBlock: React.FC = () => {
  return (
    <section className="mb-16 py-12 px-6 sm:px-10 bg-stone-100/70 rounded-3xl border border-stone-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800">
            The Centre Standard
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-stone-900 mt-1">
            Rooted in Craft, Tailored for Everyday Elegance.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            More than just a clothing shop — an apparel emporium bringing bespoke comfort and thoughtful craftsmanship to every wardrobe.
          </p>
        </div>

        {/* 3-Column Luxury Minimal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              Conscious Materiality
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Natural Fibers & Handloom Weaves
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every garment in our showroom is selected for tactile comfort and all-day breathability — from combed organic cottons to airy linens and soft artisan silks.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              Centre In-Store Alterations
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Complimentary Master Tailoring
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Trial suites with dedicated alteration specialists on floor. We adjust waistlines, sleeve lengths, and trouser hems on-site to ensure an impeccably flattering drape.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
              Curated Wardrobes
            </span>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Everyday Casual & Festive Special
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Carefully balanced silhouettes that transition effortlessly from morning commutes to relaxed family dinners and traditional festive gatherings.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
