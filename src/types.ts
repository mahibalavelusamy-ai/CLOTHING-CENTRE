export type Department = 'all' | 'sarees' | 'blouses' | 'coords' | 'salwar' | 'lounge' | 'decor';

export type Size = 
  | 'Free Size' 
  | 'S' 
  | 'M' 
  | 'L' 
  | 'XL' 
  | 'XXL' 
  | '3XL' 
  | '32' 
  | '34' 
  | '36' 
  | '38' 
  | '40' 
  | '42' 
  | '44' 
  | '46';

export interface ColorOption {
  name: string;
  hex: string;
  image?: string;
}

export interface SizeStock {
  size: Size;
  stock: number;
}

export interface ClothingItem {
  id: string;
  sku: string;
  name: string;
  department: Department;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  colors: ColorOption[];
  sizes: SizeStock[];
  images: string[];
  description: string;
  fabric: string;
  careGuide: string;
  fitType?: 'Straight Cut' | 'A-Line' | 'Anarkali Flare' | 'Regular Fit' | 'Relaxed Fit';
  occasion?: 'Daily Wear' | 'Festive' | 'Wedding' | 'Party' | 'Office';
  blouseIncluded?: boolean;
  tags: ('New Arrival' | 'Bestseller' | 'Festive Special' | 'Handloom' | 'Sale')[];
  inStockTotal: number;
  barcode: string;
}

export interface CartItem {
  item: ClothingItem;
  selectedSize: Size;
  selectedColor: ColorOption;
  quantity: number;
}

export interface FilterState {
  department: Department;
  category: string;
  sizes: Size[];
  priceRange: [number, number];
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStockOnly: boolean;
}

export type UserRole = 'customer' | 'staff' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
  address?: string;
}

export interface CustomerOrder {
  id: string;
  createdAt: string;
  customerUid?: string;
  items: CartItem[];
  subtotal: number;
  discountApplied: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    deliveryType: 'store_pickup' | 'home_delivery';
    pickupSlot?: string;
    shippingAddress?: string;
    notes?: string;
  };
  paymentMethod: 'card' | 'upi' | 'cash_counter';
  status: 'Confirmed' | 'Ready for Pickup' | 'Dispatched' | 'Completed' | 'Cancelled';
}
