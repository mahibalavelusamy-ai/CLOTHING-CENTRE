import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Package } from 'lucide-react';
import { ClothingItem, Department, Size, ColorOption } from '../../types';
import { DEPARTMENT_CONFIG, DEPARTMENTS, FIT_TYPES, OCCASIONS } from '../../data/catalogConfig';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ClothingItem) => Promise<void>;
  initialItem?: ClothingItem | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem
}) => {
  const isEditing = Boolean(initialItem);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [department, setDepartment] = useState<Exclude<Department, 'all'>>('sarees');
  const [category, setCategory] = useState(DEPARTMENT_CONFIG.sarees.categories[0]);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [fabric, setFabric] = useState('');
  const [description, setDescription] = useState('');
  const [careGuide, setCareGuide] = useState('');
  const [fitType, setFitType] = useState<ClothingItem['fitType']>('Regular Fit');
  const [occasion, setOccasion] = useState<ClothingItem['occasion']>('Festive');
  const [blouseIncluded, setBlouseIncluded] = useState(true);
  const [colorName, setColorName] = useState('Crimson Red');
  const [colorHex, setColorHex] = useState('#8B0000');
  const [imageUrl, setImageUrl] = useState('');
  const [tag, setTag] = useState<'New Arrival' | 'Bestseller' | 'Festive Special' | 'Handloom' | 'Sale'>('New Arrival');
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setSku(initialItem.sku);
      setDepartment(initialItem.department === 'all' ? 'sarees' : (initialItem.department as Exclude<Department, 'all'>));
      setCategory(initialItem.category);
      setPrice(initialItem.price.toString());
      setOriginalPrice(initialItem.originalPrice ? initialItem.originalPrice.toString() : '');
      setFabric(initialItem.fabric || '');
      setDescription(initialItem.description || '');
      setCareGuide(initialItem.careGuide || '');
      setFitType(initialItem.fitType || 'Regular Fit');
      setOccasion(initialItem.occasion || 'Festive');
      setBlouseIncluded(Boolean(initialItem.blouseIncluded));
      setColorName(initialItem.colors?.[0]?.name || 'Traditional Zari');
      setColorHex(initialItem.colors?.[0]?.hex || '#8B0000');
      setImageUrl(initialItem.images?.[0] || '');
      setTag(initialItem.tags?.[0] || 'New Arrival');

      const stockMap: Record<string, number> = {};
      initialItem.sizes.forEach((s) => {
        stockMap[s.size] = s.stock;
      });
      setSizeStocks(stockMap);
    } else {
      // New Garment defaults
      setName('');
      setDepartment('sarees');
      setCategory(DEPARTMENT_CONFIG.sarees.categories[0]);
      setSku(`YB-SAR-${Math.floor(100 + Math.random() * 900)}`);
      setPrice('');
      setOriginalPrice('');
      setFabric('Silk & Zari Blend');
      setDescription('Handpicked designer saree curated by Yaazh Boutique.');
      setCareGuide('Dry clean only to maintain silk luster and zari borders.');
      setFitType('Regular Fit');
      setOccasion('Festive');
      setBlouseIncluded(true);
      setColorName('Crimson Red');
      setColorHex('#8B0000');
      setImageUrl('');
      setTag('New Arrival');

      const initialSizes: Record<string, number> = {};
      DEPARTMENT_CONFIG.sarees.sizes.forEach((s) => {
        initialSizes[s] = 10;
      });
      setSizeStocks(initialSizes);
    }
  }, [initialItem, isOpen]);

  // When department changes in create mode, sync category & sizes
  const handleDepartmentChange = (newDept: Exclude<Department, 'all'>) => {
    setDepartment(newDept);
    const cat = DEPARTMENT_CONFIG[newDept].categories[0];
    setCategory(cat);
    
    if (!isEditing) {
      setSku(`YB-${newDept.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`);
      setBlouseIncluded(newDept === 'sarees');
      setCareGuide(
        newDept === 'sarees' 
          ? 'Dry clean only to maintain silk luster and zari borders.'
          : 'Gentle hand wash with mild detergent, shade dry.'
      );

      const newStocks: Record<string, number> = {};
      DEPARTMENT_CONFIG[newDept].sizes.forEach((s) => {
        newStocks[s] = s === 'Free Size' ? 10 : 6;
      });
      setSizeStocks(newStocks);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !fabric.trim()) {
      alert('Please fill in product name, selling price, and fabric composition.');
      return;
    }

    setSaving(true);
    try {
      const priceNum = parseFloat(price);
      const origPriceNum = originalPrice ? parseFloat(originalPrice) : undefined;
      const discount = origPriceNum && origPriceNum > priceNum
        ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
        : undefined;

      const currentSizes = DEPARTMENT_CONFIG[department].sizes.map((s) => ({
        size: s,
        stock: sizeStocks[s] !== undefined ? Number(sizeStocks[s]) : 5
      }));

      const totalUnits = currentSizes.reduce((sum, s) => sum + s.stock, 0);

      const garment: ClothingItem = {
        id: initialItem?.id || `yb-${Date.now().toString().slice(-4)}`,
        sku: sku.trim() || `YB-${department.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
        name: name.trim(),
        department,
        category,
        price: priceNum,
        originalPrice: origPriceNum,
        discountPercent: discount,
        rating: initialItem?.rating || 5.0,
        reviewCount: initialItem?.reviewCount || 1,
        colors: [
          { name: colorName.trim() || 'Traditional', hex: colorHex }
        ],
        sizes: currentSizes,
        images: imageUrl.trim() ? [imageUrl.trim()] : (initialItem?.images || []),
        description: description.trim() || 'Available at Yaazh Boutique.',
        fabric: fabric.trim(),
        careGuide: careGuide.trim() || 'Gentle wash in cold water.',
        fitType: department === 'sarees' ? undefined : fitType,
        occasion,
        blouseIncluded: department === 'sarees' ? blouseIncluded : undefined,
        tags: [tag],
        inStockTotal: totalUnits,
        barcode: initialItem?.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`
      };

      await onSave(garment);
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-display text-white">
                {isEditing ? `Edit Garment: ${initialItem?.name}` : 'Add New Boutique Garment'}
              </h2>
              <p className="text-[11px] text-stone-400">
                Department categorization, pricing, fabric and inventory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Title, SKU, Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Garment Title / Style Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure Tussar Handloom Saree"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white font-medium"
              >
                {DEPARTMENTS.filter(d => d.key !== 'all').map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white font-medium"
              >
                {DEPARTMENT_CONFIG[department].categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Prices & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                placeholder="e.g. 2450"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Original MRP (₹) (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 3200"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Badge / Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              >
                <option value="New Arrival">New Arrival</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Festive Special">Festive Special</option>
                <option value="Handloom">Handloom</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>

          {/* Row 4: Fabric & Care Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Fabric & Weave *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Handloom Tussar Silk"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                value={careGuide}
                onChange={(e) => setCareGuide(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 5: Fit type, Occasion, Blouse */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Occasion
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Fit Silhouette
              </label>
              <select
                value={fitType}
                onChange={(e) => setFitType(e.target.value as any)}
                disabled={department === 'sarees'}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white disabled:opacity-50"
              >
                {FIT_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {department === 'sarees' && (
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={blouseIncluded}
                    onChange={(e) => setBlouseIncluded(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span>Includes Unstitched Blouse Piece</span>
                </label>
              </div>
            )}
          </div>

          {/* Row 6: Color & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Color Name
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Maroon"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Color Swatch
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-10 h-8 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 7: Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description & Styling Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide boutique product details..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
            />
          </div>

          {/* Row 8: Sizes & Stock Allocation */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <h4 className="text-xs font-bold text-stone-900 mb-2">
              Size Stock Allocation ({DEPARTMENT_CONFIG[department].label})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {DEPARTMENT_CONFIG[department].sizes.map((s) => (
                <div key={s} className="bg-white p-2.5 rounded-lg border border-stone-200 text-center">
                  <span className="block text-xs font-bold text-stone-800 mb-1">{s}</span>
                  <input
                    type="number"
                    min="0"
                    value={sizeStocks[s] !== undefined ? sizeStocks[s] : 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSizeStocks((prev) => ({ ...prev, [s]: val }));
                    }}
                    className="w-full py-1 text-center font-mono font-semibold text-xs border border-stone-300 rounded focus:border-amber-600"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">units</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Garment')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
