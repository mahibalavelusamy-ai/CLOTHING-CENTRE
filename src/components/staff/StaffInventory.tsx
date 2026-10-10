import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StaffOutletContext } from './StaffPortalLayout';
import { ClothingItem, Size, Department } from '../../types';
import { DEPARTMENT_CONFIG, DEPARTMENTS } from '../../data/catalogConfig';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Check, 
  Filter, 
  TrendingDown,
  Layers,
  Sparkles,
  PackageCheck,
  X,
  Package
} from 'lucide-react';

export const StaffInventory: React.FC = () => {
  const { 
    inventory, 
    onUpdateItemStock 
  } = useOutletContext<StaffOutletContext>();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Local pending stock updates map: `${itemId}-${size}` => number
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  const filteredInventory = inventory.filter((item) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.fabric?.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    const matchesLowStock = !onlyLowStock || item.inStockTotal <= 10;

    return matchesSearch && matchesDept && matchesLowStock;
  });

  const handleStockChange = (itemId: string, size: Size, newStock: number) => {
    const key = `${itemId}-${size}`;
    setEditingStocks((prev) => ({ ...prev, [key]: Math.max(0, newStock) }));
  };

  const handleStockSave = async (itemId: string, size: Size, currentStock: number) => {
    const key = `${itemId}-${size}`;
    const newStock = editingStocks[key] !== undefined ? editingStocks[key] : currentStock;
    await onUpdateItemStock(itemId, size, newStock);
    
    // Trigger saved animation
    setSavedKeys((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedKeys((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 2000);

    // Clear pending state
    setEditingStocks((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Quick bulk adjustment for an item across all sizes
  const handleBulkAdd = async (item: ClothingItem, delta: number) => {
    for (const s of item.sizes) {
      await onUpdateItemStock(item.id, s.size, Math.max(0, s.stock + delta));
    }
  };

  const totalGarmentUnits = inventory.reduce((acc, item) => acc + item.inStockTotal, 0);
  const lowStockCount = inventory.filter((item) => item.inStockTotal <= 10 && item.inStockTotal > 0).length;
  const outOfStockCount = inventory.filter((item) => item.inStockTotal === 0).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6D1A33] uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Real-time Stock Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-[#1D1D1F] tracking-tight">
            Inventory & Size Matrix
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Monitor real-time size availability, replenish depleted stock, and prevent stockouts across all garment styles
          </p>
        </div>

        {/* Live inventory status chips */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-[#E8E8ED] shadow-2xs text-xs">
            <span className="text-[#6E6E73]">Total Units: </span>
            <strong className="text-[#1D1D1F] font-mono font-bold">{totalGarmentUnits}</strong>
          </div>

          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
            lowStockCount > 0 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-white border-[#E8E8ED] text-stone-600'
          }`}>
            <span>Low Stock: </span>
            <strong className="font-mono">{lowStockCount}</strong>
          </div>

          {outOfStockCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 text-xs font-semibold">
              <span>Sold Out: </span>
              <strong className="font-mono">{outOfStockCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Department Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs space-y-4">
        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DEPARTMENTS.map((d) => {
            const count = d.id === 'all' 
              ? inventory.length 
              : inventory.filter(i => i.department === d.id).length;
            const isSelected = selectedDept === d.id;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDept(d.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1D1D1F] text-white shadow-2xs font-bold'
                    : 'bg-[#F5F5F7] text-stone-600 hover:bg-[#EFEFF2] hover:text-stone-900'
                }`}
              >
                <span>{d.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Low Stock Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-stone-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by garment title, SKU, category, or fabric..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-[#6D1A33] focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-4 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                onlyLowStock
                  ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs font-bold'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${onlyLowStock ? 'text-rose-600' : 'text-stone-400'}`} />
              <span>Show Low-Stock Only (&le; 10 units)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6E6E73] pt-1 border-t border-stone-100">
          <span>
            Showing <strong className="text-[#1D1D1F]">{filteredInventory.length}</strong> of{' '}
            <strong className="text-[#1D1D1F]">{inventory.length}</strong> garment styles
          </span>
          {(filteredInventory.length !== inventory.length || searchTerm || onlyLowStock) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('all');
                setOnlyLowStock(false);
              }}
              className="text-[#6D1A33] hover:underline text-[11px] font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Inventory Cards List */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-2xl border border-[#E8E8ED] shadow-xs">
            <Boxes className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-900">No Inventory Styles Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              No garments match your current search query or active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('all');
                setOnlyLowStock(false);
              }}
              className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredInventory.map((item) => {
            const isCritical = item.inStockTotal <= 3 && item.inStockTotal > 0;
            const isLow = item.inStockTotal <= 10 && item.inStockTotal > 0;
            const isOut = item.inStockTotal === 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E8E8ED] shadow-xs hover:border-[#C9A45C]/40 hover:shadow-md transition-all p-5 space-y-4"
              >
                {/* Garment Header Card Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-14 rounded-xl bg-[#F5F5F7] border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-stone-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">{item.sku}</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded-full bg-stone-100 text-stone-600">
                          {item.department}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 leading-tight mt-0.5 truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#6E6E73] truncate mt-0.5">
                        {item.fabric} · {item.category}
                      </p>
                    </div>
                  </div>

                  {/* Stock Status & Quick Bulk Restock */}
                  <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto shrink-0">
                    {/* Bulk restock quick buttons */}
                    <button
                      type="button"
                      onClick={() => handleBulkAdd(item, 5)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Add 5 units to all sizes"
                    >
                      +5 All Sizes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkAdd(item, 10)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Add 10 units to all sizes"
                    >
                      +10 All Sizes
                    </button>

                    {/* Stock pill */}
                    <span
                      className={`font-mono font-bold text-xs px-3 py-1 rounded-full border ${
                        isOut
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isCritical
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isLow
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isOut ? 'Sold Out' : `${item.inStockTotal} units in store`}
                    </span>
                  </div>
                </div>

                {/* Per-Size Stock Matrix Controls */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2.5">
                    <span>Size Stock Breakdown</span>
                    <span>Use steppers or type amount to update instantly</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {item.sizes.map((s) => {
                      const key = `${item.id}-${s.size}`;
                      const currentVal = editingStocks[key] !== undefined ? editingStocks[key] : s.stock;
                      const hasChanged = editingStocks[key] !== undefined && editingStocks[key] !== s.stock;
                      const isSaved = Boolean(savedKeys[key]);

                      return (
                        <div
                          key={s.size}
                          className={`p-3 rounded-xl border transition-all text-center ${
                            hasChanged
                              ? 'border-[#6D1A33] bg-[#F3E8EB]/50 shadow-xs'
                              : s.stock === 0
                              ? 'border-rose-200 bg-rose-50/50'
                              : s.stock <= 3
                              ? 'border-amber-200 bg-amber-50/40'
                              : 'border-stone-200 bg-[#FBFBFC]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-2">
                            <span>{s.size}</span>
                            {s.stock === 0 ? (
                              <span className="text-[9px] text-rose-600 font-bold bg-rose-100 px-1 rounded">0</span>
                            ) : s.stock <= 3 ? (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Low stock" />
                            ) : null}
                          </div>

                          {/* Stepper row */}
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, Math.max(0, currentVal - 1))}
                              className="w-6 h-6 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={currentVal}
                              onChange={(e) =>
                                handleStockChange(item.id, s.size, parseInt(e.target.value) || 0)
                              }
                              className="w-12 text-center font-mono font-bold text-xs py-0.5 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#6D1A33] text-stone-900"
                            />

                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, currentVal + 1)}
                              className="w-6 h-6 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Quick +5 and +10 chip additions */}
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, currentVal + 5)}
                              className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-[10px] font-mono font-semibold cursor-pointer"
                              title="Add 5 units"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, currentVal + 10)}
                              className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-[10px] font-mono font-semibold cursor-pointer"
                              title="Add 10 units"
                            >
                              +10
                            </button>
                          </div>

                          {/* Save Button */}
                          {hasChanged && (
                            <button
                              type="button"
                              onClick={() => handleStockSave(item.id, s.size, s.stock)}
                              className="w-full mt-2.5 py-1 px-1.5 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save Stock</span>
                            </button>
                          )}

                          {isSaved && (
                            <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Updated</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
