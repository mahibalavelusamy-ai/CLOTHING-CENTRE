import { ClothingItem } from '../types';

/**
 * Curated authentic high-resolution image galleries for all stock items.
 */
export const STOCK_ITEM_IMAGES: Record<string, string[]> = {
  'bq-001': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-002': [
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-003': [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-004': [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-005': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-006': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-007': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-008': [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-009': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-010': [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-011': [
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
  ],
  'bq-012': [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80'
  ],
  'yb-krt-01': ['/products/kurtis/silver-gradient-kurti.jpg'],
  'yb-krt-02': ['/products/kurtis/royal-purple-floral-kurti.jpg'],
  'yb-krt-03': ['/products/kurtis/black-botanical-dori-kurti.jpg'],
  'yb-krt-04': ['/products/kurtis/black-organza-pastel-rose-kurti.jpg'],
  'yb-krt-05': ['/products/kurtis/copper-bronze-organza-kurti.jpg'],
  'yb-krt-06': ['/products/kurtis/ivory-teal-blossom-kurti.jpg'],
  'yb-krt-07': ['/products/kurtis/navy-blue-zari-butti-kurti.jpg'],
  'yb-krt-08': ['/products/kurtis/ivory-botanical-dori-kurti.jpg'],
};

/**
 * Ensures a garment has rich imagery. If its images array is empty,
 * it pulls from the verified STOCK_ITEM_IMAGES registry.
 */
export function ensureItemImages(item: ClothingItem): ClothingItem {
  if (item.images && item.images.length > 0 && item.images.some(img => img && img.trim() !== '')) {
    return item;
  }
  const fallback = STOCK_ITEM_IMAGES[item.id];
  if (fallback && fallback.length > 0) {
    return { ...item, images: fallback };
  }
  return {
    ...item,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ]
  };
}

/**
 * Curated authentic boutique inventory for Yaazh Boutique, Oddanchatram.
 * Real items are also synchronized in real-time with Firestore.
 */
export const INITIAL_CLOTHING_ITEMS: ClothingItem[] = [
  // 12 ACTIVE BOUTIQUE INVENTORY STOCKS (WITH AUTHENTIC CURATED IMAGES)
  {
    id: 'bq-001',
    sku: 'IN-SAR-001',
    barcode: '8901234000018',
    name: 'Kanjivaram Zari Woven Pure Silk Saree',
    department: 'sarees',
    category: 'Silk Sarees',
    price: 8499,
    originalPrice: 9999,
    discountPercent: 15,
    rating: 4.8,
    reviewCount: 64,
    colors: [
      { name: 'Maroon', hex: '#800000' },
      { name: 'Peacock Blue', hex: '#005f73' },
      { name: 'Mustard Gold', hex: '#d4a373' }
    ],
    sizes: [
      { size: 'Free Size', stock: 11 }
    ],
    inStockTotal: 11,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Traditional Kanjivaram silk saree adorned with intricate gold zari brocade work along the borders and pallu. Contrast pallu detailing crafted for weddings and festive moments.',
    fabric: 'Pure mulberry silk with real metallic zari weave.',
    careGuide: 'Dry clean only. Store wrapped in soft muslin cloth away from direct sunlight.',
    fitType: 'Regular Fit',
    occasion: 'Wedding',
    blouseIncluded: true,
    tags: ['Bestseller', 'Handloom', 'Sale'],
  },
  {
    id: 'bq-002',
    sku: 'IN-SAR-002',
    barcode: '8901234000025',
    name: 'Handloom Chanderi Floral Cotton Saree',
    department: 'sarees',
    category: 'Cotton Sarees',
    price: 1850,
    rating: 4.5,
    reviewCount: 42,
    colors: [
      { name: 'Sage Green', hex: '#8a9a5b' },
      { name: 'Dusty Rose', hex: '#c58386' }
    ],
    sizes: [
      { size: 'Free Size', stock: 18 }
    ],
    inStockTotal: 18,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Breathable hand-spun Chanderi cotton saree finished with subtle hand-block botanical motifs. Lightweight and effortless for long office days.',
    fabric: '100% combed cotton with natural eco-friendly dyes.',
    careGuide: 'Hand wash gently in cold water with mild detergent. Dry in shade.',
    fitType: 'Regular Fit',
    occasion: 'Office',
    blouseIncluded: true,
    tags: ['Handloom', 'New Arrival'],
  },
  {
    id: 'bq-003',
    sku: 'IN-SAR-003',
    barcode: '8901234000032',
    name: 'Embroidered Shimmer Georgette Saree',
    department: 'sarees',
    category: 'Georgette & Chiffon',
    price: 3450,
    rating: 4.2,
    reviewCount: 29,
    colors: [
      { name: 'Midnight Navy', hex: '#1d2a44' },
      { name: 'Plum Purple', hex: '#5c1d48' }
    ],
    sizes: [
      { size: 'Free Size', stock: 10 }
    ],
    inStockTotal: 10,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Fluid lightweight georgette saree accented with tonal micro-sequin borders and scalloped edges. Drapes gracefully with crisp pleats for cocktail evenings.',
    fabric: 'Viscose georgette with tonal embroidery.',
    careGuide: 'Dry clean recommended. Warm iron on reverse side.',
    fitType: 'Regular Fit',
    occasion: 'Party',
    blouseIncluded: false,
    tags: ['New Arrival'],
  },
  {
    id: 'bq-004',
    sku: 'IN-SAR-004',
    barcode: '8901234000049',
    name: 'Pre-Pleated Ready-to-Wear Party Saree',
    department: 'sarees',
    category: 'Party Wear Sarees',
    price: 4200,
    rating: 4.6,
    reviewCount: 38,
    colors: [
      { name: 'Ruby Wine', hex: '#722f37' },
      { name: 'Emerald Green', hex: '#00563b' },
      { name: 'Champagne Gold', hex: '#d2b55b' }
    ],
    sizes: [
      { size: 'Free Size', stock: 8 }
    ],
    inStockTotal: 8,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Contemporary pre-stitched party saree featuring metallic foil accents and an adjustable waistband closure. Drapes into flawless pleats in under sixty seconds.',
    fabric: 'Satin crepe blend with metallic foil finishing.',
    careGuide: 'Gentle dry clean only.',
    fitType: 'Regular Fit',
    occasion: 'Festive',
    blouseIncluded: true,
    tags: ['Festive Special'],
  },
  {
    id: 'bq-005',
    sku: 'IN-SAR-005',
    barcode: '8901234000056',
    name: 'Banarasi Brocade Pure Tanchoi Silk Saree',
    department: 'sarees',
    category: 'Silk Sarees',
    price: 12500,
    rating: 4.9,
    reviewCount: 75,
    colors: [
      { name: 'Rani Pink', hex: '#c71585' },
      { name: 'Peacock Green', hex: '#006d5b' }
    ],
    sizes: [
      { size: 'Free Size', stock: 0 }
    ],
    inStockTotal: 0,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Heirloom-grade Banarasi Tanchoi silk saree woven with antique gold flora and paisley borders. A collector masterpiece crafted for regal weddings.',
    fabric: 'Pure Katan silk with gold and silver zari weave.',
    careGuide: 'Professional dry clean only. Roll periodically to preserve folds.',
    fitType: 'Regular Fit',
    occasion: 'Wedding',
    blouseIncluded: true,
    tags: ['Bestseller', 'Handloom'],
  },
  {
    id: 'bq-006',
    sku: 'IN-KUR-001',
    barcode: '8901234000063',
    name: 'Mandarin Collar Printed Straight Cotton Kurti',
    department: 'kurtis',
    category: 'Kurtis',
    price: 890,
    originalPrice: 1190,
    discountPercent: 25,
    rating: 4.4,
    reviewCount: 51,
    colors: [
      { name: 'Indigo Blue', hex: '#1f3c88' },
      { name: 'Rust Orange', hex: '#b7410e' },
      { name: 'Mustard', hex: '#e1ad01' }
    ],
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 0 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 6 }
    ],
    inStockTotal: 19,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Crisp everyday straight kurti cut from premium South cotton with side slits and wooden button details. Easy to pair with cropped trousers or leggings.',
    fabric: '100% breathable cambric cotton.',
    careGuide: 'Machine wash gentle cold. Iron while slightly damp.',
    fitType: 'Straight Cut',
    occasion: 'Office',
    tags: ['Sale', 'New Arrival'],
  },
  {
    id: 'bq-007',
    sku: 'IN-CHU-001',
    barcode: '8901234000070',
    name: 'Chanderi Embroidered Kurta & Chudidar Set',
    department: 'kurtis',
    category: 'Chudidar Sets',
    price: 2150,
    rating: 4.7,
    reviewCount: 36,
    colors: [
      { name: 'Bottle Green', hex: '#097969' },
      { name: 'Deep Maroon', hex: '#630330' }
    ],
    sizes: [
      { size: 'S', stock: 1 },
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 }
    ],
    inStockTotal: 3,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Graceful three-piece ethnic suit comprising an embroidered calf-length kurta, matching stretch chudidar, and woven tissue dupatta. Perfect for festivals and family gatherings.',
    fabric: 'Chanderi silk-cotton blend with matching cotton lining.',
    careGuide: 'Dry clean only to maintain zari luster.',
    fitType: 'A-Line',
    occasion: 'Festive',
    tags: ['Festive Special', 'Bestseller'],
  },
  {
    id: 'bq-008',
    sku: 'IN-ANA-001',
    barcode: '8901234000087',
    name: 'Floor-Length Flared Georgette Anarkali Gown',
    department: 'kurtis',
    category: 'Anarkali Suits',
    price: 2850,
    rating: 4.6,
    reviewCount: 44,
    colors: [
      { name: 'Teal Green', hex: '#006666' },
      { name: 'Dusty Rose', hex: '#c58386' },
      { name: 'Maroon', hex: '#800000' }
    ],
    sizes: [
      { size: 'M', stock: 6 },
      { size: 'L', stock: 9 },
      { size: 'XL', stock: 7 },
      { size: 'XXL', stock: 4 }
    ],
    inStockTotal: 26,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Dramatic twenty-kalidar flared Anarkali embellished with gota patti neck embroidery and heavy border lace. Includes an airy organza dupatta.',
    fabric: 'Heavy faux georgette with santoon inner lining.',
    careGuide: 'Dry clean recommended.',
    fitType: 'Anarkali Flare',
    occasion: 'Wedding',
    tags: ['Bestseller'],
  },
  {
    id: 'bq-009',
    sku: 'IN-PAL-001',
    barcode: '8901234000094',
    name: 'Floral Rayon Kurti with Flared Palazzo Set',
    department: 'kurtis',
    category: 'Palazzo & Pant Sets',
    price: 1290,
    originalPrice: 1690,
    discountPercent: 24,
    rating: 4.3,
    reviewCount: 31,
    colors: [
      { name: 'Peacock Blue', hex: '#005f73' },
      { name: 'Mustard', hex: '#e1ad01' }
    ],
    sizes: [
      { size: 'S', stock: 7 },
      { size: 'M', stock: 11 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 3 }
    ],
    inStockTotal: 34,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Comfortable daywear ensemble pairing a geometric foil-printed kurti with elasticated wide-leg palazzo pants. Soft, breathable, and easy to maintain.',
    fabric: '100% premium Liva rayon.',
    careGuide: 'Cold gentle wash. Do not bleach.',
    fitType: 'Relaxed Fit',
    occasion: 'Daily Wear',
    tags: ['Sale'],
  },
  {
    id: 'bq-010',
    sku: 'IN-KID-001',
    barcode: '8901234000100',
    name: 'Traditional Pattu Pavadai Silk Lehenga Set',
    department: 'kids',
    category: 'Girls Ethnic Wear',
    price: 1650,
    rating: 4.8,
    reviewCount: 40,
    colors: [
      { name: 'Mustard Gold', hex: '#d4a373' },
      { name: 'Magenta Pink', hex: '#c71585' },
      { name: 'Emerald Green', hex: '#00563b' }
    ],
    sizes: [
      { size: '2-3Y', stock: 6 },
      { size: '4-5Y', stock: 8 },
      { size: '6-7Y', stock: 5 },
      { size: '8-9Y', stock: 4 }
    ],
    inStockTotal: 23,
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Authentic South Indian pattu pavadai stitched in Art Silk with contrast zari borders and soft cotton lining for infant and toddler comfort.',
    fabric: 'Art silk jacquard with pure cotton lining.',
    careGuide: 'Hand wash gently in cold water or dry clean.',
    fitType: 'Regular Fit',
    occasion: 'Festive',
    tags: ['Festive Special', 'Bestseller'],
  },
  {
    id: 'bq-011',
    sku: 'IN-KID-002',
    barcode: '8901234000117',
    name: 'Tiered Cotton Party Frock with Bow',
    department: 'kids',
    category: 'Girls Frocks',
    price: 790,
    originalPrice: 990,
    discountPercent: 20,
    rating: 4.5,
    reviewCount: 22,
    colors: [
      { name: 'Dusty Rose', hex: '#c58386' },
      { name: 'Sage Green', hex: '#8a9a5b' }
    ],
    sizes: [
      { size: '1-2Y', stock: 7 },
      { size: '3-4Y', stock: 9 },
      { size: '5-6Y', stock: 6 }
    ],
    inStockTotal: 22,
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Whimsical tiered party dress crafted with breathable cotton layers and a satin back tie bow. Soft seams prevent irritation during celebrations.',
    fabric: '100% fine cotton voile with soft muslin underlay.',
    careGuide: 'Machine wash delicate cycle. Tumble dry low.',
    fitType: 'A-Line',
    occasion: 'Party',
    tags: ['Sale', 'New Arrival'],
  },
  {
    id: 'bq-012',
    sku: 'IN-KID-003',
    barcode: '8901234000124',
    name: 'Silk Blend Jacquard Kurta Pyjama with Nehru Jacket',
    department: 'kids',
    category: 'Boys Kurta Sets',
    price: 1950,
    rating: 4.7,
    reviewCount: 35,
    colors: [
      { name: 'Maroon', hex: '#800000' },
      { name: 'Peacock Blue', hex: '#005f73' }
    ],
    sizes: [
      { size: '3-4Y', stock: 5 },
      { size: '5-6Y', stock: 7 },
      { size: '7-8Y', stock: 4 },
      { size: '9-10Y', stock: 3 }
    ],
    inStockTotal: 19,
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Dapper three-piece festive attire featuring a mandarin collar kurta, elasticated churidar pyjama, and a brocade woven Nehru jacket.',
    fabric: 'Dupion silk blend with soft cotton-rich inner lining.',
    careGuide: 'Dry clean recommended.',
    fitType: 'Regular Fit',
    occasion: 'Wedding',
    tags: ['Festive Special'],
  },

  // SAREES (HERITAGE SILKS & COTTONS)
  {
    id: 'yb-saree-01',
    sku: 'YB-SAR-KANJI-01',
    name: 'Kanjivaram Pure Silk Handloom Saree with Mayilkan & Korvai Zari Border',
    department: 'sarees',
    category: 'Handloom Sarees',
    price: 4850,
    originalPrice: 6200,
    discountPercent: 22,
    rating: 4.9,
    reviewCount: 38,
    colors: [
      { name: 'Kumkum Wine (குங்கும சிவப்பு)', hex: '#6b1124' },
      { name: 'Mayil Kazhuthu Peacock Green (மயில் கழுத்து)', hex: '#0f4d43' },
      { name: 'Santhanam Mustard (சந்தன மஞ்சள்)', hex: '#c98a2c' }
    ],
    sizes: [
      { size: 'Free Size', stock: 12 }
    ],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Masterfully handwoven Kanjivaram silk saree featuring traditional temple korvai borders, peacock motifs, and rich floral zari pallu. Comes with unstitched matching pure silk blouse piece (0.8m). In-store saree pre-pleating available.',
    fabric: 'Pure Handloom Silk Blend with Gold Zari',
    careGuide: 'Dry Clean Only. Store wrapped in pure cotton or muslin fabric.',
    fitType: 'Regular Fit',
    occasion: 'Wedding',
    blouseIncluded: true,
    tags: ['Handloom', 'Bestseller', 'Festive Special'],
    inStockTotal: 12,
    barcode: '8907833982001'
  },
  {
    id: 'yb-saree-02',
    sku: 'YB-SAR-TUSS-02',
    name: 'Pure Tussar Ghicha Silk Hand Block Kalamkari Saree',
    department: 'sarees',
    category: 'Tussar Sarees',
    price: 3650,
    originalPrice: 4500,
    discountPercent: 19,
    rating: 4.8,
    reviewCount: 29,
    colors: [
      { name: 'Natural Ochre & Neelam Indigo', hex: '#c59b27' },
      { name: 'Terracotta Madder Rust', hex: '#b84a39' }
    ],
    sizes: [
      { size: 'Free Size', stock: 8 }
    ],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Authentic wild Tussar Ghicha silk with earthy natural texture and intricate hand-carved wooden block Kalamkari prints. Breathable drape suited for pooja rituals, high-tea, and festive gatherings.',
    fabric: '100% Pure Tussar Ghicha Silk',
    careGuide: 'Gentle dry clean recommended. Avoid direct perfume spray on fabric.',
    fitType: 'Regular Fit',
    occasion: 'Festive',
    blouseIncluded: true,
    tags: ['Handloom', 'New Arrival'],
    inStockTotal: 8,
    barcode: '8907833982002'
  },
  {
    id: 'yb-saree-03',
    sku: 'YB-SAR-CHETT-03',
    name: 'Chettinad Heritage Pure Cotton Saree with Rudraksha Temple Border',
    department: 'sarees',
    category: 'Cotton Sarees',
    price: 1850,
    originalPrice: 2200,
    discountPercent: 16,
    rating: 4.9,
    reviewCount: 45,
    colors: [
      { name: 'Manjal Yellow & Kili Pachai (மஞ்சள் / கிளிப்பச்சை)', hex: '#e5a93c' },
      { name: 'Sindhoori Maroon & Temple Korvai (குங்கும சிவப்பு)', hex: '#7a1c1c' }
    ],
    sizes: [
      { size: 'Free Size', stock: 16 }
    ],
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Traditional Tamil Nadu heritage Chettinad weave with high count breathable combed cotton, classic rudraksha & korvai borders, offering supreme all-day summer comfort.',
    fabric: '100% Fine Combed Chettinad Cotton',
    careGuide: 'First wash dry clean or cold salt water dip; gentle hand wash thereafter.',
    fitType: 'Regular Fit',
    occasion: 'Daily Wear',
    blouseIncluded: true,
    tags: ['Handloom', 'Bestseller'],
    inStockTotal: 16,
    barcode: '8907833982003'
  },
  {
    id: 'yb-saree-04',
    sku: 'YB-SAR-ORGAN-04',
    name: 'Sheer Organza Silk Floral Resham Saree with Scallop Zari Border',
    department: 'sarees',
    category: 'Silk Blend Sarees',
    price: 2950,
    originalPrice: 3800,
    discountPercent: 22,
    rating: 4.7,
    reviewCount: 24,
    colors: [
      { name: 'Gulabi Rose (குலாபி ரோஸ்)', hex: '#e8a598' },
      { name: 'Neelambari Lavender (நீலாம்பரி)', hex: '#b39ddb' }
    ],
    sizes: [
      { size: 'Free Size', stock: 9 }
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Dreamy semi-sheer organza silk saree embellished with delicate resham thread embroidery and cutwork scalloped borders. Contemporary pastel aesthetic for wedding receptions and evening sangeet.',
    fabric: 'Pure Sheer Organza with Resham Embroidery',
    careGuide: 'Strictly dry clean only. Steam iron on reverse.',
    fitType: 'Regular Fit',
    occasion: 'Party',
    blouseIncluded: true,
    tags: ['New Arrival'],
    inStockTotal: 9,
    barcode: '8907833982004'
  },

  // BLOUSES & CROP TOPS
  {
    id: 'yb-crop-top-01',
    sku: 'YB-CRP-IKAT-BLU-01',
    name: 'Cotton Ikat Chevron V-Neck Crop Top Blouse',
    department: 'blouses',
    category: 'Crop Tops',
    price: 1090,
    originalPrice: 1450,
    discountPercent: 25,
    rating: 4.9,
    reviewCount: 38,
    colors: [
      { name: 'Indigo Blue & White Zigzag', hex: '#24486d' }
    ],
    sizes: [
      { size: '32', stock: 4 },
      { size: '34', stock: 6 },
      { size: '36', stock: 8 },
      { size: '38', stock: 7 },
      { size: '40', stock: 5 },
      { size: '42', stock: 3 }
    ],
    images: [
      '/products/crop-tops/crop-top-blue-chevron.jpg'
    ],
    description: 'Artisan handloom cotton crop top blouse featuring bold indigo chevron Ikat weave, rustic wooden buttons, tailored V-neckline, and comfort elbow sleeves with 2-inch alteration margins.',
    fabric: '100% Pure Handloom Cotton with Wooden Button Placket',
    careGuide: 'Gentle hand wash in cold water with mild detergent. Dry in shade.',
    fitType: 'Regular Fit',
    occasion: 'Daily Wear',
    tags: ['Bestseller', 'Handloom', 'New Arrival'],
    inStockTotal: 33,
    barcode: '8907833982015'
  },
  {
    id: 'yb-crop-top-02',
    sku: 'YB-CRP-BLOCK-LEAF-02',
    name: 'Hand Block Printed Botanical Leaf Cotton Crop Top',
    department: 'blouses',
    category: 'Crop Tops',
    price: 1090,
    originalPrice: 1399,
    discountPercent: 22,
    rating: 4.8,
    reviewCount: 42,
    colors: [
      { name: 'Haldi Mustard Leaf (மஞ்சள்)', hex: '#d4af37' },
      { name: 'Madder Maroon Kalamkari (செம்மண் சிவப்பு)', hex: '#7a1f28' },
      { name: 'Chandan Ivory & Black (சந்தன வெள்ளை)', hex: '#eae6df' },
      { name: 'Kari Midnight Black (கருப்பு)', hex: '#212121' }
    ],
    sizes: [
      { size: '32', stock: 3 },
      { size: '34', stock: 5 },
      { size: '36', stock: 9 },
      { size: '38', stock: 8 },
      { size: '40', stock: 4 },
      { size: '42', stock: 2 }
    ],
    images: [
      '/products/crop-tops/crop-top-mustard-leaf.jpg',
      '/products/crop-tops/crop-top-maroon-kalamkari.jpg',
      '/products/crop-tops/crop-top-ivory-black.jpg',
      '/products/crop-tops/crop-top-black-leaf.jpg',
      '/products/crop-tops/crop-tops-collection-banner.png'
    ],
    description: 'Handcrafted pure cotton crop top blouse with delicate block-printed botanical motifs, wooden button-down front, breathable pure cotton lining, and generous 2-inch inner alteration margin (உள் மடிப்பு) for pairing with sarees, lehengas, or high-waist skirts.',
    fabric: '100% Block Printed Cotton with Pure Cotton Lining',
    careGuide: 'Hand wash separately with cold water. Avoid direct harsh sunlight.',
    fitType: 'Regular Fit',
    occasion: 'Festive',
    tags: ['Bestseller', 'Festive Special', 'New Arrival'],
    inStockTotal: 31,
    barcode: '8907833982016'
  },
  {
    id: 'yb-blouse-01',
    sku: 'YB-BLS-AJRAKH-01',
    name: 'Ajrakh Hand Block Printed Boat Neck Designer Blouse with Latkans',
    department: 'blouses',
    category: 'Block Printed Blouses',
    price: 1350,
    originalPrice: 1699,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 31,
    colors: [
      { name: 'Neelam Indigo & Madder (நீலம் & சிவப்பு)', hex: '#1f3a52' },
      { name: 'Earth Black & Rust (செம்மண்)', hex: '#2c2523' }
    ],
    sizes: [
      { size: '34', stock: 4 },
      { size: '36', stock: 6 },
      { size: '38', stock: 8 },
      { size: '40', stock: 5 },
      { size: '42', stock: 3 }
    ],
    images: [
      '/products/crop-tops/crop-top-maroon-kalamkari.jpg',
      '/products/crop-tops/crop-top-black-leaf.jpg',
      '/products/crop-tops/crop-tops-collection-banner.png'
    ],
    description: 'Pre-stitched pure cotton Ajrakh blouse tailored with front boat neck, deep back cut with decorative latkans, and 2-inch internal alteration margins (உள் மடிப்பு).',
    fabric: '100% Ajrakh Hand-block Printed Cotton with Pure Cotton Lining',
    careGuide: 'Dry clean recommended for first two washes. Hand wash separately.',
    fitType: 'Regular Fit',
    occasion: 'Festive',
    tags: ['Bestseller', 'Handloom'],
    inStockTotal: 26,
    barcode: '8907833982005'
  },
  {
    id: 'yb-blouse-02',
    sku: 'YB-BLS-ZARDOZI-02',
    name: 'South Indian Raw Silk Zardozi Hand Embroidered Bridal Blouse',
    department: 'blouses',
    category: 'Readymade Blouses',
    price: 2450,
    originalPrice: 3200,
    discountPercent: 23,
    rating: 5.0,
    reviewCount: 19,
    colors: [
      { name: 'Maragatham Emerald Green (மரகத பச்சை)', hex: '#0f5238' },
      { name: 'Manickam Ruby Wine (மாணிக்க சிவப்பு)', hex: '#6a0dad' },
      { name: 'Swarnam Antique Gold (தங்க ஜரிகை)', hex: '#c5a059' }
    ],
    sizes: [
      { size: '34', stock: 3 },
      { size: '36', stock: 5 },
      { size: '38', stock: 6 },
      { size: '40', stock: 4 }
    ],
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Rich South Indian raw silk bridal blouse embellished with authentic zardozi, kasab thread, and moti handwork on sleeves and neckline for Muhurtham rituals.',
    fabric: 'Pure Raw Silk with Padded Cups & Cotton Lining',
    careGuide: 'Dry clean only. Keep away from water and direct perfume.',
    fitType: 'Regular Fit',
    occasion: 'Wedding',
    tags: ['Festive Special', 'New Arrival'],
    inStockTotal: 18,
    barcode: '8907833982006'
  },

  // CO-ORDS
  {
    id: 'yb-coord-01',
    sku: 'YB-CRD-LINEN-01',
    name: 'Linen Kurta & Tapered Trouser Co-ord Set',
    department: 'coords',
    category: 'Co-ord Sets',
    price: 2250,
    originalPrice: 2800,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 42,
    colors: [
      { name: 'Earthy Sage Green (பச்சை)', hex: '#6b7c65' },
      { name: 'Terracotta Madder (செம்மண்)', hex: '#ad503d' },
      { name: 'Chandan Sand (சந்தனம்)', hex: '#ded6c7' }
    ],
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 7 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 6 },
      { size: 'XXL', stock: 3 }
    ],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Effortlessly elegant 2-piece linen blend tunic top paired with matching ankle-length trousers with deep pockets. Ideal for work, temple visits, or travel.',
    fabric: 'Breathable Pure Linen Cotton Blend',
    careGuide: 'Machine wash on delicate cold cycle. Warm iron while slightly damp.',
    fitType: 'Relaxed Fit',
    occasion: 'Office',
    tags: ['Bestseller'],
    inStockTotal: 28,
    barcode: '8907833982007'
  },

  // SALWAR MATERIALS
  {
    id: 'yb-salwar-01',
    sku: 'YB-SLW-CHAND-01',
    name: 'Chanderi Silk Salwar Suit Material with Banarasi Zari Dupatta',
    department: 'salwar',
    category: 'Salwar Materials',
    price: 2190,
    originalPrice: 2790,
    discountPercent: 21,
    rating: 4.9,
    reviewCount: 27,
    colors: [
      { name: 'Lilac Mist (லேவண்டர்)', hex: '#a68cb8' },
      { name: 'Maragatha Jade (மரகதம்)', hex: '#7ea494' }
    ],
    sizes: [
      { size: 'Free Size', stock: 15 }
    ],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Traditional Indian unstitched 3-piece luxury suit set: 2.5m Chanderi silk kurta with hand-woven booties, 2.0m soft santoon bottom, and 2.5m shimmering Banarasi woven zari dupatta.',
    fabric: 'Chanderi Silk Kurta, Premium Santoon Bottom, Banarasi Zari Dupatta',
    careGuide: 'Dry clean recommended to preserve gold zari finish.',
    fitType: 'Regular Fit',
    occasion: 'Festive',
    tags: ['Festive Special', 'New Arrival'],
    inStockTotal: 15,
    barcode: '8907833982008'
  },

  // LOUNGE WEAR
  {
    id: 'yb-lounge-01',
    sku: 'YB-LNG-MULMUL-01',
    name: 'Hand Block Print Mulmul Cotton Summer Lounge Set',
    department: 'lounge',
    category: 'Lounge Sets',
    price: 1450,
    originalPrice: 1850,
    discountPercent: 21,
    rating: 4.9,
    reviewCount: 36,
    colors: [
      { name: 'Pastel Aqua Floral (கடல் நீலம்)', hex: '#689f9e' },
      { name: 'Gulabi Petal (குலாபி ரோஸ்)', hex: '#d99198' }
    ],
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 9 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 4 }
    ],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Feather-light pure mulmul cotton lounge set featuring a button-down relaxed notch collar shirt and elasticated pyjama bottoms with side pockets.',
    fabric: '100% Feather-soft Mulmul Cotton',
    careGuide: 'Machine wash cold with similar colors. Line dry in shade.',
    fitType: 'Relaxed Fit',
    occasion: 'Daily Wear',
    tags: ['Bestseller'],
    inStockTotal: 26,
    barcode: '8907833982009'
  },

  // DECOR & CRAFTS
  {
    id: 'yb-decor-01',
    sku: 'YB-DCR-URLI-01',
    name: 'Traditional Handcrafted Solid Brass Urli (உருளி) with Floating Flower Rim',
    department: 'decor',
    category: 'Craft Items',
    price: 1950,
    originalPrice: 2500,
    discountPercent: 22,
    rating: 5.0,
    reviewCount: 22,
    colors: [
      { name: 'Antique Brass Gold (பித்தளை)', hex: '#b59247' }
    ],
    sizes: [
      { size: 'Free Size', stock: 10 }
    ],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Sublime antique polished solid brass urli (உருளி) bowl for floating marigold blossoms and diyas at your home entrance or pooja room. Handcrafted by traditional Tamil Nadu metal artisans.',
    fabric: 'Solid Cast Brass with Anti-Tarnish Coating',
    careGuide: 'Wipe with soft dry cloth. Clean periodically with pitambari or lemon juice for mirror glow.',
    occasion: 'Festive',
    tags: ['Festive Special'],
    inStockTotal: 10,
    barcode: '8907833982010'
  },
  {
    id: 'yb-decor-02',
    sku: 'YB-DCR-PICHWAI-02',
    name: 'Hand-Painted Pichwai Lotus Festive Wooden Thali Decor Plate (தாம்பூல தட்டு)',
    department: 'decor',
    category: 'Decorated Plates',
    price: 990,
    originalPrice: 1250,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 17,
    colors: [
      { name: 'Temple Vermillion & Gold (குங்குமம் & தங்கம்)', hex: '#a62626' }
    ],
    sizes: [
      { size: 'Free Size', stock: 14 }
    ],
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: '10-inch decorative wooden thali plate hand-painted with sacred Pichwai lotus pond motifs and embellished gold acrylic accents for auspicious celebrations, pooja rituals, and festive home decor.',
    fabric: 'Treated Teak Wood Base with Acrylic & Lacquer Gloss',
    careGuide: 'Wipe with dry microfiber cloth. Do not soak in water.',
    occasion: 'Festive',
    tags: ['Handloom'],
    inStockTotal: 14,
    barcode: '8907833982011'
  },

  // ─── AUTHENTIC HANDCRAFTED BOUTIQUE KURTIS (FROM STORE STOCK) ───────────────
  {
    id: 'yb-krt-01',
    sku: 'YB-KRT-SLV-01',
    barcode: '8907833983001',
    name: 'Metallic Silver Ombre Tussar Silk Straight Kurti (வெள்ளி நிற துசார் பட்டு குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1299,
    originalPrice: 1799,
    discountPercent: 28,
    rating: 4.8,
    reviewCount: 22,
    colors: [
      { name: 'Metallic Silver Slate (வெள்ளி சாம்பல்)', hex: '#8C929D' },
      { name: 'Charcoal Ombre (கருமை)', hex: '#373A40' }
    ],
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 6 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 2 }
    ],
    inStockTotal: 22,
    images: ['/products/kurtis/silver-gradient-kurti.jpg'],
    description: 'Sophisticated straight-cut kurti tailored from premium tussar silk blend featuring vertical ombre panel shading, subtle metallic sheen, elbow-length sleeves, and a split keyhole neckline. Pairs effortlessly with palazzo pants or churidars.',
    fabric: 'Tussar Silk Blend with Metallic Sheen & Shaded Ombre Panels',
    careGuide: 'Dry clean or gentle hand wash in cold water with mild liquid detergent. Line dry in shade.',
    fitType: 'Straight Cut',
    occasion: 'Office',
    tags: ['New Arrival']
  },
  {
    id: 'yb-krt-02',
    sku: 'YB-KRT-VLT-02',
    barcode: '8907833983002',
    name: 'Royal Violet Handcrafted Floral Lily Chanderi Kurti (ராஜ ஊதா மலர் குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1199,
    originalPrice: 1599,
    discountPercent: 25,
    rating: 4.9,
    reviewCount: 31,
    colors: [
      { name: 'Royal Violet (ராஜ ஊதா)', hex: '#4A154B' },
      { name: 'Lotus Fuchsia (தாமரை இளஞ்சிவப்பு)', hex: '#D81B60' }
    ],
    sizes: [
      { size: 'S', stock: 3 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 2 }
    ],
    inStockTotal: 19,
    images: ['/products/kurtis/royal-purple-floral-kurti.jpg'],
    description: 'Vibrant royal purple chanderi cotton silk kurti adorned with hand-blocked botanical lily motifs, delicate floral foliage, and comfortable breathable weave. Finished with a boat notch neck for graceful festive or everyday wear.',
    fabric: 'Glazed Chanderi Cotton Silk with Botanical Block Prints',
    careGuide: 'Hand wash separately in cold water. Iron on reverse side on medium heat.',
    fitType: 'Regular Fit',
    occasion: 'Festive',
    tags: ['Bestseller', 'New Arrival']
  },
  {
    id: 'yb-krt-03',
    sku: 'YB-KRT-BLK-03',
    barcode: '8907833983003',
    name: 'Midnight Black Botanical Dori Kurti with Side Tassels (கறுப்பு பூ வேலைப்பாடு டோரி குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1499,
    originalPrice: 1999,
    discountPercent: 25,
    rating: 4.9,
    reviewCount: 28,
    colors: [
      { name: 'Midnight Black (நள்ளிரவு கறுப்பு)', hex: '#1C1B20' },
      { name: 'Blossom Pink & Marigold (பூ மலர்)', hex: '#E91E63' }
    ],
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 6 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 3 }
    ],
    inStockTotal: 24,
    images: ['/products/kurtis/black-botanical-dori-kurti.jpg'],
    description: 'Exquisite jet black straight kurti featuring striking multi-hued botanical floral vine prints, tailored square-scoop neck, and signature side corset lace-up tie dori with handcrafted matching tassels for an adjustable, flattering waist silhouette.',
    fabric: 'Premium Soft Rayon Crepe / Chanderi Cotton with Floral Foliage',
    careGuide: 'Gentle machine wash inside out. Avoid wringing dry. Warm iron.',
    fitType: 'Straight Cut',
    occasion: 'Party',
    tags: ['Festive Special', 'New Arrival']
  },
  {
    id: 'yb-krt-04',
    sku: 'YB-KRT-ORG-04',
    barcode: '8907833983004',
    name: 'Midnight Shimmer Organza Pastel Rose Bouquet Kurti (மெல்லிய ஆர்கன்சா ரோஜா குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1599,
    originalPrice: 2199,
    discountPercent: 27,
    rating: 4.8,
    reviewCount: 19,
    colors: [
      { name: 'Glossy Black Tissue (பளபளப்பான கறுப்பு)', hex: '#161618' },
      { name: 'Pastel English Rose (ரோஜா இளஞ்சிவப்பு)', hex: '#F48FB1' }
    ],
    sizes: [
      { size: 'S', stock: 3 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 3 },
      { size: 'XXL', stock: 2 }
    ],
    inStockTotal: 18,
    images: ['/products/kurtis/black-organza-pastel-rose-kurti.jpg'],
    description: 'Ethereal sheer organza tissue kurti layered over a soft breathable inner lining. Features romantic watercolor English rose bouquets scattered across an obsidian black shimmer base, translucent sleeves, and subtle keyhole collar.',
    fabric: 'Fine Organza Silk Tissue with Soft Inner Santoon Lining',
    careGuide: 'Dry clean only to maintain sheer luster and fabric integrity.',
    fitType: 'Regular Fit',
    occasion: 'Party',
    tags: ['New Arrival']
  },
  {
    id: 'yb-krt-05',
    sku: 'YB-KRT-CPZ-05',
    barcode: '8907833983005',
    name: 'Bronze Copper Metallic Organza Rose Print Kurti (தாமிர பழுப்பு ஆர்கன்சா குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1599,
    originalPrice: 2199,
    discountPercent: 27,
    rating: 4.8,
    reviewCount: 24,
    colors: [
      { name: 'Bronze Copper (தாமிர பழுப்பு)', hex: '#7E4B3E' },
      { name: 'Blush Rose (மென்மையான ரோஜா)', hex: '#D98282' }
    ],
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 2 }
    ],
    inStockTotal: 20,
    images: ['/products/kurtis/copper-bronze-organza-kurti.jpg'],
    description: 'Rich metallic bronze-copper shimmer organza kurti highlighted by vintage floral garden prints in antique rose and amber tones. Tailored with a notched neck, sheer elbow sleeves, and smooth inner lining for comfortable celebration wear.',
    fabric: 'Metallic Glazed Organza Tissue with Soft Breathable Lining',
    careGuide: 'Dry clean recommended. Cool iron on reverse using a pressing cloth.',
    fitType: 'Straight Cut',
    occasion: 'Festive',
    tags: ['Festive Special']
  },
  {
    id: 'yb-krt-06',
    sku: 'YB-KRT-IVY-06',
    barcode: '8907833983006',
    name: 'Ivory Handloom Check Teal & Pink Blossom Scallop Kurti (ஐவரி செக்டு மலர் குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1099,
    originalPrice: 1499,
    discountPercent: 27,
    rating: 4.9,
    reviewCount: 35,
    colors: [
      { name: 'Ivory Cream (ஐவரி வெண்மை)', hex: '#F9F8F3' },
      { name: 'Teal Green (மரகத பச்சை)', hex: '#00897B' },
      { name: 'Berry Pink (இளஞ்சிவப்பு)', hex: '#D81B60' }
    ],
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 7 },
      { size: 'L', stock: 7 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 2 }
    ],
    inStockTotal: 25,
    images: ['/products/kurtis/ivory-teal-blossom-kurti.jpg'],
    description: 'Charming handcrafted ivory kurti woven with delicate micro-grid checks, adorned with vibrant teal and berry blossom prints. Accented with an elegant scalloped sweetheart neckline and contrast hem detailing for breezy tropical comfort.',
    fabric: 'Textured Cotton Dobby Woven Checks with Floral Print',
    careGuide: 'Machine wash in cold water with similar colors. Line dry in shade.',
    fitType: 'Straight Cut',
    occasion: 'Daily Wear',
    tags: ['Handloom', 'New Arrival']
  },
  {
    id: 'yb-krt-07',
    sku: 'YB-KRT-NVY-07',
    barcode: '8907833983007',
    name: 'Royal Navy Blue Raw Silk Kurti with Golden Zari Micro-Buttis (ராயல் நேவி ஜரி புட்டா குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1399,
    originalPrice: 1899,
    discountPercent: 26,
    rating: 4.9,
    reviewCount: 42,
    colors: [
      { name: 'Royal Navy Blue (ராயல் நேவி நீலம்)', hex: '#192A4A' },
      { name: 'Gold Zari (தங்க ஜரி)', hex: '#D4AF37' }
    ],
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 3 }
    ],
    inStockTotal: 29,
    images: ['/products/kurtis/navy-blue-zari-butti-kurti.jpg'],
    description: 'Regal navy blue raw silk blend kurti embellished throughout with traditional woven golden zari diamond micro-buttis. Styled with a jewel slit neck and elbow sleeves, creating an opulent look for poojas, temple visits, and wedding ceremonies.',
    fabric: 'Fine Raw Silk Blend with Metallic Gold Zari Weave',
    careGuide: 'Dry clean preferred. Warm iron on reverse side.',
    fitType: 'Straight Cut',
    occasion: 'Festive',
    tags: ['Festive Special']
  },
  {
    id: 'yb-krt-08',
    sku: 'YB-KRT-IVD-08',
    barcode: '8907833983008',
    name: 'Ivory Cream Botanical Lily Dori Kurti with Adjustable Side Tassels (ஐவரி லிலி டோரி குர்தி)',
    department: 'kurtis',
    category: 'Kurtis',
    price: 1499,
    originalPrice: 1999,
    discountPercent: 25,
    rating: 4.9,
    reviewCount: 26,
    colors: [
      { name: 'Warm Ivory (ஐவரி வெண்மை)', hex: '#FAF9F2' },
      { name: 'Magenta Lily & Amber (மலர் வண்ணங்கள்)', hex: '#E91E63' }
    ],
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 6 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 2 }
    ],
    inStockTotal: 22,
    images: ['/products/kurtis/ivory-botanical-dori-kurti.jpg'],
    description: 'Breathtaking ivory cotton-chanderi kurti showcasing bold magenta and marigold botanical lilies with lush olive leaf foliage. Equipped with functional side lace-up dori ribbons and artisanal tassel beads for a personalized cinched waist.',
    fabric: 'Premium Soft Cotton Chanderi Crepe with Botanical Print',
    careGuide: 'Gentle hand wash in cold water with mild detergent. Line dry in shade.',
    fitType: 'Straight Cut',
    occasion: 'Festive',
    tags: ['Festive Special', 'New Arrival']
  }
];

export const STORE_CENTRE_INFO = {
  name: 'Yaazh Boutique',
  tamilName: 'யாழ் ஆடைகள் & பட்டு மையம்',
  tagline: 'பாரம்பரியம் · கலைநயம் · நேர்த்தி (Authentic Indian Handlooms & Silks)',
  address: 'MR Complex, Near Bus Stand, Kallimandayam Main Road, Oddanchatram, Dindigul District, Tamil Nadu 624616, India',
  hours: 'Mon - Sun: 9:30 AM - 9:00 PM (IST)',
  phone: '+91 95978 33982',
  phone2: '+91 90478 54136',
  whatsapp: '919597833982',
  upiId: '9597833982@upi',
  gstin: '33AADFY9832K1ZP',
  state: 'Tamil Nadu',
  stateCode: '33',
  instagram: 'yaazh_botique',
  facebook: 'yaazhbotique',
};

export const COUPONS: Record<string, { percent: number; minOrder: number; description: string }> = {
  YAAZH10: { percent: 10, minOrder: 1500, description: '10% OFF on boutique handloom orders above ₹1,500' },
  MUHURTHAM20: { percent: 20, minOrder: 4000, description: '20% OFF Muhurtham Wedding & Bridal Special on orders above ₹4,000' },
  DEEPAVALI25: { percent: 25, minOrder: 3500, description: '25% OFF Festive Celebration Special on orders above ₹3,500' },
  FESTIVE25: { percent: 25, minOrder: 3500, description: '25% OFF Festive Special on orders above ₹3,500' },
  NAMASTE10: { percent: 10, minOrder: 999, description: '10% OFF Welcome gift on your first boutique purchase' },
  WELCOME10: { percent: 10, minOrder: 999, description: '10% OFF on your first purchase' },
};
