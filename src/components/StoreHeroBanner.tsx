import React from 'react';
import { Sparkles, MapPin, Phone, ChevronRight } from 'lucide-react';
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
    <div className="relative bg-surface text-text rounded-2xl overflow-hidden border border-border shadow-lg mb-8">
      {/* Background subtle styling */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-surface to-pink/10 opacity-95" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Editorial Copy */}
        <div className="max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-pink/15 border border-pink/30 text-pink text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-pink" />
            <span>Festive & Wedding Collection Now Available</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-bold text-white tracking-tight leading-tight">
            Crafted Elegance for Every Celebration.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed max-w-xl">
            Welcome to Yaazh Boutique, Oddanchatram. Step into a world of elegance, tradition and style, crafted just for you.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => onSelectDepartment('sarees')}
              className="px-5 py-2.5 btn-primary-glossy text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Explore Sarees</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectDepartment('blouses')}
              className="px-4 py-2.5 bg-surface-2 hover:bg-surface text-text font-semibold text-xs sm:text-sm rounded-xl border border-border transition-colors cursor-pointer"
            >
              Blouses
            </button>

            <button
              onClick={() => onSelectDepartment('coords')}
              className="px-4 py-2.5 bg-surface-2 hover:bg-surface text-text font-semibold text-xs sm:text-sm rounded-xl border border-border transition-colors cursor-pointer"
            >
              Co-ords
            </button>

            <button
              onClick={onOpenSizeGuide}
              className="px-4 py-2.5 bg-surface-2 hover:bg-surface text-text-muted hover:text-text font-medium text-xs sm:text-sm rounded-xl border border-border transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Size Guide</span>
            </button>
          </div>
        </div>

        {/* Right: Visit Yaazh Boutique box */}
        <div className="bg-surface-2/90 border border-border rounded-2xl p-5 sm:p-6 text-text shadow-xl max-w-sm w-full shrink-0">
          <div className="flex items-center gap-2 text-pink font-bold text-sm mb-3">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Visit Yaazh Boutique</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            {STORE_CENTRE_INFO.address}
          </p>
          <div className="space-y-1 text-xs pt-2 border-t border-border text-text-muted">
            <div className="flex items-center gap-1.5 text-pink">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <a href={`tel:${STORE_CENTRE_INFO.phone.replace(/\s+/g, '')}`} className="hover:text-pink-tint transition-colors">
                {STORE_CENTRE_INFO.phone}
              </a>
            </div>
            {STORE_CENTRE_INFO.phone2 && (
              <div className="flex items-center gap-1.5 text-text-muted pl-5">
                <a href={`tel:${STORE_CENTRE_INFO.phone2.replace(/\s+/g, '')}`} className="hover:text-pink transition-colors">
                  {STORE_CENTRE_INFO.phone2}
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
