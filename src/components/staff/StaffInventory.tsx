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
          <h1 className="text-xl sm:text-2xl font-bold font-serif-display text-text">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Monitor real-time size availability, replenish depleted stock, and prevent stockouts
          </p>
        </div>

        {/* Mini stats badges */}
        <div className="flex items-center gap-3">
          <div className="bg-surface px-3.5 py-1.5 rounded-xl border border-border shadow-2xs text-xs">
            <span className="text-text-muted">Total Units: </span>
            <strong className="text-text font-mono">{totalGarmentUnits}</strong>
          </div>
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs ${
            lowStockCount > 0 ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 font-semibold' : 'bg-surface border-border text-text-muted'
          }`}>
            <span>Low Stock: </span>
            <strong className="font-mono">{lowStockCount}</strong> styles
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by garment title, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-2 border border-border text-text placeholder-text-muted/60 rounded-xl focus:outline-none focus:border-pink"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-2 border border-border text-text rounded-xl focus:outline-none focus:border-pink font-medium"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.filter(d => d.id !== 'all').map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text select-none">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="w-4 h-4 text-pink rounded border-border focus:ring-pink cursor-pointer accent-pink"
              />
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Show Only Low-Stock Items (&le; 10 units)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <div className="bg-surface p-12 text-center rounded-2xl border border-border shadow-2xs">
            <Boxes className="w-10 h-10 text-text-muted/50 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-text">No Inventory Records Found</h3>
            <p className="text-xs text-text-muted mt-1">
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
                className="bg-surface rounded-2xl border border-border shadow-2xs p-5 transition-all hover:border-pink/40"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: item.colors?.[0]?.hex || '#2A2A2A' }}
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-text leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted mt-0.5">
                        <span className="font-mono text-pink-tint font-semibold">{item.sku}</span>
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
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                          : isLow
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                      }`}
                    >
                      {item.inStockTotal} units total
                    </span>
                  </div>
                </div>

                {/* Per-size stock breakdown & controls */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
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
                              ? 'border-pink bg-pink/10'
                              : s.stock <= 2
                              ? 'border-rose-900/60 bg-rose-950/30'
                              : 'border-border bg-surface-2'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-text mb-1.5">
                            <span>{s.size}</span>
                            {s.stock <= 2 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Critically low" />
                            )}
                          </div>

                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, currentVal - 1)}
                              className="w-6 h-6 rounded-md bg-surface border border-border text-text hover:bg-surface-2 hover:border-pink flex items-center justify-center text-xs font-bold cursor-pointer"
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
                              className="w-10 text-center font-mono font-bold text-xs py-0.5 border border-border rounded bg-surface text-text focus:outline-none focus:border-pink"
                            />

                            <button
                              type="button"
                              onClick={() => handleStockChange(item.id, s.size, currentVal + 1)}
                              className="w-6 h-6 rounded-md bg-surface border border-border text-text hover:bg-surface-2 hover:border-pink flex items-center justify-center text-xs font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {hasChanged && (
                            <button
                              type="button"
                              onClick={() => handleStockSave(item.id, s.size, s.stock)}
                              className="w-full mt-2 py-1 px-1.5 bg-pink hover:bg-pink-strong text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
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
