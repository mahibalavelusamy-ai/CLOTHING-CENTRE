import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Receipt, 
  Sparkles, 
  MapPin, 
  Clock, 
  Phone, 
  User as UserIcon,
  X,
  History,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { Department, ClothingItem } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { DEPARTMENTS } from '../data/catalogConfig';
import { TRENDING_SEARCHES } from '../data/trending';
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
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
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

    const matchingCats = new Set<string>();
    inventoryItems.forEach((item) => {
      if (item.category.toLowerCase().includes(q)) {
        matchingCats.add(item.category);
      }
    });
    matchingCats.forEach((cat) => {
      matches.push({ text: cat, type: 'category' });
    });

    inventoryItems.forEach((item) => {
      if (item.name.toLowerCase().includes(q) && !matchingCats.has(item.name)) {
        matches.push({ text: item.name, type: 'product' });
      }
    });

    return matches.slice(0, 6);
  }, [searchQuery, inventoryItems]);

  const navDepartments = DEPARTMENTS.filter(d => d.id !== 'all');

  return (
    <>
      {/* 1. Top Utility Notification Bar (Apple-style neutral #F5F5F7) */}
      <div className="bg-[#F5F5F7] text-[#424245] text-[12px] py-2 px-4 border-b border-[#E8E8ED]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-center font-normal">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-[#6D1A33] shrink-0" />
            <span>Saree pre-pleating available in store</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <span>Free home delivery on orders above ₹1,999</span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-[#6E6E73] shrink-0" />
            <a href={`tel:${STORE_CENTRE_INFO.phone.replace(/\s+/g, '')}`} className="text-[#6D1A33] font-medium hover:underline">
              Call {STORE_CENTRE_INFO.phone}
            </a>
          </span>
        </div>
      </div>

      {/* 2. Sticky Translucent Luxury Navbar */}
      <header 
        id="yaazh-boutique-header"
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E8ED] transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity */}
          <button
            onClick={() => onSelectDepartment('all')}
            className="flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer shrink-0 text-left"
            aria-label="Yaazh Boutique Home"
          >
            {!logoError ? (
              <img
                src="/brand/logo.png"
                alt="Yaazh Boutique"
                onError={() => setLogoError(true)}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[#E8E8ED]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#6D1A33] text-white flex items-center justify-center font-bold text-xs">
                Y
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-display text-lg sm:text-xl font-bold tracking-tight text-[#1D1D1F] uppercase">
                  {STORE_CENTRE_INFO.name}
                </span>
                <span className="font-tamil text-xs font-semibold text-[#6D1A33]">
                  யாழ்
                </span>
              </div>
              <span className="text-[10px] text-[#6E6E73] uppercase tracking-wider font-medium hidden sm:block">
                {STORE_CENTRE_INFO.tagline}
              </span>
            </div>
          </button>

          {/* Center: Department Navigation on Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Departments">
            {navDepartments.map((dept) => {
              const isActive = currentDepartment === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => onSelectDepartment(dept.id)}
                  className={`px-3 py-2 text-[13px] rounded-full transition-colors cursor-pointer border-0 ${
                    isActive
                      ? 'bg-[#1D1D1F] text-white font-semibold'
                      : 'bg-transparent text-[#424245] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] font-medium'
                  }`}
                >
                  {dept.label}
                </button>
              );
            })}
          </nav>

          {/* Search Bar / Input (Tablet and Desktop) */}
          <div className="relative flex-1 max-w-xs xl:max-w-sm hidden md:block" ref={searchContainerRef}>
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#6E6E73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="header-search-input"
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
                placeholder="Search sarees, blouses, co-ords…"
                className="w-full pl-9 pr-8 py-2 bg-[#F5F5F7] hover:bg-[#EFEFF2] focus:bg-white border border-transparent focus:border-[#6D1A33] focus:ring-2 focus:ring-[#6D1A33]/15 rounded-full text-[13px] text-[#1D1D1F] placeholder-[#6E6E73] transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8E8ED] rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-[#E8E8ED] animate-in fade-in duration-150">
                {searchQuery.trim().length > 0 && liveSuggestions.length > 0 && (
                  <div className="p-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#6D1A33] mb-1.5 px-2">
                      Matching Pieces
                    </div>
                    <div className="space-y-0.5">
                      {liveSuggestions.map((sug, idx) => (
                        <button
                          key={`${sug.text}-${idx}`}
                          onClick={() => handleSelectSearchTerm(sug.text)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left text-[#1D1D1F] hover:bg-[#F5F5F7] hover:text-[#6D1A33] transition-colors cursor-pointer"
                        >
                          <span className="font-medium truncate">{sug.text}</span>
                          <span className="text-[10px] text-[#6E6E73] uppercase tracking-wider shrink-0 ml-2">
                            {sug.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1.5 px-2">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#6E6E73]">
                        <History className="w-3 h-3" />
                        <span>Recent</span>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] text-[#6E6E73] hover:text-[#6D1A33] cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSelectSearchTerm(term)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#F5F5F7] hover:bg-[#EFEFF2] text-[#424245] hover:text-[#1D1D1F] rounded-full text-[11px] transition-colors cursor-pointer"
                        >
                          <Clock className="w-3 h-3 text-[#6E6E73]" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#FAFAFC]">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#6D1A33] mb-1.5 px-2">
                    <Flame className="w-3 h-3 text-[#6D1A33]" />
                    <span>Trending Now</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {TRENDING_SEARCHES.slice(0, 6).map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectSearchTerm(term)}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left text-[#424245] hover:bg-[#F5F5F7] hover:text-[#6D1A33] transition-colors cursor-pointer"
                      >
                        <span className="truncate">{term}</span>
                        <ArrowUpRight className="w-3 h-3 text-[#86868B] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions (Account, Wishlist, Orders, Bag) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Orders Receipt Button */}
            <button
              onClick={onOpenOrders}
              className="w-10 h-10 rounded-full hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer relative"
              title="Track Orders & Receipts"
              aria-label="Orders"
            >
              <Receipt className="w-4 h-4" />
            </button>

            {/* Account / User Button */}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-10 h-10 rounded-full hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer relative"
                title={user ? (profile?.displayName || user.email || 'My Account') : 'Sign In'}
                aria-label="Customer Account"
              >
                {user ? (
                  <span className="w-6 h-6 rounded-full bg-[#6D1A33] text-white text-[11px] font-bold flex items-center justify-center">
                    {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="hidden sm:inline-flex w-10 h-10 rounded-full hover:bg-[#F5F5F7] text-[#1D1D1F] items-center justify-center transition-colors cursor-pointer relative"
              title="Saved Pieces"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#1D1D1F] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Bag Button (Maroon Accent) */}
            <button
              id="header-bag-btn"
              onClick={onOpenCart}
              className="w-10 h-10 rounded-full hover:bg-[#F3E8EB] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer relative"
              title="Your Boutique Bag"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#6D1A33]" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#6D1A33] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
