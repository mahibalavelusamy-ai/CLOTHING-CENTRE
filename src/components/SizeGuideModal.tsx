import React, { useState } from 'react';
import { X, Ruler, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { SIZE_CHART_DATA } from '../data/clothingData';
import { Size } from '../types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedSize?: (size: Size) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedSize
}) => {
  if (!isOpen) return null;

  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [userChest, setUserChest] = useState('');
  const [userWaist, setUserWaist] = useState('');
  const [recommendedSize, setRecommendedSize] = useState<Size | null>(null);

  const chart = unit === 'inches' ? SIZE_CHART_DATA.inches : SIZE_CHART_DATA.cm;

  const calculateRecommendedSize = (e: React.FormEvent) => {
    e.preventDefault();
    const chestVal = parseFloat(userChest);
    if (isNaN(chestVal)) return;

    // Normalize to inches for simple calculation
    const chestInches = unit === 'cm' ? chestVal / 2.54 : chestVal;

    if (chestInches <= 34) setRecommendedSize('XS');
    else if (chestInches <= 37) setRecommendedSize('S');
    else if (chestInches <= 40) setRecommendedSize('M');
    else if (chestInches <= 43) setRecommendedSize('L');
    else if (chestInches <= 46) setRecommendedSize('XL');
    else setRecommendedSize('XXL');
  };

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
                Garment Sizing & Tailoring Guide
              </h2>
              <p className="text-xs text-stone-500">
                Official sizing standards for Royal Heritage Clothing Centre
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

        {/* Unit Toggle & Interactive Estimator */}
        <div className="mt-6 bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Bespoke Size Finder</span>
              </h3>
              <p className="text-xs text-stone-600">
                Input your measurements to determine your tailored fit.
              </p>
            </div>

            {/* Switch unit */}
            <div className="flex items-center bg-stone-200 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  unit === 'inches'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Metric (cm)
              </button>
            </div>
          </div>

          <form onSubmit={calculateRecommendedSize} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Chest / Bust ({unit}):
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={unit === 'inches' ? 'e.g. 38' : 'e.g. 96'}
                value={userChest}
                onChange={(e) => setUserChest(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Natural Waist ({unit}):
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={unit === 'inches' ? 'e.g. 32' : 'e.g. 81'}
                value={userWaist}
                onChange={(e) => setUserWaist(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-3 bg-stone-900 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Recommend My Size
              </button>
            </div>
          </form>

          {recommendedSize && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-900">
                  Recommended Fit: <strong className="text-sm font-bold text-emerald-950">Size {recommendedSize}</strong>
                </span>
              </div>
              {onSelectRecommendedSize && (
                <button
                  onClick={() => {
                    onSelectRecommendedSize(recommendedSize);
                    onClose();
                  }}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Apply Size {recommendedSize}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Measurement Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
            Garment Dimension Chart ({unit.toUpperCase()})
          </h3>
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 border-b border-stone-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Chest / Bust</th>
                  <th className="py-2.5 px-3">Waist</th>
                  <th className="py-2.5 px-3">Hips</th>
                  <th className="py-2.5 px-3">Shoulder</th>
                  <th className="py-2.5 px-3">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {chart.map((row) => {
                  const isHighlighted = recommendedSize === row.size;
                  return (
                    <tr
                      key={row.size}
                      className={`transition-colors ${
                        isHighlighted
                          ? 'bg-amber-100/60 font-semibold text-amber-950'
                          : 'hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded ${isHighlighted ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-800'}`}>
                          {row.size}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{row.chest}</td>
                      <td className="py-2.5 px-3">{row.waist}</td>
                      <td className="py-2.5 px-3">{row.hip}</td>
                      <td className="py-2.5 px-3">{row.shoulder}</td>
                      <td className="py-2.5 px-3">{row.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measurement Tips */}
        <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-stone-900">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <span>How to Measure Accurately</span>
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Chest:</strong> Wrap the tape measure around the fullest part of your chest/bust, keeping the tape level under your arms.</li>
            <li><strong>Waist:</strong> Measure around your natural waistline, where your body narrows slightly.</li>
            <li><strong>In-Store Alterations:</strong> Visit our Centre Fitting Suite for complimentary sleeve length and hem adjustments on any purchase.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
