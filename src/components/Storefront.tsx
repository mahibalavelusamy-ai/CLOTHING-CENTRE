import { useState, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { CategoryBar } from './CategoryBar';
import { HeroSlideshow } from './HeroSlideshow';
import { CategoryTileGrid } from './CategoryTileGrid';
import { TopSellingStrip } from './TopSellingStrip';
import { CategoryRail } from './CategoryRail';
import { FilterDrawer } from './FilterDrawer';
import { BrandStoryBlock } from './BrandStoryBlock';
import { ProductCard } from './ProductCard';
import { ProductQuickViewModal } from './ProductQuickViewModal';
import { SizeGuideModal } from './SizeGuideModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { OrdersReceiptModal } from './OrdersReceiptModal';
import { WishlistDrawer } from './WishlistDrawer';
import { CustomerAuthModal } from './CustomerAuthModal';
import { WhatsAppButton } from './WhatsAppButton';
import { MobileBottomNav } from './MobileBottomNav';
import { INITIAL_CLOTHING_ITEMS, STORE_CENTRE_INFO } from '../data/clothingData';
import { DEPARTMENTS, DEPARTMENT_CONFIG, ALL_CATEGORIES } from '../data/catalogConfig';
import { formatPrice } from '../lib/format';
import { 
  ClothingItem, 
  CartItem, 
  CustomerOrder, 
  Department, 
  FilterState, 
  Size 
} from '../types';
import { 
  testFirestoreConnection,
  subscribeToClothingItems,
  subscribeToCustomerOrders,
  createOrderInFirestore
} from '../lib/firebase';
import { useAuth } from '../lib/authContext';
import { 
  SlidersHorizontal, 
  ShoppingBag, 
  Check, 
  Clock, 
  MapPin, 
  Phone, 
  Sparkles,
  Search,
  AlertCircle
} from 'lucide-react';

export const Storefront: React.FC = () => {
  const { user, sendVerificationEmail, reloadUser } = useAuth();
  const [checkingEmailVerification, setCheckingEmailVerification] = useState(false);
  // Inventory state with LocalStorage persistence
  const [inventory, setInventory] = useState<ClothingItem[]>(() => {
    try {
      const saved = localStorage.getItem('yaazh_boutique_inventory-v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CLOTHING_ITEMS;
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('yaazh_boutique_cart-v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState<ClothingItem[]>(() => {
    try {
      const saved = localStorage.getItem('yaazh_boutique_wishlist-v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('yaazh_boutique_orders-v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
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

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [featuredTab, setFeaturedTab] = useState<Department>('all');

  // Modals & Drawers
  const [quickViewItem, setQuickViewItem] = useState<ClothingItem | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

    testFirestoreConnection()
      .then(() => {
        if (!isMounted) return;
        setIsRealtimeConnected(true);
      })
      .catch((err) => {
        console.warn('Initial Firestore connection check notice:', err);
      });

    const unsubscribeItems = subscribeToClothingItems(
      (realtimeItems) => {
        if (!isMounted) return;
        if (realtimeItems && realtimeItems.length > 0) {
          setInventory(realtimeItems);
        } else {
          setInventory((prev) => (prev && prev.length > 0 ? prev : INITIAL_CLOTHING_ITEMS));
        }
        setIsRealtimeConnected(true);
      },
      (err) => {
        console.warn('Realtime clothing items subscription warning:', err);
      }
    );

    let unsubscribeOrders: (() => void) | undefined;
    if (user?.uid) {
      unsubscribeOrders = subscribeToCustomerOrders(
        user.uid,
        (realtimeOrders) => {
          if (!isMounted) return;
          setOrders(realtimeOrders || []);
          setIsRealtimeConnected(true);
        },
        (err) => {
          console.warn('Realtime customer orders subscription notice:', err);
        }
      );
    }

    return () => {
      isMounted = false;
      unsubscribeItems();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [user?.uid]);

  // Local fallback cache sync (-v3 keys)
  useEffect(() => {
    localStorage.setItem('yaazh_boutique_inventory-v3', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('yaazh_boutique_cart-v3', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('yaazh_boutique_wishlist-v3', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('yaazh_boutique_orders-v3', JSON.stringify(orders));
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
      blouses: 0,
      coords: 0,
      salwar: 0,
      lounge: 0,
      decor: 0,
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
    const set = new Set<Size>();
    if (filters.department === 'all') {
      Object.values(DEPARTMENT_CONFIG).forEach(cfg => cfg.sizes.forEach(s => set.add(s)));
    } else {
      DEPARTMENT_CONFIG[filters.department]?.sizes.forEach(s => set.add(s));
    }
    return Array.from(set);
  }, [filters.department]);

  const visibleFeaturedDepartments = useMemo(() => {
    return DEPARTMENTS.filter(dept => (departmentCounts[dept.id] ?? 0) > 0);
  }, [departmentCounts]);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    return inventory
      .filter((item) => {
        if (filters.department !== 'all' && item.department !== filters.department) {
          return false;
        }
        if (filters.category !== 'All' && item.category !== filters.category) {
          return false;
        }
        if (filters.sizes.length > 0) {
          const hasSelectedSize = item.sizes.some(
            (s) => filters.sizes.includes(s.size) && s.stock > 0
          );
          if (!hasSelectedSize) return false;
        }
        if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
          return false;
        }
        if (filters.inStockOnly && item.inStockTotal <= 0) {
          return false;
        }
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchSku = item.sku.toLowerCase().includes(q);
          const matchFabric = item.fabric.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));

          if (!matchName && !matchCategory && !matchSku && !matchFabric && !matchDesc && !matchTags) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return b.tags.includes('New Arrival') ? 1 : -1;
          case 'featured':
          default:
            if (a.tags.includes('Bestseller') && !b.tags.includes('Bestseller')) return -1;
            if (!a.tags.includes('Bestseller') && b.tags.includes('Bestseller')) return 1;
            return b.rating - a.rating;
        }
      });
  }, [inventory, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.inStockOnly) count += 1;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPriceInCatalog) count += 1;
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
        showToast(`Removed from your wishlist`);
        return prev.filter(w => w.id !== item.id);
      } else {
        showToast(`Saved to your wishlist`);
        return [...prev, item];
      }
    });
  };

  // Coupon operations
  const handleApplyCoupon = (code: string): boolean => {
    setAppliedCoupon(code);
    showToast(`Coupon ${code} applied successfully!`);
    return true;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon code removed');
  };

  // Order Placement
  const handleOrderPlaced = async (newOrder: CustomerOrder) => {
    await createOrderInFirestore(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    showToast(`Order #${newOrder.id} successfully placed!`);
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      showToast('Verification email resent. Please check your inbox.');
    } catch (err: any) {
      showToast('Could not resend email. Please try again.');
    }
  };

  const handleCheckVerification = async () => {
    setCheckingEmailVerification(true);
    try {
      const refreshed = await reloadUser();
      if (refreshed?.emailVerified) {
        showToast('Your email is now verified!');
      } else {
        showToast('Email not yet verified. Please click the link sent to your inbox.');
      }
    } catch {
      showToast('Could not check status. Please try again.');
    } finally {
      setCheckingEmailVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 flex flex-col selection:bg-amber-100 selection:text-amber-900 pb-16 md:pb-0">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-stone-100 text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-stone-800 animate-in fade-in slide-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <div className="bg-amber-950/60 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Please verify your email (<strong>{user.email}</strong>) to activate online ordering. Check your inbox for the link.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendVerification}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Resend Email
            </button>
            <button
              onClick={handleCheckVerification}
              disabled={checkingEmailVerification}
              className="px-2.5 py-1 bg-white border border-stone-300 hover:border-amber-600 text-stone-700 rounded-md text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              {checkingEmailVerification ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>
      )}

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
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
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
            <div className="space-y-12">
              <HeroSlideshow onSelectCategory={handleSelectCategory} />
              
              <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 text-center shadow-xs max-w-2xl mx-auto my-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto mb-5 shadow-2xs">
                  <Sparkles className="w-8 h-8 text-amber-700" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full inline-block mb-3">
                  Boutique Collection
                </span>
                <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-stone-900 mb-3">
                  New collection arriving soon
                </h2>
                <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Welcome to {STORE_CENTRE_INFO.name}, Oddanchatram. Handcrafted sarees, blouses, co-ords, lounge wear, salwar materials, and decor collections are arriving soon.
                </p>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 max-w-lg mx-auto mb-6 space-y-1 text-left sm:text-center">
                  <p className="font-semibold text-stone-900">Visit {STORE_CENTRE_INFO.name}:</p>
                  <p>{STORE_CENTRE_INFO.address}</p>
                  <p className="text-stone-900">
                    Call: <a href={`tel:${STORE_CENTRE_INFO.phone.replace(/\s+/g, '')}`} className="text-amber-800 font-medium hover:underline">{STORE_CENTRE_INFO.phone}</a>
                    {STORE_CENTRE_INFO.phone2 && (
                      <> · <a href={`tel:${STORE_CENTRE_INFO.phone2.replace(/\s+/g, '')}`} className="text-amber-800 font-medium hover:underline">{STORE_CENTRE_INFO.phone2}</a></>
                    )}
                  </p>
                  {Boolean(STORE_CENTRE_INFO.hours) && (
                    <p className="font-mono text-stone-500">{STORE_CENTRE_INFO.hours}</p>
                  )}
                </div>
              </div>

              <BrandStoryBlock />
            </div>

          ) : (
            <div>
              {/* 1. Hero Slideshow */}
              <HeroSlideshow onSelectCategory={handleSelectCategory} />

              {/* 2. Shop by Category Grid */}
              <CategoryTileGrid 
                onSelectCategory={handleSelectCategory}
                categoryCounts={allCategoryCounts}
              />

              {/* 3. Top Selling Strip */}
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

                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="px-4 py-2 border border-stone-300 hover:border-amber-600 text-stone-700 hover:text-amber-800 rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs uppercase tracking-wider bg-white"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter & Sort {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                  </button>
                </div>

                {/* Department Tabs */}
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
                              : 'bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200'
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
                  <span className="text-xs bg-stone-100 border border-stone-200 text-stone-700 font-semibold px-2.5 py-0.5 rounded-full">
                    {filteredProducts.length} pieces
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="category-filters-btn"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="px-4 py-2.5 border border-stone-300 hover:border-amber-600 text-stone-700 hover:text-amber-800 rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs uppercase tracking-wider bg-white"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>

                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                  <span>Size Guide</span>
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(activeFilterCount > 0 || filters.searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500">
                  Filters Applied:
                </span>
                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-medium">
                    Search: "{filters.searchQuery}"
                    <button onClick={() => setFilters(f => ({ ...f, searchQuery: '' }))} className="hover:text-amber-700 font-bold ml-0.5">×</button>
                  </span>
                )}
                {filters.sizes.map((size) => (
                  <span key={size} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-medium">
                    Size: {size}
                    <button onClick={() => setFilters(f => ({ ...f, sizes: f.sizes.filter(s => s !== size) }))} className="hover:text-stone-900 font-bold ml-0.5">×</button>
                  </span>
                ))}
                {filters.inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    In-Stock Only
                    <button onClick={() => setFilters(f => ({ ...f, inStockOnly: false }))} className="hover:text-emerald-950 font-bold ml-0.5">×</button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}


            {/* TWO-PANE LAYOUT */}
            <div className="flex gap-4 sm:gap-6 lg:gap-8 items-start">
              <CategoryRail
                currentDepartment={filters.department}
                currentCategory={filters.category}
                categories={railCategories}
                categoryCounts={categoryCounts}
                onSelectCategory={(cat) => setFilters(f => ({ ...f, category: cat }))}
                onSelectDepartment={(dept) => setFilters(f => ({ ...f, department: dept, category: 'All' }))}
              />

              <div className="flex-1 min-w-0">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 text-center shadow-xs">
                    <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-amber-700 mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif-display text-xl font-bold text-stone-900 mb-2">
                      No Matching Boutique Pieces Found
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-4 leading-relaxed">
                      We couldn't find any products matching your current filters. Try relaxing criteria or clearing the search.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 btn-primary-glossy text-white rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                      >
                        Reset All Filters
                      </button>
                      {filters.department !== 'all' && (
                        <button
                          onClick={() => setFilters(f => ({ ...f, department: 'all', category: 'All' }))}
                          className="px-4 py-2.5 bg-surface-2 hover:bg-surface text-text rounded-full text-xs font-semibold transition-colors cursor-pointer border border-border"
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

      {/* Luxury Footer */}
      <footer className="mt-16 bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-stone-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-sm">Visit us</h4>
                <p className="text-stone-400 text-[11px] mt-0.5">{STORE_CENTRE_INFO.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-sm">Call us</h4>
                <div className="text-stone-400 text-[11px] mt-0.5 flex flex-col gap-0.5">
                  <a
                    href={`tel:${STORE_CENTRE_INFO.phone.replace(/\s+/g, '')}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {STORE_CENTRE_INFO.phone}
                  </a>
                  {STORE_CENTRE_INFO.phone2 && (
                    <a
                      href={`tel:${STORE_CENTRE_INFO.phone2.replace(/\s+/g, '')}`}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {STORE_CENTRE_INFO.phone2}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-sm">Order online</h4>
                <p className="text-stone-400 text-[11px] mt-0.5">Store pickup or home delivery</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-400 text-[11px]">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-stone-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>{STORE_CENTRE_INFO.address}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <a href={`tel:${STORE_CENTRE_INFO.phone.replace(/\s+/g, '')}`} className="hover:text-amber-400 transition-colors">
                  {STORE_CENTRE_INFO.phone}
                </a>
              </span>
              {STORE_CENTRE_INFO.instagram && (
                <a
                  href={`https://instagram.com/${STORE_CENTRE_INFO.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  @{STORE_CENTRE_INFO.instagram}
                </a>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/staff/login"
                className="text-stone-400 hover:text-amber-400 transition-colors underline underline-offset-2"
              >
                Staff Portal
              </a>
              <span>·</span>
              <span>© {new Date().getFullYear()} {STORE_CENTRE_INFO.name}. All rights reserved.</span>
            </div>
          </div>

        </div>
      </footer>


      {/* MODALS & DRAWERS */}
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

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onSelectRecommendedSize={(size) => {
          setFilters(f => ({ ...f, sizes: [size] }));
          showToast(`Filtered garments to your recommended size: ${size}`);
        }}
      />

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

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        subtotal={cartTotal}
        discountAmount={appliedCoupon ? (cartTotal * (appliedCoupon === 'YAAZH10' ? 10 : appliedCoupon === 'FESTIVE25' ? 25 : 10)) / 100 : 0}
        appliedCoupon={appliedCoupon}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrdersReceiptModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        customerUid={user?.uid}
        orders={orders}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(item, size, colorIdx) => handleAddToCart(item, size, colorIdx, 1)}
        onQuickView={(item) => setQuickViewItem(item)}
      />

      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      <WhatsAppButton currentCategory={filters.category} />

      <MobileBottomNav
        activeTab={isHomeView ? 'home' : 'collections'}
        onNavigateHome={() => {
          handleResetFilters();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCategories={() => {
          setIsFilterDrawerOpen(true);
        }}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

    </div>
  );
};
