import React, { useState } from 'react';
import { X, Ruler, Info } from 'lucide-react';
import { Size } from '../types';
import { DEPARTMENT_CONFIG } from '../data/catalogConfig';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedSize?: (size: Size) => void;
}

const BLOUSE_SIZES = DEPARTMENT_CONFIG.blouses.sizes;
const COORDS_LOUNGE_SIZES = DEPARTMENT_CONFIG.coords.sizes;

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedSize
}) => {
  const [activeTab, setActiveTab] = useState<'blouses' | 'coords'>('blouses');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-stone-900">
                Boutique Size Guide
              </h2>
              <p className="text-xs text-stone-500">
                Sizing reference for Yaazh Boutique collections
              </p>
            </div>
          </div>

          <button
            id="close-size-guide-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Tabs: Blouses and Co-ords & Lounge Wear */}
        <div className="flex items-center gap-2 mt-5 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('blouses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'blouses'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Blouses
          </button>
          <button
            onClick={() => setActiveTab('coords')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coords'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Co-ords & Lounge Wear
          </button>
        </div>

        {/* Tab 1: Blouses */}
        {activeTab === 'blouses' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
                Available Size Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {BLOUSE_SIZES.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-stone-200 text-stone-900 font-mono font-bold text-xs"
                  >
                    Size {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 font-medium">
              <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <span>Exact measurements will be added by Yaazh Boutique.</span>
            </div>
          </div>
        )}

        {/* Tab 2: Co-ords & Lounge Wear */}
        {activeTab === 'coords' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
                Available Size Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {COORDS_LOUNGE_SIZES.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-stone-200 text-stone-900 font-bold text-xs"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 font-medium">
              <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <span>Exact measurements will be added by Yaazh Boutique.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
