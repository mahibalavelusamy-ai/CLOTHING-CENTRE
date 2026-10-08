import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  Package, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  Save, 
  Receipt,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { ClothingItem, CustomerOrder, Department, Size } from '../types';
import { DEPARTMENT_CONFIG, FIT_TYPES, OCCASIONS } from '../data/catalogConfig';
import { formatPrice } from '../lib/format';

interface StoreManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: ClothingItem[];
  orders: CustomerOrder[];
  onUpdateItemStock: (itemId: string, size: Size, newStock: number) => void;
  onUpdateItemPrice: (itemId: string, newPrice: number) => void;
  onAddNewItem: (item: ClothingItem) => void;
  onUpdateOrderStatus: (orderId: string, status: CustomerOrder['status']) => void;
}

export const StoreManagerModal: React.FC<StoreManagerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  orders,
  onUpdateItemStock,
  onUpdateItemPrice,
  onAddNewItem,
  onUpdateOrderStatus
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'add_item'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockEditState, setStockEditState] = useState<Record<string, number>>({});
  const [priceEditState, setPriceEditState] = useState<Record<string, number>>({});

  // New Item Form State
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState<'sarees' | 'kurtis' | 'kids'>('sarees');
  const [newCategory, setNewCategory] = useState(DEPARTMENT_CONFIG.sarees.categories[0]);
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newFabric, setNewFabric] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColorName, setNewColorName] = useState('Crimson Red');
  const [newColorHex, setNewColorHex] = useState('#8B0000');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFitType, setNewFitType] = useState<ClothingItem['fitType']>('Regular Fit');
  const [newOccasion, setNewOccasion] = useState<ClothingItem['occasion']>('Festive');
  const [newBlouseIncluded, setNewBlouseIncluded] = useState<boolean>(true);

  // Dynamic stock inputs per size for the add item form
  const [itemStocks, setItemStocks] = useState<Record<string, number>>({ 'Free Size': 12 });

  // When department changes, sync category & default sizes
  useEffect(() => {
    const defaultCat = DEPARTMENT_CONFIG[newDepartment].categories[0];
    setNewCategory(defaultCat);

    const initialStocks: Record<string, number> = {};
    if (newDepartment === 'sarees') {
      initialStocks['Free Size'] = 10;
      setNewBlouseIncluded(true);
    } else {
      DEPARTMENT_CONFIG[newDepartment].sizes.forEach(s => {
        initialStocks[s] = 6;
      });
      setNewBlouseIncluded(false);
    }
    setItemStocks(initialStocks);
  }, [newDepartment]);

  // Metrics
  const totalGarmentUnits = inventory.reduce((acc, item) => acc + item.inStockTotal, 0);
  const lowStockItems = inventory.filter(item => item.inStockTotal <= 10);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockSave = (itemId: string, size: Size, currentStock: number) => {
    const key = `${itemId}-${size}`;
    const newStock = stockEditState[key] !== undefined ? stockEditState[key] : currentStock;
    onUpdateItemStock(itemId, size, Math.max(0, newStock));
  };

  const handlePriceSave = (itemId: string, currentPrice: number) => {
    const newPriceVal = priceEditState[itemId] !== undefined ? priceEditState[itemId] : currentPrice;
    if (newPriceVal > 0) {
      onUpdateItemPrice(itemId, newPriceVal);
    }
  };

  const handleAddNewGarmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newFabric) {
      alert('Please fill in garment name, price, and fabric.');
      return;
    }

    const priceNum = parseFloat(newPrice);
    const origPriceNum = newOriginalPrice ? parseFloat(newOriginalPrice) : undefined;
    const discount = origPriceNum && origPriceNum > priceNum 
      ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) 
      : undefined;

    const sizesList = DEPARTMENT_CONFIG[newDepartment].sizes.map(sizeName => ({
      size: sizeName,
      stock: itemStocks[sizeName] ?? 5,
    }));
    const totalUnits = sizesList.reduce((acc, s) => acc + s.stock, 0);

    const newItem: ClothingItem = {
      id: `ob-${Date.now().toString().slice(-4)}`,
      sku: `OB-${newDepartment.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      department: newDepartment,
      category: newCategory,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent: discount,
      rating: 5.0,
      reviewCount: 1,
      colors: [
        { name: newColorName || 'Traditional Zari', hex: newColorHex }
      ],
      sizes: sizesList,
      images: newImageUrl.trim() ? [newImageUrl.trim()] : [],
      description: newDescription || 'Artisan handcrafted collection piece from Our Boutique.',
      fabric: newFabric,
      careGuide: newDepartment === 'sarees' ? 'Dry clean only to maintain gold zari & silk luster.' : 'Gentle cold wash, shade dry.',
      fitType: newDepartment === 'sarees' ? undefined : newFitType,
      occasion: newOccasion,
      blouseIncluded: newDepartment === 'sarees' ? newBlouseIncluded : undefined,
      tags: ['New Arrival'],
      inStockTotal: totalUnits,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`
    };

    onAddNewItem(newItem);
    alert('New Garment published to Boutique inventory!');
    setActiveTab('inventory');
    // reset form
    setNewName('');
    setNewPrice('');
    setNewOriginalPrice('');
    setNewFabric('');
    setNewDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-display text-white">
                Boutique Staff & Inventory Portal
              </h2>
              <p className="text-xs text-stone-400">
                Manage stock, update prices, view orders, and add new arrivals
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

        {/* Operational KPI summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-stone-50 border-b border-stone-200">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Total Inventory</span>
              <p className="text-xl font-bold text-stone-900 font-mono mt-0.5">{totalGarmentUnits} units</p>
            </div>
            <Package className="w-6 h-6 text-stone-400" />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Low Stock Items</span>
              <p className={`text-xl font-bold font-mono mt-0.5 ${lowStockItems.length > 0 ? 'text-amber-700' : 'text-stone-900'}`}>
                {lowStockItems.length} styles
              </p>
            </div>
            <AlertTriangle className={`w-6 h-6 ${lowStockItems.length > 0 ? 'text-amber-500' : 'text-stone-400'}`} />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Revenue Logged</span>
              <p className="text-xl font-bold text-stone-900 font-mono mt-0.5">{formatPrice(totalRevenue)}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-stone-200 bg-white">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Inventory & Stock Control ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('add_item')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add_item'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Arrival</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: INVENTORY CONTROL */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter styles, SKU, categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
                <span className="text-xs text-stone-500">
                  Showing {filteredInventory.length} garments
                </span>
              </div>

              {filteredInventory.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No garments match your search filter or catalog is empty.
                </div>
              ) : (
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-stone-700 border-b border-stone-200 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Garment</th>
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Sizes & Stock Units</th>
                          <th className="py-2.5 px-3 text-right">Total Units</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {filteredInventory.map((item) => (
                          <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.images[0]}
                                  alt=""
                                  className="w-9 h-11 object-cover rounded bg-stone-100 border border-stone-200"
                                />
                                <div>
                                  <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                                  <p className="text-[10px] text-stone-400 font-mono">SKU: {item.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 uppercase text-[11px] font-semibold text-stone-600">
                              {item.department}
                            </td>
                            <td className="py-2.5 px-3 text-stone-700">
                              {item.category}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="1"
                                  defaultValue={item.price}
                                  onChange={(e) => setPriceEditState({ ...priceEditState, [item.id]: Number(e.target.value) })}
                                  className="w-16 px-1.5 py-0.5 border border-stone-300 rounded font-mono text-xs"
                                />
                                <button
                                  onClick={() => handlePriceSave(item.id, item.price)}
                                  className="text-[10px] bg-stone-800 hover:bg-stone-900 text-white px-1.5 py-0.5 rounded cursor-pointer"
                                  title="Save price"
                                >
                                  Save
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1.5 max-w-xs">
                                {item.sizes.map((s) => {
                                  const key = `${item.id}-${s.size}`;
                                  return (
                                    <div key={s.size} className="flex items-center gap-1 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-[11px]">
                                      <span className="font-semibold text-stone-700">{s.size}:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        defaultValue={s.stock}
                                        onChange={(e) => setStockEditState({ ...stockEditState, [key]: Number(e.target.value) })}
                                        className="w-10 px-1 py-0.2 text-[11px] bg-white border border-stone-300 rounded text-center font-mono"
                                      />
                                      <button
                                        onClick={() => handleStockSave(item.id, s.size, s.stock)}
                                        className="text-stone-500 hover:text-amber-800 p-0.5 cursor-pointer"
                                        title="Save stock"
                                      >
                                        <Save className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                              <span className={`px-2 py-0.5 rounded text-xs ${item.inStockTotal <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800'}`}>
                                {item.inStockTotal}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOMER ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No orders placed yet. Customer orders will appear here automatically.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-stone-900">#{order.id}</span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-100 text-amber-900">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stone-800">
                          {order.customer.name} ({order.customer.phone})
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {order.customer.deliveryType === 'store_pickup' 
                            ? `Boutique Pickup • Slot: ${order.customer.pickupSlot}`
                            : `Express Delivery: ${order.customer.shippingAddress}`}
                        </p>
                        <div className="text-[11px] text-stone-600 font-medium">
                          {order.items.map(i => `${i.item.name} (${i.selectedSize} x${i.quantity})`).join(', ')}
                        </div>
                        {order.customer.notes && (
                          <p className="text-[10px] text-amber-800 italic">
                            Alteration note: "{order.customer.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto">
                        <div className="text-right">
                          <span className="text-xs text-stone-500 block">Total Paid:</span>
                          <span className="text-sm font-bold text-stone-900 font-mono">{formatPrice(order.totalAmount)}</span>
                          <span className="text-[10px] text-stone-400 block uppercase">via {order.paymentMethod}</span>
                        </div>

                        {/* Status switcher */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Ready for Pickup')}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer"
                          >
                            Ready for Pickup
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW ARRIVAL */}
          {activeTab === 'add_item' && (
            <form onSubmit={handleAddNewGarmentSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>New Boutique Garment Entry:</strong> Choosing a department configures allowed categories, sizes, and styling options.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Garment Style Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Kanchipuram Brocade Silk Saree with Zari Pallu"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Department *</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as 'sarees' | 'kurtis' | 'kids')}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  >
                    <option value="sarees">Sarees</option>
                    <option value="kurtis">Kurtis & Chudidars</option>
                    <option value="kids">Kidswear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  >
                    {DEPARTMENT_CONFIG[newDepartment].categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Original Price in Rupees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 2499"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Original Price (₹) (Optional)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 3499"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
              </div>

              {/* Fabric & Material */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Fabric & Weave *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Mulberry Silk with Korvai Weave"
                  value={newFabric}
                  onChange={(e) => setNewFabric(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Silhouette / Fit Type (HIDDEN for Sarees) */}
              {newDepartment !== 'sarees' && (
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Silhouette & Fit Type</label>
                  <select
                    value={newFitType}
                    onChange={(e) => setNewFitType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  >
                    {FIT_TYPES.map(fit => (
                      <option key={fit} value={fit}>{fit}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Occasion & Blouse Included */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Occasion</label>
                  <select
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  >
                    {OCCASIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                {newDepartment === 'sarees' && (
                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <input
                        type="checkbox"
                        checked={newBlouseIncluded}
                        onChange={(e) => setNewBlouseIncluded(e.target.checked)}
                        className="w-4 h-4 text-amber-600 accent-amber-600 rounded"
                      />
                      <span className="text-xs font-semibold text-stone-800">
                        Blouse piece included (0.8m unstitched)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Sizes and Stock Inputs: Driven by department */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  {newDepartment === 'sarees' ? 'Stock Quantity (Free Size)' : 'Size Stock Allocation'}
                </label>
                {newDepartment === 'sarees' ? (
                  <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 max-w-xs">
                    <span className="text-xs font-semibold text-stone-700">Free Size Stock:</span>
                    <input
                      type="number"
                      min={0}
                      value={itemStocks['Free Size'] ?? 10}
                      onChange={(e) => setItemStocks({ 'Free Size': Number(e.target.value) })}
                      className="w-20 px-2 py-1 text-xs bg-white border border-stone-300 rounded font-mono"
                    />
                    <span className="text-[11px] text-stone-400">units</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DEPARTMENT_CONFIG[newDepartment].sizes.map(sizeName => (
                      <div key={sizeName} className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-center">
                        <span className="block text-[11px] font-bold text-stone-700">{sizeName}</span>
                        <input
                          type="number"
                          min={0}
                          value={itemStocks[sizeName] ?? 5}
                          onChange={(e) => setItemStocks({ ...itemStocks, [sizeName]: Number(e.target.value) })}
                          className="w-full mt-1 px-1 py-0.5 text-center text-xs bg-white border border-stone-300 rounded font-mono"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Swatch & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Primary Color Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Rani Pink"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Color Swatch Hex</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-10 h-8 rounded border border-stone-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Photo URL (Optional web URL)</label>
                <input
                  type="url"
                  placeholder="Leave empty for neutral product block or enter image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Description & Styling Notes</label>
                <textarea
                  rows={2}
                  placeholder="Artisan weaving notes, border details, draping tips..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Publish Garment to Boutique Inventory
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
