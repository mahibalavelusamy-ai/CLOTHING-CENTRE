import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  Ruler, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star,
  Sparkles,
  Check
} from 'lucide-react';
import { ClothingItem, Size } from '../types';

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
  if (!isOpen || !item) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size>(() => {
    const available = item.sizes.find(s => s.stock > 0);
    return available ? available.size : item.sizes[0].size;
  });
  const [quantity, setQuantity] = useState(1);
  const [fittingRoomReserved, setFittingRoomReserved] = useState(false);

  const selectedSizeInfo = item.sizes.find(s => s.size === selectedSize);
  const availableStock = selectedSizeInfo?.stock ?? 0;
  const isOutOfStock = availableStock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(item, selectedSize, selectedColorIdx, quantity);
  };

  const handleReserveTrial = () => {
    setFittingRoomReserved(true);
    setTimeout(() => {
      setFittingRoomReserved(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-quick-view-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media / Gallery Column */}
        <div className="md:w-1/2 p-6 bg-stone-50 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-stone-200">
          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-200 relative shadow-inner">
            <img
              src={item.images[activeImageIdx] || item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
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
                      : 'border-transparent opacity-70 hover:opacity-100'
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
          <div className="w-full mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
            <span className="font-mono">SKU: {item.sku}</span>
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
              <div className="flex items-center gap-1 text-stone-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">{item.rating}</span>
                <span className="text-stone-400">({item.reviewCount} customer reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-stone-900 mt-2 leading-tight">
              {item.name}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-stone-900">
                ${item.price.toFixed(2)}
              </span>
              {item.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                In-Stock at Centre
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 mt-4 leading-relaxed">
              {item.description}
            </p>

            {/* Fabric & Fit badges */}
            <div className="bg-stone-50 rounded-xl p-3 mt-4 border border-stone-200/80 text-xs space-y-1.5">
              <div className="flex">
                <span className="text-stone-500 w-24 shrink-0 font-medium">Fabric:</span>
                <span className="text-stone-800 font-medium">{item.fabric}</span>
              </div>
              <div className="flex">
                <span className="text-stone-500 w-24 shrink-0 font-medium">Silhouette:</span>
                <span className="text-stone-800 font-medium">{item.fitType}</span>
              </div>
              <div className="flex">
                <span className="text-stone-500 w-24 shrink-0 font-medium">Care Guide:</span>
                <span className="text-stone-700">{item.careGuide}</span>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2">
                <span>Garment Color:</span>
                <span className="text-amber-900 font-medium">
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
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
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

            {/* Size Selection & Guide Trigger */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2">
                <div className="flex items-center gap-2">
                  <span>Choose Size:</span>
                  <span className="text-stone-500 font-normal">
                    {availableStock > 0 ? (
                      availableStock <= 4 ? (
                        <span className="text-rose-600 font-medium">Only {availableStock} left at Centre</span>
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
                  className="text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fit Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
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
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center ${
                        !hasStock
                          ? 'border-stone-200 bg-stone-100 text-stone-300 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900/20'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
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
            </div>

            {/* Quantity Selector */}
            <div className="mt-5 flex items-center gap-4">
              <span className="text-xs font-semibold text-stone-800">Quantity:</span>
              <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40 cursor-pointer font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-stone-900 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= availableStock}
                  onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40 cursor-pointer font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-5 border-t border-stone-200 space-y-3">
            <div className="flex items-center gap-3">
              {/* Add to Bag */}
              <button
                id="modal-add-to-bag-btn"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 hover:bg-amber-600 text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out in this Size' : `Add ${quantity} to Shopping Bag`}</span>
              </button>

              {/* Wishlist toggle */}
              <button
                id="modal-wishlist-toggle-btn"
                onClick={() => onToggleWishlist(item)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Reserve for In-Store Fitting Room */}
            <button
              id="reserve-fitting-room-btn"
              onClick={handleReserveTrial}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                fittingRoomReserved
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {fittingRoomReserved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Reserved at Trial Suite #3! Show your name at front desk.</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reserve Size {selectedSize} for Fitting Room Trial at Centre</span>
                </>
              )}
            </button>

            {/* Centre Guarantee Perks */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-stone-500 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>2-Hour Centre Pickup</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Free In-Store Alteration</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>30-Day Centre Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
