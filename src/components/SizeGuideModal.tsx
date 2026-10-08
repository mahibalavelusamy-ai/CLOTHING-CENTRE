import React, { useState } from 'react';
import { X, Ruler, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { Size } from '../types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedSize?: (size: Size) => void;
}

const KURTI_SIZES: { size: Size; bust: string; waist: string; hip: string; length: string }[] = [
  { size: 'S', bust: '36"', waist: '32"', hip: '38"', length: '42"' },
  { size: 'M', bust: '38"', waist: '34"', hip: '40"', length: '42"' },
  { size: 'L', bust: '40"', waist: '36"', hip: '42"', length: '43"' },
  { size: 'XL', bust: '42"', waist: '38"', hip: '44"', length: '43"' },
  { size: 'XXL', bust: '44"', waist: '40"', hip: '46"', length: '44"' },
  { size: '3XL', bust: '46"', waist: '42"', hip: '48"', length: '44"' },
];

const KIDS_SIZES: { size: Size; heightCm: string; chestInches: string; ageGroup: string }[] = [
  { size: '1-2Y', heightCm: '80 – 86 cm', chestInches: '20"', ageGroup: '12 – 24 Months' },
  { size: '2-3Y', heightCm: '86 – 92 cm', chestInches: '21"', ageGroup: '2 – 3 Years' },
  { size: '3-4Y', heightCm: '92 – 98 cm', chestInches: '22"', ageGroup: '3 – 4 Years' },
  { size: '4-5Y', heightCm: '98 – 104 cm', chestInches: '23"', ageGroup: '4 – 5 Years' },
  { size: '5-6Y', heightCm: '104 – 110 cm', chestInches: '24"', ageGroup: '5 – 6 Years' },
  { size: '6-7Y', heightCm: '110 – 116 cm', chestInches: '25"', ageGroup: '6 – 7 Years' },
  { size: '7-8Y', heightCm: '116 – 122 cm', chestInches: '26"', ageGroup: '7 – 8 Years' },
  { size: '8-9Y', heightCm: '122 – 128 cm', chestInches: '27"', ageGroup: '8 – 9 Years' },
  { size: '9-10Y', heightCm: '128 – 134 cm', chestInches: '28"', ageGroup: '9 – 10 Years' },
];

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedSize
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'kurtis' | 'kids' | 'sarees'>('kurtis');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 relative"
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
                Boutique Size & Draping Guide
              </h2>
              <p className="text-xs text-stone-500">
                Tailoring measurements for Sarees, Kurtis & Chudidars, and Kidswear
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

        {/* 3 Tabs: Kurtis & Chudidars, Kidswear, Sarees */}
        <div className="flex items-center gap-2 mt-5 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('kurtis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'kurtis'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Kurtis & Chudidars
          </button>
          <button
            onClick={() => setActiveTab('kids')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'kids'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Kidswear
          </button>
          <button
            onClick={() => setActiveTab('sarees')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sarees'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Sarees & Drapes
          </button>
        </div>

        {/* Tab 1: Kurtis & Chudidars */}
        {activeTab === 'kurtis' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Standard Garment Dimensions (Inches)
              </span>
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                Sizes S to 3XL
              </span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Bust (Inches)</th>
                    <th className="py-2.5 px-3">Waist (Inches)</th>
                    <th className="py-2.5 px-3">Hip (Inches)</th>
                    <th className="py-2.5 px-3">Standard Length</th>
                    {onSelectRecommendedSize && <th className="py-2.5 px-3 text-right">Filter</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {KURTI_SIZES.map((row) => (
                    <tr key={row.size} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-stone-200 text-stone-900">
                          {row.size}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{row.bust}</td>
                      <td className="py-2.5 px-3 font-mono">{row.waist}</td>
                      <td className="py-2.5 px-3 font-mono">{row.hip}</td>
                      <td className="py-2.5 px-3 font-mono">{row.length}</td>
                      {onSelectRecommendedSize && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              onSelectRecommendedSize(row.size);
                              onClose();
                            }}
                            className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                          >
                            Apply
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Kidswear */}
        {activeTab === 'kids' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Children Age & Measurement Reference
              </span>
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                Ages 1Y to 10Y
              </span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Size Tag</th>
                    <th className="py-2.5 px-3">Age Group</th>
                    <th className="py-2.5 px-3">Child Height (cm)</th>
                    <th className="py-2.5 px-3">Chest (Inches)</th>
                    {onSelectRecommendedSize && <th className="py-2.5 px-3 text-right">Filter</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {KIDS_SIZES.map((row) => (
                    <tr key={row.size} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-stone-200 text-stone-900">
                          {row.size}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-700">{row.ageGroup}</td>
                      <td className="py-2.5 px-3 font-mono">{row.heightCm}</td>
                      <td className="py-2.5 px-3 font-mono">{row.chestInches}</td>
                      {onSelectRecommendedSize && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              onSelectRecommendedSize(row.size);
                              onClose();
                            }}
                            className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                          >
                            Apply
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Sarees */}
        {activeTab === 'sarees' && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 block">
                  Standard Saree Length
                </span>
                <p className="text-xl font-bold font-serif-display text-amber-950 mt-1">
                  5.5 Metres (approx. 6 Yards)
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  Ample length for traditional Nivi draping with graceful pleats and an elegant pallu fall.
                </p>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
                  Attached Blouse Piece
                </span>
                <p className="text-xl font-bold font-serif-display text-stone-900 mt-1">
                  0.8 Metres (80 cm unstitched)
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  Included running fabric at the end of the saree, ready for custom tailoring up to size 44" bust.
                </p>
              </div>
            </div>

            {/* Saree Width */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Standard Saree Width / Height:</span>
              <span className="font-bold text-stone-900 font-mono">44 to 45 Inches (fits all heights comfortably)</span>
            </div>

            {/* Care and Draping Tips */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Care & Draping Tips</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  <strong>Dry Cleaning:</strong> Pure Kanchipuram silk, Banarasi zari, and handloom cotton sarees should always be dry cleaned to preserve gold zari lustre and natural drape.
                </li>
                <li>
                  <strong>Storage:</strong> Wrap in pure cotton or muslin fabric; avoid plastic bags and refold occasionally to avoid permanent crease lines.
                </li>
                <li>
                  <strong>Draping Tip:</strong> Tie the petticoat/shapewear firmly at the natural waistline. Fold 5–7 pleats tucking neatly at the navel before draping pallu over the left shoulder.
                </li>
                <li>
                  <strong>Finishing:</strong> Complimentary saree fall and edge pico work are available on all sarees purchased at our boutique.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Visible Note: Measurements are indicative */}
        <div className="mt-6 p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-950 font-medium">
          <Info className="w-4 h-4 text-amber-800 shrink-0" />
          <span>Note: Measurements are indicative. Slight variations of 0.5 to 1 inch may occur due to traditional artisan hand-weaving and handcrafted stitching.</span>
        </div>
      </div>
    </div>
  );
};
