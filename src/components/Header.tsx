import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Store, 
  Receipt, 
  Sparkles,
  MapPin,
  Clock,
  Shirt,
  Flame,
  X,
  History,
  ArrowUpRight
} from 'lucide-react';
import { Department, ClothingItem } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { TRENDING_SEARCHES } from '../data/trending';
import { formatPrice } from '../lib/format';

interface HeaderProps {
  currentDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenStoreManager: () => void;
  onOpenOrders: () => void;
  lowStockCount: number;
  isRealtimeConnected?: boolean;
  inventoryItems?: ClothingItem[];
}

export const Header: React.FC<HeaderProps> = ({
  currentDepartment,
  onSelectDepartment,
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenStoreManager,
  onOpenOrders,
  lowStockCount,
  isRealtimeConnected = true,
  inventoryItems = []
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('clothing_centre_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem('clothing_centre_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('clothing_centre_recent_searches');
    } catch {
      // ignore
    }
  };

  const handleSelectSearchTerm = (term: string) => {
    onSearchChange(term);
    saveRecentSearch(term);
    setIsSearchFocused(false);
  };

  // Live suggestions from current inventory when user is typing
  const liveSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches: { text: string; type: 'product' | 'category' }[] = [];

    // Distinct categories matching
    const matchingCats = new Set<string>();
    inventoryItems.forEach((item) => {
      if (item.category.toLowerCase().includes(q)) {
        matchingCats.add(item.category);
      }
    });
    matchingCats.forEach((cat) => {
      matches.push({ text: cat, type: 'category' });
    });

    // Product names matching
    inventoryItems.forEach((item) => {
      if (item.name.toLowerCase().includes(q) && !matchingCats.has(item.name)) {
        matches.push({ text: item.name, type: 'product' });
      }
    });

    return matches.slice(0, 6);
  }, [searchQuery, inventoryItems]);

  return (
    <header id="clothing-centre-header" className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md">
      {/* Top utility ticker banner */}
      <div className="bg-stone-950 border-b border-stone-800 text-xs py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-stone-400">
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs min-w-0">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{STORE_CENTRE_INFO.hours.split('|')[0]?.trim()}</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 truncate text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate">{STORE_CENTRE_INFO.address}</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-emerald-400 whitespace-nowrap">
              <Sparkles className="w-3 h-3 shrink-0" /> Ready in 2 Hours for Store Pickup
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-xs ml-auto shrink-0">
            {isRealtimeConnected ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-medium" title="Connected to Google Cloud Firestore Realtime Database">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                Firestore Realtime
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                Connecting DB...
              </span>
            )}
            <button
              id="view-orders-receipt-btn"
              onClick={onOpenOrders}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 text-stone-300 cursor-pointer text-[11px] sm:text-xs"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Track Receipts</span>
            </button>
            <span className="text-stone-700">|</span>
            <button
              id="centre-staff-portal-btn"
              onClick={onOpenStoreManager}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 text-stone-300 cursor-pointer text-[11px] sm:text-xs"
              title="Inventory & Store Operations"
            >
              <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Staff Portal</span>
              {lowStockCount > 0 && (
                <span className="bg-rose-700 text-rose-100 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {lowStockCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation row with Search Bar as the VISUAL CENTRE */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Logo & Store Identity */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer group"
            onClick={() => onSelectDepartment('all')}
            title="Return to Storefront Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0 group-hover:border-amber-400 transition-colors">
              <Shirt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-amber-50 uppercase truncate">
                  {STORE_CENTRE_INFO.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 tracking-wider uppercase font-medium truncate">
                {STORE_CENTRE_INFO.tagline}
              </p>
            </div>
          </div>

          {/* Center: Search Bar as the VISUAL CENTRE */}
          <div className="relative flex-1 max-w-xl mx-1 sm:mx-4" ref={searchContainerRef}>
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="clothing-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    saveRecentSearch(searchQuery.trim());
                    setIsSearchFocused(false);
                  }
                }}
                placeholder="Search silk sarees, cotton kurtis, anarkalis, chudidars, kidswear..."
                className="w-full pl-10 pr-9 py-2.5 bg-stone-800/90 border border-stone-700 hover:border-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-full text-xs sm:text-sm text-stone-100 placeholder-stone-400 shadow-inner transition-all outline-none"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-xs p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Amazon-style Trending & Recent Searches Dropdown Panel */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-stone-800 animate-in fade-in slide-in-from-top-1 duration-150">
                
                {/* Live Suggestions matching search query */}
                {searchQuery.trim().length > 0 && liveSuggestions.length > 0 && (
                  <div className="p-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-2 px-2">
                      Matching Suggestions
                    </div>
                    <div className="space-y-1">
                      {liveSuggestions.map((sug, idx) => (
                        <button
                          key={`${sug.text}-${idx}`}
                          onClick={() => handleSelectSearchTerm(sug.text)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left text-stone-200 hover:bg-stone-800 hover:text-amber-300 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 shrink-0" />
                            <span className="font-medium">{sug.text}</span>
                          </div>
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                            {sug.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches (last 5, stored in localStorage) */}
                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                        <History className="w-3 h-3 text-stone-400" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSelectSearchTerm(term)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700/80 text-stone-300 hover:text-white rounded-full text-xs transition-colors cursor-pointer border border-stone-700/60"
                        >
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches (8 items with flame icon) */}
                <div className="p-3 bg-stone-900/50">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-2 px-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trending Searches</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                    {TRENDING_SEARCHES.slice(0, 8).map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectSearchTerm(term)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left text-stone-300 hover:bg-stone-800 hover:text-amber-300 transition-colors cursor-pointer group"
                      >
                        <span className="truncate">{term}</span>
                        <ArrowUpRight className="w-3 h-3 text-stone-500 group-hover:text-amber-400 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Right: Actions (Wishlist & Cart Bag) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Wishlist */}
            <button
              id="wishlist-trigger-btn"
              onClick={onOpenWishlist}
              className="p-2 sm:p-2.5 rounded-full text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-colors relative cursor-pointer"
              title="Saved Items"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag */}
            <button
              id="cart-trigger-btn"
              onClick={onOpenCart}
              className="flex items-center gap-2 sm:gap-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-3 sm:px-4 py-2 rounded-full transition-colors cursor-pointer shadow-sm shrink-0"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-stone-950 text-amber-400 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-amber-600">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-wide">
                {cartCount === 0 ? 'Bag' : formatPrice(cartTotal)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Single-line row of 5-6 "Trending:" chips below header that scrolls horizontally on mobile */}
      <div className="bg-stone-950/80 border-t border-stone-800/80 px-3 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-1 text-amber-400 font-bold uppercase tracking-wider text-[10px] shrink-0 pr-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Trending:</span>
          </div>
          {TRENDING_SEARCHES.slice(0, 6).map((term) => (
            <button
              key={term}
              onClick={() => handleSelectSearchTerm(term)}
              className="px-2.5 py-0.5 rounded-full bg-stone-800/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-700/60 text-[11px] transition-colors shrink-0 cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

