import { useState, useEffect, useMemo } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { HeroSlideshow } from './components/HeroSlideshow';
import { CategoryTileGrid } from './components/CategoryTileGrid';
import { TopSellingStrip } from './components/TopSellingStrip';
import { CategoryRail } from './components/CategoryRail';
import { FilterDrawer } from './components/FilterDrawer';
import { BrandStoryBlock } from './components/BrandStoryBlock';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { StoreManagerModal } from './components/StoreManagerModal';
import { OrdersReceiptModal } from './components/OrdersReceiptModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { INITIAL_CLOTHING_ITEMS, STORE_CENTRE_INFO } from './data/clothingData';
import { DEPARTMENTS, DEPARTMENT_CONFIG, ALL_CATEGORIES } from './data/catalogConfig';
import { formatPrice } from './lib/format';
import { 
  ClothingItem, 
  CartItem, 
  CustomerOrder, 
  Department, 
  FilterState, 
  Size 
} from './types';
import { 
  testFirestoreConnection,
  subscribeToClothingItems,
  subscribeToOrders,
  seedInitialFirestoreData,
  addOrUpdateClothingItemInFirestore,
  updateGarmentStockInFirestore,
  updateGarmentPriceInFirestore,
  createOrderInFirestore,
  updateOrderStatusInFirestore
} from './lib/firebase';
import { 
  SlidersHorizontal, 
  ShoppingBag, 
  Check, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Scissors,
  Sparkles,
  Search,
  Truck,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

const INITIAL_SEED_ORDERS: CustomerOrder[] = [];

export default function App() {
  // Inventory state with LocalStorage persistence
  const [inventory, setInventory] = useState<ClothingItem[]>(() => {
    try {
      const saved = localStorage.getItem('clothing_centre_inventory-v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CLOTHING_ITEMS;
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('clothing_centre_cart-v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState<ClothingItem[]>(() => {
    try {
      const saved = localStorage.getItem('clothing_centre_wishlist-v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('clothing_centre_orders-v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SEED_ORDERS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    department: 'all',
    category: 'All',
    sizes: [],
    priceRange: [0, 25000],
    searchQuery: '',
    sortBy: 'featured',
    inStockOnly: false
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [featuredTab, setFeaturedTab] = useState<Department>('all');

  // Modals & Drawers
  const [quickViewItem, setQuickViewItem] = useState<ClothingItem | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Real-time Firestore Synchronization
  useEffect(() => {
    let isMounted = true;

    // 1. Verify Firestore Connection & Seed initial catalog if empty
    testFirestoreConnection()
      .then(() => {
        if (!isMounted) return;
        setIsRealtimeConnected(true);
        return seedInitialFirestoreData(INITIAL_CLOTHING_ITEMS, INITIAL_SEED_ORDERS);
      })
      .catch((err) => {
        console.warn('Initial Firestore connection check notice:', err);
      });

    // 2. Real-time Clothing Items subscription
    const unsubscribeItems = subscribeToClothingItems(
      (realtimeItems) => {
        if (!isMounted) return;
        if (realtimeItems && realtimeItems.length > 0) {
          setInventory(realtimeItems);
        }
        setIsRealtimeConnected(true);
      },
      (err) => {
        console.warn('Realtime clothing items subscription warning:', err);
      }
    );

    // 3. Real-time Customer Orders subscription
    const unsubscribeOrders = subscribeToOrders(
      (realtimeOrders) => {
        if (!isMounted) return;
        if (realtimeOrders && realtimeOrders.length > 0) {
          setOrders(realtimeOrders);
        }
        setIsRealtimeConnected(true);
      },
      (err) => {
        console.warn('Realtime orders subscription warning:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribeItems();
      unsubscribeOrders();
    };
  }, []);

  // Local fallback cache sync
  useEffect(() => {
    localStorage.setItem('clothing_centre_inventory-v2', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('clothing_centre_cart-v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('clothing_centre_wishlist-v2', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('clothing_centre_orders-v2', JSON.stringify(orders));
  }, [orders]);

  // Derived calculations
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + item.item.price * item.quantity, 0), [cart]);
  const lowStockCount = useMemo(() => inventory.filter(i => i.inStockTotal <= 10).length, [inventory]);

  const maxPriceInCatalog = useMemo(() => {
    return Math.max(...inventory.map(i => i.price), 15000);
  }, [inventory]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    if (filters.department === 'all') {
      ALL_CATEGORIES.forEach(c => set.add(c));
    } else {
      DEPARTMENT_CONFIG[filters.department]?.categories.forEach(c => set.add(c));
    }
    inventory.forEach(i => {
      if (filters.department === 'all' || i.department === filters.department) {
        set.add(i.category);
      }
    });
    return ['All', ...Array.from(set)];
  }, [inventory, filters.department]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const relevantItems = filters.department === 'all'
      ? inventory
      : inventory.filter(i => i.department === filters.department);

    counts['All'] = relevantItems.length;
    relevantItems.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [inventory, filters.department]);

  const departmentCounts = useMemo(() => {
    const counts: Record<Department, number> = {
      all: inventory.length,
      sarees: 0,
      kurtis: 0,
      kids: 0,
    };
    inventory.forEach(i => {
      if (counts[i.department] !== undefined) {
        counts[i.department]++;
      }
    });
    return counts;
  }, [inventory]);

  const allCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [inventory]);

  const availableSizesInCatalog = useMemo(() => {
    const sizes = new Set<Size>();
    const relevantItems = filters.department === 'all'
      ? inventory
      : inventory.filter(i => i.department === filters.department);
    relevantItems.forEach(item => {
      item.sizes.forEach(s => {
        if (s.stock > 0) {
          sizes.add(s.size);
        }
      });
    });
    return Array.from(sizes);
  }, [inventory, filters.department]);

  const visibleFeaturedDepartments = useMemo(() => {
    return DEPARTMENTS.filter(dept => {
      if (dept.id === 'all') return inventory.length > 0;
      return (departmentCounts[dept.id] ?? 0) > 0;
    });
  }, [departmentCounts, inventory.length]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return inventory
      .filter((item) => {
        // Department filter
        if (filters.department !== 'all' && item.department !== filters.department) {
          return false;
        }

        // Category filter
        if (filters.category !== 'All' && item.category !== filters.category) {
          return false;
        }

        // Search query filter
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchFabric = item.fabric.toLowerCase().includes(q);
          const matchSku = item.sku.toLowerCase().includes(q);
          const matchBarcode = item.barcode.includes(q);
          if (!matchName && !matchCategory && !matchFabric && !matchSku && !matchBarcode) {
            return false;
          }
        }

        // Price filter
        if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
          return false;
        }

        // Size filter
        if (filters.sizes.length > 0) {
          const hasSelectedSizeInStock = item.sizes.some(
            s => filters.sizes.includes(s.size) && s.stock > 0
          );
          if (!hasSelectedSizeInStock) return false;
        }

        // In Stock Only
        if (filters.inStockOnly && item.inStockTotal === 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'newest') return b.id.localeCompare(a.id);
        // Featured
        return (b.discountPercent || 0) - (a.discountPercent || 0);
      });
  }, [inventory, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.priceRange[1] < maxPriceInCatalog) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters, maxPriceInCatalog]);

  const isHomeView =
    filters.department === 'all' &&
    filters.category === 'All' &&
    !filters.searchQuery.trim() &&
    filters.sizes.length === 0 &&
    !filters.inStockOnly;

  const featuredProducts = useMemo(() => {
    if (featuredTab === 'all') return inventory;
    return inventory.filter((i) => i.department === featuredTab);
  }, [inventory, featuredTab]);

  const railCategories = useMemo(() => {
    const set = new Set<string>();
    if (filters.department === 'all') {
      ALL_CATEGORIES.forEach(c => set.add(c));
    } else {
      DEPARTMENT_CONFIG[filters.department]?.categories.forEach(c => set.add(c));
    }
    inventory.forEach((i) => {
      if (filters.department === 'all' || i.department === filters.department) {
        set.add(i.category);
      }
    });
    return ['All', ...Array.from(set)];
  }, [inventory, filters.department]);

  const handleSelectCategory = (dept: Department, category: string) => {
    setFilters((f) => ({
      ...f,
      department: dept,
      category: category,
      searchQuery: '',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryBarSelect = (dept: Department, category: string) => {
    setFilters((f) => ({
      ...f,
      department: dept,
      category: category,
      searchQuery: '',
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      department: 'all',
      category: 'All',
      sizes: [],
      priceRange: [0, maxPriceInCatalog],
      searchQuery: '',
      sortBy: 'featured',
      inStockOnly: false,
    });
  };

  // Cart operations
  const handleAddToCart = (item: ClothingItem, size: Size, colorIndex: number, quantity: number = 1) => {
    const selectedColor = item.colors[colorIndex] || item.colors[0];

    // Check size stock
    const sizeStock = item.sizes.find(s => s.size === size)?.stock ?? 0;
    if (sizeStock === 0) {
      showToast(`Size ${size} is currently out of stock`);
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (ci) => ci.item.id === item.id && ci.selectedSize === size && ci.selectedColor.name === selectedColor.name
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = Math.min(sizeStock, updated[existingIdx].quantity + quantity);
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            item,
            selectedSize: size,
            selectedColor,
            quantity: Math.min(sizeStock, quantity)
          }
        ];
      }
    });

    showToast(`Added ${item.name} (${size}) to your bag`);
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    setCart((prev) => {
      const updated = [...prev];
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  const handleUpdateCartSize = (index: number, newSize: Size) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].selectedSize = newSize;
      return updated;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Item removed from bag');
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist operations
  const handleToggleWishlist = (item: ClothingItem) => {
    setWishlist((prev) => {
      const exists = prev.some(w => w.id === item.id);
      if (exists) {
        showToast(`Removed from saved garments`);
        return prev.filter(w => w.id !== item.id);
      } else {
        showToast(`Saved to your wishlist`);
        return [...prev, item];
      }
    });
  };

  // Coupon
  const handleApplyCoupon = (code: string) => {
    setAppliedCoupon(code);
    showToast(`Coupon ${code} applied successfully!`);
    return true;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  // Checkout Placement with Realtime Firestore Persistence
  const handleOrderPlaced = async (newOrder: CustomerOrder) => {
    // Optimistic UI updates
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    setIsCartOpen(false);

    // Decrement stock in inventory locally
    setInventory(prev => {
      return prev.map(invItem => {
        const matchingPurchases = newOrder.items.filter(oi => oi.item.id === invItem.id);
        if (matchingPurchases.length === 0) return invItem;

        const updatedSizes = invItem.sizes.map(s => {
          const purchasedForSize = matchingPurchases
            .filter(mp => mp.selectedSize === s.size)
            .reduce((sum, mp) => sum + mp.quantity, 0);
          return {
            ...s,
            stock: Math.max(0, s.stock - purchasedForSize)
          };
        });

        const newTotal = updatedSizes.reduce((acc, s) => acc + s.stock, 0);
        return {
          ...invItem,
          sizes: updatedSizes,
          inStockTotal: newTotal
        };
      });
    });

    // Sync to Realtime Firestore Database
    try {
      await createOrderInFirestore(newOrder);

      for (const invItem of inventory) {
        const matchingPurchases = newOrder.items.filter(oi => oi.item.id === invItem.id);
        if (matchingPurchases.length === 0) continue;

        const updatedSizes = invItem.sizes.map(s => {
          const purchasedForSize = matchingPurchases
            .filter(mp => mp.selectedSize === s.size)
            .reduce((sum, mp) => sum + mp.quantity, 0);
          return {
            ...s,
            stock: Math.max(0, s.stock - purchasedForSize)
          };
        });
        const newTotal = updatedSizes.reduce((acc, s) => acc + s.stock, 0);

        await updateGarmentStockInFirestore(invItem.id, updatedSizes, newTotal);
      }
    } catch (err) {
      console.warn('Realtime database sync error for order placement:', err);
    }
  };

  // Store Manager Inventory Updates with Realtime Firestore Sync
  const handleUpdateItemStock = async (itemId: string, size: Size, newStock: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const updatedSizes = item.sizes.map(s => s.size === size ? { ...s, stock: newStock } : s);
    const total = updatedSizes.reduce((acc, s) => acc + s.stock, 0);

    setInventory(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      return {
        ...i,
        sizes: updatedSizes,
        inStockTotal: total
      };
    }));
    showToast(`Stock updated for size ${size} (Realtime Synced)`);

    try {
      await updateGarmentStockInFirestore(itemId, updatedSizes, total);
    } catch (err) {
      console.warn('Realtime database stock update error:', err);
    }
  };

  const handleUpdateItemPrice = async (itemId: string, newPrice: number) => {
    setInventory(prev => prev.map(item => item.id === itemId ? { ...item, price: newPrice } : item));
    showToast('Price updated (Realtime Synced)');

    try {
      await updateGarmentPriceInFirestore(itemId, newPrice);
    } catch (err) {
      console.warn('Realtime database price update error:', err);
    }
  };

  const handleAddNewItem = async (newItem: ClothingItem) => {
    setInventory(prev => [newItem, ...prev]);
    showToast(`Published ${newItem.name} to Realtime Database`);

    try {
      await addOrUpdateClothingItemInFirestore(newItem);
    } catch (err) {
      console.warn('Realtime database publish error:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: CustomerOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Order #${orderId} marked as ${status} (Realtime Synced)`);

    try {
      await updateOrderStatusInFirestore(orderId, status);
    } catch (err) {
      console.warn('Realtime database order status error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 flex flex-col selection:bg-amber-200 selection:text-amber-950">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-stone-100 text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP OF PAGE: Thin Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Header with Prominent Centered Search Bar and Trending Chips */}
      <Header
        currentDepartment={filters.department}
        onSelectDepartment={(dept) => handleSelectCategory(dept, 'All')}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters(f => ({ ...f, searchQuery: q }))}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenStoreManager={() => setIsStoreManagerOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        lowStockCount={lowStockCount}
        isRealtimeConnected={isRealtimeConnected}
        inventoryItems={inventory}
      />

      {/* 3. Sticky Horizontal Category Bar Under Header */}
      <CategoryBar
        currentDepartment={filters.department}
        currentCategory={filters.category}
        onSelect={handleCategoryBarSelect}
        departmentCounts={departmentCounts}
        categoryCounts={allCategoryCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {isHomeView ? (
          /* ==================== HOME PAGE LAYOUT ==================== */
          inventory.length === 0 ? (
            /* Friendly empty catalogue state when zero products in catalogue */
            <div className="space-y-12">
              <HeroSlideshow onSelectCategory={handleSelectCategory} />
              
              <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 text-center shadow-xs max-w-2xl mx-auto my-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-100/80 border border-amber-200/80 text-amber-900 flex items-center justify-center mx-auto mb-5 shadow-2xs">
                  <Sparkles className="w-8 h-8 text-amber-800" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-900 bg-amber-50 border border-amber-200/60 px-3.5 py-1 rounded-full inline-block mb-3">
                  Boutique Collection
                </span>
                <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-stone-900 mb-3">
                  New collection arriving soon
                </h2>
                <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Our master weavers and artisans are tailoring handcrafted pure silk sarees, celebratory kurtis & chudidars, and festive kidswear for our upcoming season.
                </p>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-600 max-w-lg mx-auto mb-6 space-y-1 text-left sm:text-center">
                  <p className="font-semibold text-stone-800">Visit our boutique showroom & trial suites:</p>
                  <p>{STORE_CENTRE_INFO.address}</p>
                  <p className="font-mono text-stone-500">{STORE_CENTRE_INFO.hours}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsStoreManagerOpen(true)}
                    className="px-6 py-3 bg-stone-900 hover:bg-amber-600 text-white rounded-full text-xs font-bold transition-all shadow-md uppercase tracking-wider cursor-pointer"
                  >
                    Open Store Manager
                  </button>
                </div>
              </div>

              <BrandStoryBlock />
            </div>
          ) : (
            <div>
              {/* 1. Hero Slideshow (3 slides, full width, auto-advance, dots, pause on hover) */}
              <HeroSlideshow onSelectCategory={handleSelectCategory} />

              {/* 2. Shop by Category Grid (rounded-square tiles, hides categories with 0 products) */}
              <CategoryTileGrid 
                onSelectCategory={handleSelectCategory}
                categoryCounts={allCategoryCounts}
              />

              {/* 3. Top Selling Strip ("Top selling this week" using Bestsellers) */}
              <TopSellingStrip
                items={inventory}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(i) => setQuickViewItem(i)}
                onAddToCart={(i, size, colorIdx) => handleAddToCart(i, size, colorIdx, 1)}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
              />

              {/* 4. "Featured" Section with Tabs */}
              <section className="mb-14">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800">
                      Hand-Selected Racks
                    </span>
                    <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
                      Featured Collection
                    </h2>
                  </div>

                  {/* Filter & Sort Button on Home Page */}
                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="px-4 py-2 bg-stone-900 hover:bg-amber-600 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter & Sort {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                  </button>
                </div>

                {/* Department Tabs: Hide departments with zero products */}
                {visibleFeaturedDepartments.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                    {visibleFeaturedDepartments.map((tab) => {
                      const isActive = featuredTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setFeaturedTab(tab.id as Department)}
                          className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                            isActive
                              ? 'bg-stone-900 text-white shadow-xs font-bold'
                              : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {featuredProducts.slice(0, 8).map((item) => (
                    <ProductCard
                      key={`featured-${item.id}`}
                      item={item}
                      isWishlisted={wishlist.some((w) => w.id === item.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onQuickView={(i) => setQuickViewItem(i)}
                      onAddToCart={(i, size, colorIdx) => handleAddToCart(i, size, colorIdx, 1)}
                      onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                    />
                  ))}
                </div>
              </section>

              {/* 5. Short 3-Column Brand Story Block */}
              <BrandStoryBlock />
            </div>
          )
        ) : (
          /* ==================== CATEGORY / SEARCH VIEW (TWO-PANE) ==================== */
          <div className="mb-14">
            {/* Category View Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
              <div>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-medium">
                  <button
                    onClick={handleResetFilters}
                    className="hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    Storefront
                  </button>
                  <span>/</span>
                  <span className="capitalize">{filters.department === 'all' ? 'All Collections' : (DEPARTMENT_CONFIG[filters.department]?.label || filters.department)}</span>
                  {filters.category !== 'All' && (
                    <>
                      <span>/</span>
                      <span className="text-stone-900 font-bold">{filters.category}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
                    {filters.category !== 'All'
                      ? filters.category
                      : filters.department === 'all'
                      ? 'All Boutique Collections'
                      : DEPARTMENT_CONFIG[filters.department]?.label || filters.department}
                  </h1>
                  <span className="text-xs bg-stone-200 text-stone-700 font-semibold px-2.5 py-0.5 rounded-full">
                    {filteredProducts.length} pieces
                  </span>
                </div>
              </div>

              {/* Action Buttons: Filters Drawer + Sizing Guide */}
              <div className="flex items-center gap-3">
                <button
                  id="category-filters-btn"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>

                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-700" />
                  <span>Fitting Guide</span>
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(activeFilterCount > 0 || filters.searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400">
                  Filters Applied:
                </span>
                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-medium">
                    Search: "{filters.searchQuery}"
                    <button onClick={() => setFilters(f => ({ ...f, searchQuery: '' }))} className="hover:text-amber-950 font-bold ml-0.5">×</button>
                  </span>
                )}
                {filters.sizes.map((size) => (
                  <span key={size} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium">
                    Size: {size}
                    <button onClick={() => setFilters(f => ({ ...f, sizes: f.sizes.filter(s => s !== size) }))} className="hover:text-stone-950 font-bold ml-0.5">×</button>
                  </span>
                ))}
                {filters.inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium">
                    In-Stock Only
                    <button onClick={() => setFilters(f => ({ ...f, inStockOnly: false }))} className="hover:text-stone-950 font-bold ml-0.5">×</button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* TWO-PANE ZEPTO-STYLE LAYOUT: Left Vertical Subcategory Rail, Right Product Grid */}
            <div className="flex gap-4 sm:gap-6 lg:gap-8 items-start">
              {/* Left Subcategory Rail (~80px mobile, wider desktop) */}
              <CategoryRail
                currentDepartment={filters.department}
                currentCategory={filters.category}
                categories={railCategories}
                categoryCounts={categoryCounts}
                onSelectCategory={(cat) => setFilters(f => ({ ...f, category: cat }))}
                onSelectDepartment={(dept) => setFilters(f => ({ ...f, department: dept, category: 'All' }))}
              />

              {/* Right Product Grid */}
              <div className="flex-1 min-w-0">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs">
                    <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto text-amber-800 mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif-display text-xl font-bold text-stone-900 mb-2">
                      No Matching Boutique Pieces Found
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-4 leading-relaxed">
                      We couldn't find any sarees, kurtis, or kidswear matching your current filters. Try relaxing criteria or clearing the search.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                      >
                        Reset All Filters
                      </button>
                      {filters.department !== 'all' && (
                        <button
                          onClick={() => setFilters(f => ({ ...f, department: 'all', category: 'All' }))}
                          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-xs font-semibold transition-colors cursor-pointer border border-stone-200"
                        >
                          Browse All Departments
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredProducts.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        isWishlisted={wishlist.some((w) => w.id === item.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(i) => setQuickViewItem(i)}
                        onAddToCart={(i, size, colorIdx) => handleAddToCart(i, size, colorIdx, 1)}
                        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Centre Retail Highlights & Luxury Footer with Trust Strip */}
      <footer className="mt-16 bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          
          {/* Trust Strip: Delivery, Returns, Tailoring Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-stone-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Complimentary Delivery</h4>
                <p className="text-stone-400 text-[11px] mt-0.5">Free standard shipping on orders over ₹1,999. Plus 2-hour boutique click & collect.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">7-Day Easy Returns</h4>
                <p className="text-stone-400 text-[11px] mt-0.5">Hassle-free size swaps, boutique exchange, and instant store credit.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Boutique Tailoring</h4>
                <p className="text-stone-400 text-[11px] mt-0.5">Complimentary saree fall & pico, kurti side slits, and trial alterations on site.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Certified Silks & Handlooms</h4>
                <p className="text-stone-400 text-[11px] mt-0.5">Pure Kanchipuram silk, Banarasi brocades, and genuine artisan handlooms.</p>
              </div>
            </div>
          </div>

          {/* Store Info & Credits */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-stone-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" /> {STORE_CENTRE_INFO.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" /> {STORE_CENTRE_INFO.phone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" /> {STORE_CENTRE_INFO.hours}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} {STORE_CENTRE_INFO.name}. All rights reserved.</span>
            </div>
          </div>

        </div>
      </footer>

      {/* MODALS & DRAWERS */}

      {/* Filter & Sort Drawer (Preserving all filter state) */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        currentDepartment={filters.department}
        availableSizes={availableSizesInCatalog}
        selectedSizes={filters.sizes}
        onToggleSize={(size) => {
          setFilters(f => ({
            ...f,
            sizes: f.sizes.includes(size)
              ? f.sizes.filter(s => s !== size)
              : [...f.sizes, size]
          }));
        }}
        priceRange={filters.priceRange}
        onPriceChange={(val) => setFilters(f => ({ ...f, priceRange: val }))}
        maxPossiblePrice={maxPriceInCatalog}
        inStockOnly={filters.inStockOnly}
        onToggleInStock={() => setFilters(f => ({ ...f, inStockOnly: !f.inStockOnly }))}
        sortBy={filters.sortBy}
        onSortChange={(sort) => setFilters(f => ({ ...f, sortBy: sort }))}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        resultsCount={filteredProducts.length}
      />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        item={quickViewItem}
        isOpen={Boolean(quickViewItem)}
        onClose={() => setQuickViewItem(null)}
        isWishlisted={quickViewItem ? wishlist.some(w => w.id === quickViewItem.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(item, size, colorIdx, qty) => {
          handleAddToCart(item, size, colorIdx, qty);
          setQuickViewItem(null);
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      {/* Sizing & Tailoring Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onSelectRecommendedSize={(size) => {
          setFilters(f => ({ ...f, sizes: [size] }));
          showToast(`Filtered garments to your recommended size: ${size}`);
        }}
      />

      {/* Shopping Bag Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onUpdateSize={handleUpdateCartSize}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout & Printable Tax Receipt Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        subtotal={cartTotal}
        discountAmount={appliedCoupon ? (cartTotal * (appliedCoupon === 'CENTRE15' ? 15 : appliedCoupon === 'FESTIVE25' ? 25 : 10)) / 100 : 0}
        appliedCoupon={appliedCoupon}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Store Operations & Staff Management Portal Modal */}
      <StoreManagerModal
        isOpen={isStoreManagerOpen}
        onClose={() => setIsStoreManagerOpen(false)}
        inventory={inventory}
        orders={orders}
        onUpdateItemStock={handleUpdateItemStock}
        onUpdateItemPrice={handleUpdateItemPrice}
        onAddNewItem={handleAddNewItem}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Orders & Tax Receipt Slip Finder Modal */}
      <OrdersReceiptModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
      />

      {/* Saved Garments Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(item, size, colorIdx) => handleAddToCart(item, size, colorIdx, 1)}
        onQuickView={(item) => setQuickViewItem(item)}
      />

    </div>
  );
}
