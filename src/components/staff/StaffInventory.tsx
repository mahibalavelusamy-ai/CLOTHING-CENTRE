import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StaffOutletContext } from './StaffPortalLayout';
import { ClothingItem, Size } from '../../types';
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
  Sparkles
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

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

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
    
    // Clear pending state
    setEditingStocks((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const totalGarmentUnits = inventory.reduce((acc, item) => acc + item.inStockTotal, 0);
  const lowStockCount = inventory.filter((item) => item.inStockTotal <= 10).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor real-time size availability, replenish depleted stock, and prevent stockouts
          </p>
        </div>

        {/* Mini stats badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs text-xs">
            <span className="text-stone-500">Total Units: </span>
            <strong className="text-stone-900 font-mono">{totalGarmentUnits}</strong>
          </div>
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs ${
            lowStockCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-800 font-semibold' : 'bg-white border-stone-200 text-stone-700'
          }`}>
            <span>Low Stock: </span>
            <strong className="font-mono">{lowStockCount}</strong> styles
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by garment title, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white font-medium"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.filter(d => d.key !== 'all').map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 select-none">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Show Only Low-Stock Items (&le; 10 units)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/90 shadow-2xs">
            <Boxes className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800">No Inventory Records Found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search query or department filter.
            </p>
          </div>
        ) : (
          filteredInventory.map((item) => {
            const isCritical = item.inStockTotal <= 5;
            const isLow = item.inStockTotal <= 10;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-5 transition-all hover:border-stone-300"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: item.colors?.[0]?.hex || '#d6d3d1' }}
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-stone-900 leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span className="font-mono text-stone-600 font-semibold">{item.sku}</span>
                        <span>·</span>
                        <span>{item.category}</span>
                        <span>·</span>
                        <span>{item.fabric}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total units badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full border ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {item.inStockTotal} units total
                    </span>
                  </div>
                </div>

                {/* Per-size stock breakdown & controls */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Size Stock Quantities
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                    {item.sizes.map((s) => {
                      const key = `${item.id}-${s.size}`;
                      const currentVal = editingStocks[key] !== undefined ? editingStocks[key] : s.stock;
                      const hasChanged = editingStocks[key] !== undefined && editingStocks[key] !== s.stock;

                      return (
                        <div
                          key={s.size}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            hasChanged
                              ? 'border-amber-600 bg-amber-50/60'
                              : s.stock <= 2
                              ? 'border-rose-200 bg-rose-50/40'
                              : 'border-stone-200 bg-stone-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1.5">
                            <span>{s.size}</span>
                            {s.stock <= 2 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Critically low" />
                            )}
                          </div>

                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, currentVal - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center text-xs font-bold cursor-pointer"
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
                              className="w-10 text-center font-mono font-bold text-xs py-0.5 border border-stone-300 rounded bg-white focus:outline-none focus:border-amber-600"
                            />

                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, currentVal + 1)}
                              className="w-6 h-6 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center text-xs font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {hasChanged && (
                            <button
                              type="button"
                              onClick={() => handleStockSave(item.id, s.size, s.stock)}
                              className="w-full mt-2 py-1 px-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save</span>
                            </button>
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
