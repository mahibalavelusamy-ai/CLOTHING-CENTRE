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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border flex flex-col md:flex-row relative text-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-quick-view-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-surface-2 hover:bg-surface text-text-muted hover:text-text border border-border flex items-center justify-center transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media / Gallery Column */}
        <div className="md:w-1/2 p-6 bg-surface-2/60 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-border">
          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-2 relative shadow-inner border border-border">
            {item.images && item.images.length > 0 && item.images[activeImageIdx] ? (
              <img
                src={item.images[activeImageIdx]}
                alt={item.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-surface-2 flex flex-col items-center justify-center p-8 text-center select-none">
                <div className="w-14 h-14 rounded-full bg-pink/15 border border-pink/30 text-pink flex items-center justify-center mb-3.5 shadow-2xs">
                  <Sparkles className="w-6 h-6 text-pink" />
                </div>
                <span className="font-serif-display text-lg font-bold text-text max-w-xs leading-snug">
                  {item.name}
                </span>
                <span className="text-[11px] uppercase font-bold tracking-widest text-pink mt-2 bg-pink/10 px-2.5 py-0.5 rounded-full border border-pink/30">
                  {item.category}
                </span>
                <span className="text-xs text-text-muted mt-2">Crafted for Yaazh Boutique</span>
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
                      ? 'border-pink ring-2 ring-pink/30'
                      : 'border-border opacity-70 hover:opacity-100'
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
          <div className="w-full mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
            <span className="font-mono">SKU: <span className="text-pink-tint">{item.sku}</span></span>
            <span className="font-mono">Barcode: {item.barcode}</span>
          </div>
        </div>

        {/* Details & Action Column */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Category and ratings */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-pink font-semibold uppercase tracking-wider">
                {item.category} • {item.department.toUpperCase()}
              </span>
              <div className="flex items-center gap-1 text-text">
                <Star className="w-4 h-4 fill-pink text-pink" />
                <span className="font-bold">{item.rating}</span>
                <span className="text-text-muted">({item.reviewCount} customer reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-text mt-2 leading-tight">
              {item.name}
            </h2>

            {/* Occasion & Blouse Piece Chips */}
            {(item.occasion || item.blouseIncluded) && (
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {item.occasion && (
                  <span className="text-xs font-semibold bg-surface-2 text-text border border-border px-2.5 py-0.5 rounded-full">
                    {item.occasion}
                  </span>
                )}
                {item.blouseIncluded && (
                  <span className="text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Blouse piece included
                  </span>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-text font-mono">
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-text-muted/60 line-through font-mono">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
              <span className="text-xs text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                In-Stock at Boutique
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-text-muted mt-4 leading-relaxed">
              {item.description}
            </p>

            {/* Fabric & Fit badges (Silhouette hidden when fitType is missing) */}
            <div className="bg-surface-2 rounded-xl p-3 mt-4 border border-border text-xs space-y-1.5">
              <div className="flex">
                <span className="text-text-muted w-24 shrink-0 font-medium">Fabric:</span>
                <span className="text-text font-medium">{item.fabric}</span>
              </div>
              {item.fitType && (
                <div className="flex">
                  <span className="text-text-muted w-24 shrink-0 font-medium">Silhouette:</span>
                  <span className="text-text font-medium">{item.fitType}</span>
                </div>
              )}
              <div className="flex">
                <span className="text-text-muted w-24 shrink-0 font-medium">Care Guide:</span>
                <span className="text-text-muted">{item.careGuide}</span>
              </div>
            </div>

            {/* Color Selection */}
            {item.colors.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold text-text mb-2">
                  <span>Garment Color:</span>
                  <span className="text-pink font-medium">
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
                          ? 'border-pink bg-pink/15 text-pink shadow-xs font-bold'
                          : 'border-border bg-surface-2 text-text-muted hover:border-pink/40 hover:text-text'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-border shrink-0"
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
              <div className="flex items-center justify-between text-xs font-semibold text-text mb-2">
                <div className="flex items-center gap-2">
                  <span>Size:</span>
                  <span className="text-text-muted font-normal">
                    {availableStock > 0 ? (
                      availableStock <= 4 ? (
                        <span className="text-rose-400 font-medium">Only {availableStock} left at Boutique</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">{availableStock} available</span>
                      )
                    ) : (
                      <span className="text-rose-400">Out of Stock</span>
                    )}
                  </span>
                </div>
                <button
                  id="open-size-guide-modal-btn"
                  onClick={onOpenSizeGuide}
                  className="text-pink hover:text-pink-tint font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fitting Guide</span>
                </button>
              </div>

              {isFreeSize ? (
                <div className="p-3 bg-surface-2 border border-border rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Free Size (Standard Draped Cut)</span>
                  <span className="text-xs text-emerald-400 font-semibold">{availableStock} in stock</span>
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
                            ? 'border-border bg-surface-2/40 text-text-muted/40 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-pink text-white border-pink ring-2 ring-pink/20 shadow-xs'
                            : 'border-border bg-surface-2 text-text hover:border-pink'
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
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg bg-surface-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-text-muted hover:bg-surface hover:text-text rounded-l-lg cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold font-mono text-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock}
                  className="px-3 py-2 text-text-muted hover:bg-surface hover:text-text rounded-r-lg cursor-pointer disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                id="quick-view-add-to-cart-btn"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm uppercase tracking-wider ${
                  isOutOfStock
                    ? 'bg-surface-2 border border-border text-text-muted/50 cursor-not-allowed'
                    : 'bg-pink hover:bg-pink-strong text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? 'Out of Stock'
                    : isFreeSize
                    ? `Add to Bag • ${formatPrice(item.price * quantity)}`
                    : `Add (${selectedSize}) to Bag • ${formatPrice(item.price * quantity)}`}
                </span>
              </button>

              <button
                onClick={() => onToggleWishlist(item)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'bg-pink/15 border-pink text-pink'
                    : 'border-border bg-surface-2 text-text-muted hover:text-pink hover:bg-surface'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink text-pink' : ''}`} />
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
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-800/80 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
