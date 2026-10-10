import { ClothingItem } from '../types';

/**
 * Curated authentic boutique inventory for Yaazh Boutique, Oddanchatram.
 * Real items are also synchronized in real-time with Firestore.
 */
export const INITIAL_CLOTHING_ITEMS: ClothingItem[] = [
  // SAREES
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
