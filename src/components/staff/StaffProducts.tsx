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
  Boxes
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);

  // Quick price edit state
  const [quickPrice, setQuickPrice] = useState<Record<string, number>>({});

  // Filter products
  const filteredProducts = inventory.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fabric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;

    return matchesSearch && matchesDept && matchesCat;
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
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${item.name}" (${item.sku})?`);
    if (confirmed) {
      onDeleteItem(item.id);
    }
  };

  const handleSavePrice = (item: ClothingItem) => {
    const newPriceVal = quickPrice[item.id];
    if (newPriceVal && newPriceVal > 0) {
      onUpdateItemPrice(item.id, newPriceVal, item.originalPrice);
      setQuickPrice((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-display text-text">
            Products & Catalogue Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your boutique offerings, edit descriptions, adjust pricing, and add new arrivals
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink hover:bg-pink-strong text-white rounded-xl text-xs font-bold shadow-md shadow-pink/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Garment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, fabric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-2 border border-border text-text placeholder-text-muted/60 rounded-xl focus:outline-none focus:border-pink transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value as Department);
                setSelectedCat('All');
              }}
              className="w-full px-3 py-2 text-xs bg-surface-2 border border-border text-text rounded-xl focus:outline-none focus:border-pink font-medium"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.filter(d => d.id !== 'all').map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              disabled={selectedDept === 'all'}
              className="w-full px-3 py-2 text-xs bg-surface-2 border border-border text-text rounded-xl focus:outline-none focus:border-pink font-medium disabled:opacity-50"
            >
              <option value="All">All Categories</option>
              {selectedDept !== 'all' &&
                DEPARTMENT_CONFIG[selectedDept].categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted pt-1">
          <span>
            Showing <strong className="text-text">{filteredProducts.length}</strong> of{' '}
            <strong className="text-text">{inventory.length}</strong> styles
          </span>
          {filteredProducts.length !== inventory.length && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedCat('All');
              }}
              className="text-pink hover:underline text-[11px] font-medium cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-2xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Package className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text">No Garments Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 mb-4">
              {inventory.length === 0
                ? 'Your boutique catalogue is currently empty. Click below to add your first piece.'
                : 'No products match your search or filter criteria.'}
            </p>
            {inventory.length === 0 ? (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-pink hover:bg-pink-strong text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
              >
                Add First Garment
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Style & Details</th>
                  <th className="py-3 px-4">Department & Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Fabric</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map((item) => {
                  const isLow = item.inStockTotal <= 10;
                  const currentPriceEdit = quickPrice[item.id] !== undefined ? quickPrice[item.id] : item.price;
                  const hasPriceChanged = quickPrice[item.id] !== undefined && quickPrice[item.id] !== item.price;

                  return (
                    <tr key={item.id} className="hover:bg-surface-2/60 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
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
                                className="w-full h-full flex items-center justify-center font-mono text-[10px] font-bold text-text-muted"
                                style={{ backgroundColor: item.colors?.[0]?.hex || '#2A2A2A' }}
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-text leading-tight">{item.name}</p>
                            <p className="text-[10px] font-mono text-text-muted mt-0.5">{item.sku}</p>
                            {item.tags?.[0] && (
                              <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-pink/10 text-pink border border-pink/30">
                                {item.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department & Category */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-text">
                          {DEPARTMENT_CONFIG[item.department as Exclude<Department, 'all'>]?.label || item.department}
                        </p>
                        <p className="text-[11px] text-text-muted">{item.category}</p>
                      </td>

                      {/* In-place Price edit */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-mono">₹</span>
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
                                ? 'border-pink bg-pink/15 text-pink'
                                : 'border-border bg-surface-2 text-text'
                            }`}
                          />
                          {hasPriceChanged && (
                            <button
                              onClick={() => handleSavePrice(item)}
                              className="p-1 bg-pink hover:bg-pink-strong text-white rounded-md shadow-2xs transition-colors cursor-pointer"
                              title="Save new price"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {item.originalPrice && (
                          <span className="text-[10px] text-text-muted line-through font-mono mt-0.5 block">
                            MRP: {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock units - Keep status colors */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                              isLow
                                ? 'bg-amber-950/50 text-amber-300 border border-amber-800/80'
                                : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/80'
                            }`}
                          >
                            {item.inStockTotal} units
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">
                          Across {item.sizes.length} size{item.sizes.length !== 1 ? 's' : ''}
                        </p>
                      </td>

                      {/* Fabric */}
                      <td className="py-3.5 px-4 text-text-muted">
                        <span className="font-medium text-text">{item.fabric || '—'}</span>
                        {item.blouseIncluded && (
                          <p className="text-[10px] text-pink font-semibold">+ Blouse Piece</p>
                        )}
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg border border-border hover:border-pink hover:bg-pink/10 text-text-muted hover:text-pink transition-colors cursor-pointer bg-surface-2"
                            title="Edit Garment Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg border border-border hover:border-rose-400 hover:bg-rose-950/40 text-text-muted hover:text-rose-400 transition-colors cursor-pointer bg-surface-2"
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
        )}
      </div>

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
