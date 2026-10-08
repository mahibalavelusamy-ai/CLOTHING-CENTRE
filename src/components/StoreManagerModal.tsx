import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Package, 
  AlertTriangle, 
  PlusCircle, 
  Check, 
  Clock, 
  Search, 
  Save, 
  Receipt,
  TrendingUp,
  Tag
} from 'lucide-react';
import { ClothingItem, CustomerOrder, Department, Size } from '../types';

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

  // New Item Form State
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState<Department>('women');
  const [newCategory, setNewCategory] = useState('Dresses & Gowns');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newFabric, setNewFabric] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1c1917');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Metrics
  const totalGarmentUnits = inventory.reduce((acc, item) => acc + item.inStockTotal, 0);
  const lowStockItems = inventory.filter(item => item.inStockTotal <= 15);
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

    const newItem: ClothingItem = {
      id: `cc-${Date.now().toString().slice(-4)}`,
      sku: `CC-${newDepartment.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      department: newDepartment,
      category: newCategory,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent: discount,
      rating: 5.0,
      reviewCount: 1,
      colors: [
        { name: newColorName || 'Classic Noir', hex: newColorHex }
      ],
      sizes: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 6 },
        { size: 'XL', stock: 3 }
      ],
      images: [
        newImageUrl.trim() || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
      ],
      description: newDescription || 'Premium handcrafted apparel selected for the Royal Heritage Clothing Centre collection.',
      fabric: newFabric,
      careGuide: 'Dry clean or gentle hand wash.',
      fitType: 'Regular Fit',
      tags: ['New Arrival'],
      inStockTotal: 22,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`
    };

    onAddNewItem(newItem);
    alert('New Garment added to Clothing Centre catalogue and inventory!');
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif-display text-white">
                  Clothing Centre Portal
                </h2>
                <span className="bg-amber-600 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                  Staff & Counter View
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Inventory Stocking, Size Allocation & Counter Fulfilment
              </p>
            </div>
          </div>

          <button
            id="close-store-manager-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-stone-50 border-b border-stone-200">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Total Styles</span>
              <Package className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-xl font-bold text-stone-900 mt-1">{inventory.length}</p>
            <p className="text-[10px] text-stone-500">Active catalog items</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Inventory In-Stock</span>
              <Tag className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-xl font-bold text-stone-900 mt-1">{totalGarmentUnits}</p>
            <p className="text-[10px] text-stone-500">Units on store racks</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-xl font-bold text-rose-600 mt-1">{lowStockItems.length}</p>
            <p className="text-[10px] text-stone-500">Need replenishment</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Orders Placed</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-stone-900 mt-1">{orders.length}</p>
            <p className="text-[10px] text-emerald-700 font-semibold">${totalRevenue.toFixed(2)} sales</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-stone-200 bg-white">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Garment Stock & Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Customer Counter Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add_item')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add_item'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Stock New Arrival Garment</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Garment Name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="text-xs text-stone-500">
                  Showing {filteredInventory.length} of {inventory.length} pieces
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Garment Details</th>
                      <th className="py-2.5 px-3">Dept / Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Size Stock Quantities</th>
                      <th className="py-2.5 px-3 text-right">Total Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/80">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images[0]}
                              alt=""
                              className="w-10 h-12 rounded object-cover border border-stone-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-stone-500 font-mono">SKU: {item.sku}</p>
                              <p className="text-[10px] text-stone-400">Barcode: {item.barcode}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-stone-600">
                          <span className="capitalize font-medium text-stone-800">{item.department}</span>
                          <span className="block text-[11px] text-stone-400">{item.category}</span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900">${item.price.toFixed(2)}</span>
                            {item.discountPercent && (
                              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1 rounded">
                                -{item.discountPercent}%
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.sizes.map((s) => {
                              const key = `${item.id}-${s.size}`;
                              const currentVal = stockEditState[key] !== undefined ? stockEditState[key] : s.stock;
                              return (
                                <div
                                  key={s.size}
                                  className={`flex items-center border rounded px-1.5 py-0.5 text-[11px] ${
                                    s.stock <= 2
                                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                                      : 'border-stone-200 bg-white text-stone-800'
                                  }`}
                                >
                                  <span className="font-bold mr-1">{s.size}:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setStockEditState(prev => ({ ...prev, [key]: val }));
                                    }}
                                    className="w-8 text-center bg-transparent border-b border-stone-300 focus:outline-none focus:border-amber-600 text-xs"
                                  />
                                  {stockEditState[key] !== undefined && stockEditState[key] !== s.stock && (
                                    <button
                                      onClick={() => handleStockSave(item.id, s.size, s.stock)}
                                      className="ml-1 p-0.5 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                      title="Save stock update"
                                    >
                                      <Save className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              item.inStockTotal <= 10
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {item.inStockTotal} pcs
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER ORDERS & FULFILMENT */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <Receipt className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p className="font-semibold text-stone-700 text-sm">No orders registered yet</p>
                  <p className="text-xs text-stone-400">Customer orders placed through the app will show up here for store fulfilment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-stone-200 rounded-xl p-4 bg-stone-50 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            #{order.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              order.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'Ready for Pickup'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stone-800">
                          {order.customer.name} ({order.customer.phone})
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {order.customer.deliveryType === 'store_pickup' 
                            ? `Centre Pickup • Slot: ${order.customer.pickupSlot}`
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
                          <span className="text-sm font-bold text-stone-900">${order.totalAmount.toFixed(2)}</span>
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
                            Mark Collected
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
                <strong>New Garment Stock Entry:</strong> Fill in the product details to add new stock to the Clothing Centre retail racks.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Garment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Italian Wool Double-Breasted Peacoat"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kids">Kids</option>
                    <option value="ethnic">Traditional & Festive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  >
                    <option value="Dresses & Gowns">Dresses & Gowns</option>
                    <option value="Shirts & Tops">Shirts & Tops</option>
                    <option value="Trousers & Jeans">Trousers & Jeans</option>
                    <option value="Traditional & Festive">Traditional & Festive</option>
                    <option value="Jackets & Outerwear">Jackets & Outerwear</option>
                    <option value="Knitwear">Knitwear</option>
                    <option value="Kids Wear">Kids Wear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 120"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Original Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Fabric & Material Composition *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100% Merino Wool, 12-gauge knit"
                  value={newFabric}
                  onChange={(e) => setNewFabric(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Primary Color Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Charcoal Navy"
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
                <label className="block text-xs font-bold text-stone-800 mb-1">Product Photo URL (Unsplash or direct image)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Garment details, styling advice, craftsmanship..."
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
                  Publish Garment to Store Inventory
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
