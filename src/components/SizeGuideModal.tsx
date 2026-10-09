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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-surface rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-pink/15 border border-pink/30 flex items-center justify-center text-pink">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-text">
                Boutique Size Guide
              </h2>
              <p className="text-xs text-text-muted">
                Sizing reference for Yaazh Boutique collections
              </p>
            </div>
          </div>

          <button
            id="close-size-guide-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface border border-border text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Tabs: Blouses and Co-ords & Lounge Wear */}
        <div className="flex items-center gap-2 mt-5 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('blouses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'blouses'
                ? 'bg-pink text-white shadow-xs'
                : 'bg-surface-2 text-text-muted hover:text-text'
            }`}
          >
            Blouses
          </button>
          <button
            onClick={() => setActiveTab('coords')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coords'
                ? 'bg-pink text-white shadow-xs'
                : 'bg-surface-2 text-text-muted hover:text-text'
            }`}
          >
            Co-ords & Lounge Wear
          </button>
        </div>

        {/* Tab 1: Blouses */}
        {activeTab === 'blouses' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-surface-2 border border-border rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                Available Size Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {BLOUSE_SIZES.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-surface border border-border text-text font-mono font-bold text-xs"
                  >
                    Size {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-pink/10 border border-pink/20 rounded-xl flex items-start gap-2.5 text-xs text-pink-tint font-medium">
              <Info className="w-4 h-4 text-pink shrink-0 mt-0.5" />
              <span>Exact measurements will be added by Yaazh Boutique.</span>
            </div>
          </div>
        )}

        {/* Tab 2: Co-ords & Lounge Wear */}
        {activeTab === 'coords' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-surface-2 border border-border rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                Available Size Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {COORDS_LOUNGE_SIZES.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-surface border border-border text-text font-bold text-xs"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-pink/10 border border-pink/20 rounded-xl flex items-start gap-2.5 text-xs text-pink-tint font-medium">
              <Info className="w-4 h-4 text-pink shrink-0 mt-0.5" />
              <span>Exact measurements will be added by Yaazh Boutique.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
