import React, { useState } from 'react';
import { X, Ruler, Info, MessageCircle, Sparkles } from 'lucide-react';
import { Size } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { buildLink } from '../lib/whatsapp';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedSize?: (size: Size) => void;
}

const BLOUSE_SPECS = [
  { size: '32', bust: '32"', underbust: '27"', shoulder: '13.5"' },
  { size: '34', bust: '34"', underbust: '29"', shoulder: '14.0"' },
  { size: '36', bust: '36"', underbust: '31"', shoulder: '14.5"' },
  { size: '38', bust: '38"', underbust: '33"', shoulder: '15.0"' },
  { size: '40', bust: '40"', underbust: '35"', shoulder: '15.5"' },
  { size: '42', bust: '42"', underbust: '37"', shoulder: '16.0"' },
  { size: '44', bust: '44"', underbust: '39"', shoulder: '16.5"' },
  { size: '46', bust: '46"', underbust: '41"', shoulder: '17.0"' }
];

const COORDS_SPECS = [
  { size: 'S', bust: '34" - 35"', waist: '26" - 28"', hip: '36" - 38"' },
  { size: 'M', bust: '36" - 37"', waist: '29" - 31"', hip: '39" - 41"' },
  { size: 'L', bust: '38" - 39"', waist: '32" - 34"', hip: '42" - 44"' },
  { size: 'XL', bust: '40" - 42"', waist: '35" - 37"', hip: '45" - 47"' },
  { size: '2XL', bust: '43" - 45"', waist: '38" - 40"', hip: '48" - 50"' },
  { size: '3XL', bust: '46" - 48"', waist: '41" - 43"', hip: '51" - 53"' }
];

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedSize
}) => {
  const [activeTab, setActiveTab] = useState<'blouses' | 'coords'>('blouses');

  if (!isOpen) return null;

  const whatsappInquiryUrl = buildLink(
    STORE_CENTRE_INFO.whatsapp,
    `Hello ${STORE_CENTRE_INFO.name}, I need sizing assistance with a garment.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-5 sm:p-8 relative safe-area-bottom sm:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-800">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <h2 className="font-serif-display text-xl font-bold text-stone-900">
                  Boutique Size Guide
                </h2>
                <span className="font-tamil text-xs font-semibold text-amber-700">
                  அளவு வழிகாட்டி
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Accurate fit reference for Yaazh Boutique ethnic collections
              </p>
            </div>
          </div>

          <button
            id="close-size-guide-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
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
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Blouses (32 – 46)
          </button>
          <button
            onClick={() => setActiveTab('coords')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coords'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Co-ords & Lounge (S – 3XL)
          </button>
        </div>

        {/* Tab 1: Blouses */}
        {activeTab === 'blouses' && (
          <div className="mt-5 space-y-4">
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Underbust</th>
                    <th className="py-2.5 px-3">Shoulder</th>
                    {onSelectRecommendedSize && <th className="py-2.5 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {BLOUSE_SPECS.map((spec) => (
                    <tr key={spec.size} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2 px-3 font-bold font-mono text-stone-900">{spec.size}</td>
                      <td className="py-2 px-3 text-stone-700">{spec.bust}</td>
                      <td className="py-2 px-3 text-stone-600">{spec.underbust}</td>
                      <td className="py-2 px-3 text-stone-600">{spec.shoulder}</td>
                      {onSelectRecommendedSize && (
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => {
                              onSelectRecommendedSize(spec.size as Size);
                              onClose();
                            }}
                            className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[10px] cursor-pointer"
                          >
                            Select
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Boutique Alteration Margin:</span>
                <span className="text-amber-900 text-[11px]">
                  All stitched blouses include a generous 2-inch inner fabric seam allowance on both sides for effortless tailoring adjustment.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Co-ords & Lounge Wear */}
        {activeTab === 'coords' && (
          <div className="mt-5 space-y-4">
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hip</th>
                    {onSelectRecommendedSize && <th className="py-2.5 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {COORDS_SPECS.map((spec) => (
                    <tr key={spec.size} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2 px-3 font-bold text-stone-900">{spec.size}</td>
                      <td className="py-2 px-3 text-stone-700">{spec.bust}</td>
                      <td className="py-2 px-3 text-stone-600">{spec.waist}</td>
                      <td className="py-2 px-3 text-stone-600">{spec.hip}</td>
                      {onSelectRecommendedSize && (
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => {
                              onSelectRecommendedSize(spec.size as Size);
                              onClose();
                            }}
                            className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[10px] cursor-pointer"
                          >
                            Select
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2.5 text-xs text-stone-700">
              <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <span>
                Relaxed luxury silhouettes designed for effortless comfort. If you prefer a tailored fit, choose your exact measurement size.
              </span>
            </div>
          </div>
        )}

        {/* Custom Sizing Inquiry on WhatsApp */}
        <div className="mt-5 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500 text-center sm:text-left">
            Uncertain about your fit? We provide personalized fitting guidance.
          </p>
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Ask on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
