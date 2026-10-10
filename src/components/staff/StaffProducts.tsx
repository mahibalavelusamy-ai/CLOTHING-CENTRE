import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StaffOutletContext } from './StaffPortalLayout';
import { ProductFormModal } from './ProductFormModal';
import { ClothingItem, Department, Size } from '../../types';
import { DEPARTMENT_CONFIG, DEPARTMENTS } from '../../data/catalogConfig';
import { formatPrice } from '../../lib/format';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Check, 
  ExternalLink,
  Tag,
  DollarSign,
  Boxes,
  LayoutGrid,
  List,
  X,
  Filter,
  Sparkles
} from 'lucide-react';

export const StaffProducts: React.FC = () => {
  const { 
    inventory, 
    onAddNewItem, 
    onUpdateItem, 
    onDeleteItem,
    onUpdateItemPrice 
  } = useOutletContext<StaffOutletContext>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department>('all');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);

  // Quick price edit state
  const [quickPrice, setQuickPrice] = useState<Record<string, number>>({});
  const [priceSuccessId, setPriceSuccessId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = inventory.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.fabric?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = item.inStockTotal > 0 && item.inStockTotal <= 10;
    if (stockFilter === 'out') matchesStock = item.inStockTotal === 0;

    return matchesSearch && matchesDept && matchesCat && matchesStock;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClothingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: ClothingItem) => {
    const confirmed = window.confirm(`Permanently delete "${item.name}" (${item.sku}) from catalog?`);
    if (confirmed) {
      onDeleteItem(item.id);
    }
  };

  const handleSavePrice = async (item: ClothingItem) => {
    const newPriceVal = quickPrice[item.id];
    if (newPriceVal && newPriceVal > 0) {
      await onUpdateItemPrice(item.id, newPriceVal, item.originalPrice);
      setPriceSuccessId(item.id);
      setTimeout(() => setPriceSuccessId(null), 2000);
      setQuickPrice((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6D1A33] uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Garment Catalog & Curation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-[#1D1D1F] tracking-tight">
            Products & Collection Management
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Manage your boutique offerings, update prices, manage inventory tags, and showcase new arrivals
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="bg-white border border-[#E8E8ED] rounded-xl p-1 flex items-center shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Show Grid Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Show Spreadsheet Table"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#6D1A33]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Garment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
                onClick={() => {
                  setSelectedDept(d.id as Department);
                  setSelectedCat('All');
                }}
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

        {/* Search, Category & Stock Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-stone-100">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, fabric, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:border-[#6D1A33] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              disabled={selectedDept === 'all'}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-[#6D1A33] focus:bg-white font-medium disabled:opacity-50 transition-colors cursor-pointer"
            >
              <option value="All">All Categories {selectedDept !== 'all' ? `in ${selectedDept}` : ''}</option>
              {selectedDept !== 'all' &&
                DEPARTMENT_CONFIG[selectedDept].categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
            </select>
          </div>

          {/* Stock Availability Toggle */}
          <div className="sm:col-span-3">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:outline-none focus:border-[#6D1A33] focus:bg-white font-medium transition-colors cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="low">Low Stock (≤ 10)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Counter and reset */}
        <div className="flex items-center justify-between text-xs text-[#6E6E73] pt-1 border-t border-stone-100">
          <span>
            Displaying <strong className="text-[#1D1D1F]">{filteredProducts.length}</strong> of{' '}
            <strong className="text-[#1D1D1F]">{inventory.length}</strong> garment styles
          </span>
          {(filteredProducts.length !== inventory.length || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedCat('All');
                setStockFilter('all');
              }}
              className="text-[#6D1A33] hover:underline text-[11px] font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main View: Grid vs Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E8ED] text-center py-20 px-4 shadow-xs">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-900">No Garments Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            {inventory.length === 0
              ? 'Your boutique catalogue is currently empty. Click below to add your first piece.'
              : 'No products match your search or filter criteria.'}
          </p>
          {inventory.length === 0 ? (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Add First Garment
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedCat('All');
                setStockFilter('all');
              }}
              className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Luxury Boutique Garment Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((item) => {
            const isLow = item.inStockTotal <= 10 && item.inStockTotal > 0;
            const isOut = item.inStockTotal === 0;
            const currentPriceEdit = quickPrice[item.id] !== undefined ? quickPrice[item.id] : item.price;
            const hasPriceChanged = quickPrice[item.id] !== undefined && quickPrice[item.id] !== item.price;
            const isSaved = priceSuccessId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E8E8ED] hover:border-[#C9A45C]/50 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/5] bg-[#F5F5F7] overflow-hidden">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center font-mono text-xs"
                      style={{ backgroundColor: item.colors?.[0]?.hex ? `${item.colors[0].hex}22` : '#F5F5F7' }}
                    >
                      <Package className="w-8 h-8 mb-1.5 opacity-60" />
                      <span>{item.colors?.[0]?.name || 'Traditional'}</span>
                    </div>
                  )}

                  {/* Top Floating Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    {/* Tag badge */}
                    {item.tags?.[0] ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-[#6D1A33] border border-[#6D1A33]/20 shadow-xs backdrop-blur-xs">
                        {item.tags[0]}
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* Stock status pill */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs ${
                      isOut
                        ? 'bg-rose-600 text-white'
                        : isLow
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isOut ? 'Sold Out' : `${item.inStockTotal} left`}
                    </span>
                  </div>

                  {/* Quick Edit Overlay Button */}
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="px-3.5 py-2 bg-white text-[#1D1D1F] font-bold text-xs rounded-xl shadow-lg hover:bg-stone-100 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#6D1A33]" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-2 bg-white text-rose-600 rounded-xl shadow-lg hover:bg-rose-50 transition-transform active:scale-95 cursor-pointer"
                      title="Delete Garment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#6E6E73] font-mono mb-1">
                      <span>{item.sku}</span>
                      <span className="capitalize">{item.department}</span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-xs leading-snug line-clamp-1 group-hover:text-[#6D1A33] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#6E6E73] line-clamp-1 mt-0.5">
                      {item.fabric} · {item.category}
                    </p>
                  </div>

                  {/* Color dots & size counts */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                    <div className="flex items-center gap-1">
                      {item.colors?.slice(0, 3).map((col, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs"
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>

                    <span className="text-stone-500 font-mono text-[10px]">
                      {item.sizes.length} size{item.sizes.length !== 1 ? 's' : ''} available
                    </span>
                  </div>

                  {/* Price row with in-place adjustment */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-[#1D1D1F] font-mono">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-[10px] text-stone-400 line-through font-mono">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Price inline edit */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400 font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={currentPriceEdit}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setQuickPrice((prev) => ({ ...prev, [item.id]: val }));
                        }}
                        className={`w-16 py-0.5 px-1 font-mono text-xs border rounded-lg focus:outline-none text-right ${
                          hasPriceChanged
                            ? 'border-[#6D1A33] bg-[#F3E8EB] text-[#6D1A33] font-bold'
                            : 'border-stone-200 bg-stone-50 text-stone-800'
                        }`}
                      />
                      {hasPriceChanged && (
                        <button
                          type="button"
                          onClick={() => handleSavePrice(item)}
                          className="p-1 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-md transition-colors cursor-pointer"
                          title="Save Price"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      {isSaved && (
                        <span className="text-[10px] text-emerald-600 font-bold animate-pulse">
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Spreadsheet Table View */
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F7] border-b border-[#E8E8ED] text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Garment & SKU</th>
                  <th className="py-3 px-4">Department & Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">Fabric</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((item) => {
                  const isLow = item.inStockTotal <= 10 && item.inStockTotal > 0;
                  const isOut = item.inStockTotal === 0;
                  const currentPriceEdit = quickPrice[item.id] !== undefined ? quickPrice[item.id] : item.price;
                  const hasPriceChanged = quickPrice[item.id] !== undefined && quickPrice[item.id] !== item.price;
                  const isSaved = priceSuccessId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-lg bg-[#F5F5F7] border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {item.images?.[0] ? (
                              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 leading-tight">{item.name}</p>
                            <p className="text-[10px] font-mono text-stone-400 mt-0.5">{item.sku}</p>
                            {item.tags?.[0] && (
                              <span className="inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                {item.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department & Category */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-800 capitalize">{item.department}</p>
                        <p className="text-[11px] text-stone-500">{item.category}</p>
                      </td>

                      {/* Price Edit */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-400 font-mono">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={currentPriceEdit}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setQuickPrice((prev) => ({ ...prev, [item.id]: val }));
                            }}
                            className={`w-20 py-1 px-1.5 font-mono font-bold text-xs border rounded-lg focus:outline-none ${
                              hasPriceChanged
                                ? 'border-[#6D1A33] bg-[#F3E8EB] text-[#6D1A33]'
                                : 'border-stone-200 bg-stone-50 text-stone-900'
                            }`}
                          />
                          {hasPriceChanged && (
                            <button
                              type="button"
                              onClick={() => handleSavePrice(item)}
                              className="p-1 bg-[#6D1A33] hover:bg-[#561428] text-white rounded-md shadow-2xs transition-colors cursor-pointer"
                              title="Save Price"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isSaved && (
                            <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>
                          )}
                        </div>
                        {item.originalPrice && (
                          <span className="text-[10px] text-stone-400 line-through font-mono mt-0.5 block">
                            MRP: {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock Units */}
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          isOut
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isLow
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {item.inStockTotal} units
                        </span>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Across {item.sizes.length} size{item.sizes.length !== 1 ? 's' : ''}
                        </p>
                      </td>

                      {/* Fabric */}
                      <td className="py-3 px-4 text-stone-600">
                        <span className="font-medium text-stone-800">{item.fabric || '—'}</span>
                        {item.blouseIncluded && (
                          <p className="text-[10px] text-[#6D1A33] font-semibold">+ Blouse Included</p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-[#6D1A33] hover:bg-[#F3E8EB] text-stone-600 hover:text-[#6D1A33] transition-colors cursor-pointer bg-white"
                            title="Edit Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-400 hover:bg-rose-50 text-stone-500 hover:text-rose-700 transition-colors cursor-pointer bg-white"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add or Edit Product */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (item) => {
          if (editingItem) {
            await onUpdateItem(item);
          } else {
            await onAddNewItem(item);
          }
        }}
        initialItem={editingItem}
      />
    </div>
  );
};
