import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  Ruler, 
  Star,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { ClothingItem, Size } from '../types';
import { formatPrice } from '../lib/format';
import { buildLink } from '../lib/whatsapp';

interface ProductQuickViewModalProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (item: ClothingItem) => void;
  onAddToCart: (item: ClothingItem, size: Size, colorIndex: number, quantity: number) => void;
  onOpenSizeGuide: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  item,
  isOpen,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenSizeGuide
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size>('Free Size');
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (item) {
      const isFreeSize = item.sizes.length === 1 && item.sizes[0].size === 'Free Size';
      if (isFreeSize) {
        setSelectedSize('Free Size');
      } else {
        const available = item.sizes.find(s => s.stock > 0);
        setSelectedSize(available ? available.size : item.sizes[0]?.size || 'Free Size');
      }
      setActiveImageIdx(0);
      setSelectedColorIdx(0);
      setQuantity(1);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isFreeSize = item.sizes.length === 1 && item.sizes[0].size === 'Free Size';
  const selectedSizeInfo = item.sizes.find(s => s.size === selectedSize);
  const availableStock = selectedSizeInfo?.stock ?? 0;
  const isOutOfStock = availableStock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(item, selectedSize, selectedColorIdx, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col md:flex-row relative text-stone-900 safe-area-bottom sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-quick-view-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media / Gallery Column */}
        <div className="md:w-1/2 p-6 bg-stone-50/60 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-stone-200">
          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 relative shadow-inner border border-stone-200">
            {item.images && item.images.length > 0 && item.images[activeImageIdx] ? (
              <img
                src={item.images[activeImageIdx]}
                alt={item.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#f6f3ed] flex flex-col items-center justify-center p-8 text-center select-none">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-3.5 shadow-2xs">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <span className="font-serif-display text-lg font-bold text-stone-900 max-w-xs leading-snug">
                  {item.name}
                </span>
                <span className="text-[11px] uppercase font-bold tracking-widest text-amber-800 mt-2 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {item.category}
                </span>
                <span className="text-xs text-stone-500 mt-2">Crafted for Yaazh Boutique</span>
              </div>
            )}
            {item.discountPercent && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                Save {item.discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {item.images.length > 1 && (
            <div className="flex items-center gap-3 mt-4">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? 'border-amber-600 ring-2 ring-amber-600/30'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Barcode & SKU display */}
          <div className="w-full mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span className="font-mono">SKU: <span className="text-stone-700 font-semibold">{item.sku}</span></span>
            <span className="font-mono">Barcode: {item.barcode}</span>
          </div>
        </div>

        {/* Details & Action Column */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Category and ratings */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-amber-800 font-semibold uppercase tracking-wider">
                {item.category} • {item.department.toUpperCase()}
              </span>
              <div className="flex items-center gap-1 text-stone-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">{item.rating}</span>
                <span className="text-stone-500">({item.reviewCount} customer reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-stone-900 mt-2 leading-tight">
              {item.name}
            </h2>

            {/* Occasion & Blouse Piece Chips */}
            {(item.occasion || item.blouseIncluded) && (
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {item.occasion && (
                  <span className="text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-0.5 rounded-full">
                    {item.occasion}
                  </span>
                )}
                {item.blouseIncluded && (
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Blouse piece included
                  </span>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-stone-900 font-mono">
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-stone-400 line-through font-mono">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
              <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                In-Stock at Boutique
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 mt-4 leading-relaxed">
              {item.description}
            </p>

            {/* Fabric & Fit badges */}
            <div className="bg-stone-50 rounded-xl p-3.5 mt-4 border border-stone-200 text-xs space-y-2">
              <div className="flex">
                <span className="text-stone-500 w-28 shrink-0 font-medium">Fabric:</span>
                <span className="text-stone-900 font-medium">{item.fabric}</span>
              </div>
              {item.occasion && (
                <div className="flex">
                  <span className="text-stone-500 w-28 shrink-0 font-medium">Occasion:</span>
                  <span className="text-stone-900 font-medium">{item.occasion}</span>
                </div>
              )}
              {item.blouseIncluded && (
                <div className="flex">
                  <span className="text-stone-500 w-28 shrink-0 font-medium">Blouse Piece:</span>
                  <span className="text-emerald-800 font-semibold">Unstitched matching blouse piece included (0.8m)</span>
                </div>
              )}
              {item.department === 'sarees' && (
                <div className="flex">
                  <span className="text-stone-500 w-28 shrink-0 font-medium">Boutique Service:</span>
                  <span className="text-amber-800 font-medium">Saree pre-pleating & box-folding on request (புடவை மடிப்பு சேவை)</span>
                </div>
              )}
              {item.department === 'blouses' && (
                <div className="flex">
                  <span className="text-stone-500 w-28 shrink-0 font-medium">Tailoring Margin:</span>
                  <span className="text-amber-800 font-medium">Generous 2-inch inner fabric seam allowance on both sides (உள் மடிப்பு)</span>
                </div>
              )}
              {item.tags.includes('Handloom') && (
                <div className="flex">
                  <span className="text-stone-500 w-28 shrink-0 font-medium">Authenticity:</span>
                  <span className="text-emerald-800 font-semibold">100% Handloom Certified · நேரடி நெசவாளர் தூய தயாரிப்பு</span>
                </div>
              )}
              {item.fitType && (
                <div className="flex">
                  <span className="text-stone-500 w-28 shrink-0 font-medium">Silhouette:</span>
                  <span className="text-stone-900 font-medium">{item.fitType}</span>
                </div>
              )}
              <div className="flex">
                <span className="text-stone-500 w-28 shrink-0 font-medium">Care Guide:</span>
                <span className="text-stone-600">{item.careGuide}</span>
              </div>
            </div>

            {/* Color Selection */}
            {item.colors.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900 mb-2">
                  <span>Garment Color:</span>
                  <span className="text-amber-800 font-medium">
                    {item.colors[selectedColorIdx]?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.colors.map((color, idx) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedColorIdx === idx
                          ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs font-bold'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-amber-400 hover:text-stone-900'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection & Guide Trigger */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-900 mb-2">
                <div className="flex items-center gap-2">
                  <span>Size:</span>
                  <span className="text-stone-500 font-normal">
                    {availableStock > 0 ? (
                      availableStock <= 4 ? (
                        <span className="text-amber-700 font-medium">Only {availableStock} left at Boutique</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">{availableStock} available</span>
                      )
                    ) : (
                      <span className="text-rose-600">Out of Stock</span>
                    )}
                  </span>
                </div>
                <button
                  id="open-size-guide-modal-btn"
                  onClick={onOpenSizeGuide}
                  className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fitting Guide</span>
                </button>
              </div>

              {isFreeSize ? (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Free Size (Standard Draped Cut)</span>
                  <span className="text-xs text-emerald-700 font-semibold">{availableStock} in stock</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((s) => {
                    const isSelected = selectedSize === s.size;
                    const hasStock = s.stock > 0;
                    return (
                      <button
                        key={s.size}
                        disabled={!hasStock}
                        onClick={() => {
                          setSelectedSize(s.size);
                          setQuantity(1);
                        }}
                        className={`min-w-[48px] py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center ${
                          !hasStock
                            ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-amber-600'
                        }`}
                      >
                        <span>{s.size}</span>
                        <span className="text-[9px] font-normal opacity-80">
                          {hasStock ? `${s.stock} left` : '0'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#D2D2D7] rounded-full bg-white h-[46px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-l-full cursor-pointer font-bold h-full flex items-center justify-center"
                >
                  −
                </button>
                <span className="px-2 py-2 text-sm font-semibold font-mono text-[#1D1D1F]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock}
                  className="px-3.5 py-2 text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-r-full cursor-pointer disabled:opacity-40 font-bold h-full flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <button
                id="quick-view-add-to-cart-btn"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[46px] ${
                  isOutOfStock
                    ? 'bg-[#F5F5F7] border border-[#E8E8ED] text-[#86868B] cursor-not-allowed'
                    : 'bg-[#6D1A33] hover:bg-[#561428] text-white shadow-xs'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? 'Sold Out'
                    : isFreeSize
                    ? `Add to Bag • ${formatPrice(item.price * quantity)}`
                    : `Add (${selectedSize}) to Bag • ${formatPrice(item.price * quantity)}`}
                </span>
              </button>

              <button
                onClick={() => onToggleWishlist(item)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'bg-[#F3E8EB] border-[#6D1A33]/20 text-[#6D1A33]'
                    : 'border-[#E8E8ED] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#6D1A33] text-[#6D1A33]' : ''}`} />
              </button>
            </div>

            {/* Direct WhatsApp Stylist Enquiry for Product */}
            <a
              href={buildLink(
                STORE_CENTRE_INFO.whatsapp,
                `Hello ${STORE_CENTRE_INFO.name}! I would like to ask about "${item.name}" (Size: ${selectedSize}, Price: ${formatPrice(item.price)}). Is this available?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 border border-[#D2D2D7] hover:border-[#2E7D4F] bg-white text-[#2E7D4F] transition-colors cursor-pointer min-h-[42px]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
