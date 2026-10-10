import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Receipt, 
  Sparkles,
  MapPin,
  Clock,
  Shirt,
  Flame,
  X,
  History,
  ArrowUpRight,
  Phone,
  User as UserIcon
} from 'lucide-react';
import { Department, ClothingItem } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { TRENDING_SEARCHES } from '../data/trending';
import { formatPrice } from '../lib/format';
import { useAuth } from '../lib/authContext';

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
  onOpenOrders: () => void;
  onOpenAuth?: () => void;
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
  onOpenOrders,
  onOpenAuth,
  isRealtimeConnected = true,
  inventoryItems = []
}) => {
  const { user, profile } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('clothing_centre_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchContainerRef.current && searchContainerRef.current.contains(target);
      const insideMobile = mobileSearchContainerRef.current && mobileSearchContainerRef.current.contains(target);
      if (!insideDesktop && !insideMobile) {
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
    <header id="yaazh-boutique-header" className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md">
      {/* Top utility ticker banner */}
      <div className="bg-stone-950 border-b border-stone-800 text-xs py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-stone-400">
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs min-w-0">
            {Boolean(STORE_CENTRE_INFO.hours) && (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{STORE_CENTRE_INFO.hours.split('|')[0]?.trim()}</span>
              </span>
            )}
            <span className="hidden md:inline-flex items-center gap-1.5 truncate text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate">{STORE_CENTRE_INFO.address}</span>
            </span>
            <a
              href={`tel:${STORE_CENTRE_INFO.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 whitespace-nowrap transition-colors"
              title="Call primary phone"
            >
              <Phone className="w-3 h-3 shrink-0" />
              <span>{STORE_CENTRE_INFO.phone}</span>
            </a>
            {STORE_CENTRE_INFO.phone2 && (
              <a
                href={`tel:${STORE_CENTRE_INFO.phone2.replace(/\s+/g, '')}`}
                className="hidden sm:inline-flex items-center gap-1 text-stone-400 hover:text-amber-300 whitespace-nowrap transition-colors"
                title="Call secondary phone"
              >
                <Phone className="w-3 h-3 shrink-0" />
                <span>{STORE_CENTRE_INFO.phone2}</span>
              </a>
            )}
            {STORE_CENTRE_INFO.instagram && (
              <a
                href={`https://instagram.com/${STORE_CENTRE_INFO.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1 text-stone-400 hover:text-amber-300 whitespace-nowrap transition-colors"
                title="Instagram"
              >
                <span>@{STORE_CENTRE_INFO.instagram}</span>
              </a>
            )}
            {STORE_CENTRE_INFO.facebook && (
              <a
                href={`https://facebook.com/${STORE_CENTRE_INFO.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden 2xl:inline-flex items-center gap-1 text-stone-400 hover:text-amber-300 whitespace-nowrap transition-colors"
                title="Facebook"
              >
                <span>fb/{STORE_CENTRE_INFO.facebook}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-xs ml-auto shrink-0">
            <button
              id="view-orders-receipt-btn"
              onClick={onOpenOrders}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 text-stone-300 cursor-pointer text-[11px] sm:text-xs"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Track Receipts</span>
            </button>
            {onOpenAuth && (
              <>
                <span className="text-stone-700">|</span>
                <button
                  id="customer-account-btn"
                  onClick={onOpenAuth}
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5 text-stone-300 cursor-pointer text-[11px] sm:text-xs"
                  title={user ? 'Customer Account' : 'Sign In / Register'}
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="max-w-[120px] truncate">{user ? (profile?.displayName || 'My Account') : 'Sign In'}</span>
                </button>
              </>
            )}
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
            {!logoError && (
              <img
                src="/brand/logo.png"
                alt="Yaazh Boutique logo"
                onError={() => setLogoError(true)}
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-amber-500/30 group-hover:ring-amber-400"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-amber-50 uppercase truncate group-hover:text-amber-300 transition-colors">
                  {STORE_CENTRE_INFO.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 tracking-wider uppercase font-medium truncate">
                {STORE_CENTRE_INFO.tagline}
              </p>
            </div>
          </div>

          {/* Center: Search Bar on Desktop/Tablet (md and above) */}
          <div className="hidden md:block relative flex-1 max-w-xl mx-4" ref={searchContainerRef}>
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
                placeholder="Search sarees, blouses, co-ords, salwar materials, lounge wear..."
                className="w-full pl-10 pr-9 py-2.5 bg-stone-800/90 border border-stone-700 hover:border-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-full text-xs sm:text-sm text-stone-100 placeholder-stone-400 shadow-inner transition-all outline-none"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-xs p-1 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Trending & Recent Searches Dropdown Panel */}
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

                {/* Recent Searches */}
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

                {/* Trending Searches */}
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

          {/* Right: Actions (Desktop has all; Mobile has Account & Bag since Bottom Nav has Wishlist/Orders) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* My Orders (Desktop only - mobile uses bottom nav) */}
            <button
              id="my-orders-trigger-btn"
              onClick={onOpenOrders}
              className="hidden md:inline-flex p-2 sm:p-2.5 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 transition-colors relative cursor-pointer"
              title="My Orders & Receipts"
              aria-label="My Orders"
            >
              <Receipt className="w-5 h-5" />
            </button>

            {/* Customer Account */}
            {onOpenAuth && (
              <button
                id="account-trigger-btn"
                onClick={onOpenAuth}
                className="p-2 sm:p-2.5 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 transition-colors relative cursor-pointer"
                title={user ? (profile?.displayName || user.email || 'My Account') : 'Sign In'}
                aria-label="Account"
              >
                <UserIcon className="w-5 h-5" />
                {user && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-stone-900" />
                )}
              </button>
            )}

            {/* Wishlist (Desktop only - mobile uses bottom nav) */}
            <button
              id="wishlist-trigger-btn"
              onClick={onOpenWishlist}
              className="hidden md:inline-flex p-2 sm:p-2.5 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 transition-colors relative cursor-pointer"
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
              className="flex items-center gap-1.5 sm:gap-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-3 sm:px-4 py-2 rounded-full transition-colors cursor-pointer shadow-sm shrink-0"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950" />
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

        {/* Mobile Dedicated Full-Width Search Input (md:hidden) */}
        <div className="md:hidden mt-2.5 relative w-full" ref={mobileSearchContainerRef}>
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="clothing-search-input-mobile"
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
              placeholder="Search sarees, blouses, co-ords, salwar materials..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-800/90 border border-stone-700 hover:border-stone-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-full text-xs text-stone-100 placeholder-stone-400 shadow-inner transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-xs p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Dropdown Panel */}
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
                        key={`mob-${sug.text}-${idx}`}
                        onClick={() => handleSelectSearchTerm(sug.text)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left text-stone-200 hover:bg-stone-800 hover:text-amber-300 transition-colors cursor-pointer group"
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

              {/* Recent Searches */}
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
                        key={`mob-${term}`}
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

              {/* Trending Searches */}
              <div className="p-3 bg-stone-900/50">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-2 px-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trending Searches</span>
                </div>
                <div className="grid grid-cols-1 gap-1 px-1">
                  {TRENDING_SEARCHES.slice(0, 6).map((term) => (
                    <button
                      key={`mob-${term}`}
                      onClick={() => handleSelectSearchTerm(term)}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left text-stone-300 hover:bg-stone-800 hover:text-amber-300 transition-colors cursor-pointer group"
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

