import { Department } from '../types';

export interface CategoryTile {
  id: string;
  label: string;
  department: Department;
  category: string;
  image?: string;
  tint: string;
}

export const CATEGORY_TILES: CategoryTile[] = [
  // Sarees
  {
    id: 'sarees-handloom',
    label: 'Handloom Sarees',
    department: 'sarees',
    category: 'Handloom Sarees',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    tint: '#FDEEE9',
  },
  {
    id: 'sarees-tussar',
    label: 'Tussar Sarees',
    department: 'sarees',
    category: 'Tussar Sarees',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    tint: '#F5ECE1',
  },
  {
    id: 'sarees-cotton',
    label: 'Cotton Sarees',
    department: 'sarees',
    category: 'Cotton Sarees',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
    tint: '#EAF2F8',
  },
  {
    id: 'sarees-silk-blend',
    label: 'Silk Blend Sarees',
    department: 'sarees',
    category: 'Silk Blend Sarees',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    tint: '#F9EBEA',
  },

  // Blouses & Crop Tops
  {
    id: 'blouses-block-printed',
    label: 'Block Printed Blouses',
    department: 'blouses',
    category: 'Block Printed Blouses',
    image: '/products/crop-tops/crop-top-blue-chevron.jpg',
    tint: '#E8F8F5',
  },
  {
    id: 'blouses-crop-tops',
    label: 'Cotton Crop Tops',
    department: 'blouses',
    category: 'Crop Tops',
    image: '/products/crop-tops/crop-top-mustard-leaf.jpg',
    tint: '#FEF9E7',
  },
  {
    id: 'blouses-readymade',
    label: 'Readymade Blouses',
    department: 'blouses',
    category: 'Readymade Blouses',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
    tint: '#FEF9E7',
  },

  // Co-ords
  {
    id: 'coords-sets',
    label: 'Co-ord Sets',
    department: 'coords',
    category: 'Co-ord Sets',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    tint: '#F4ECF7',
  },

  // Salwar Materials
  {
    id: 'salwar-materials',
    label: 'Salwar Materials',
    department: 'salwar',
    category: 'Salwar Materials',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    tint: '#FDEDEC',
  },

  // Lounge Wear
  {
    id: 'lounge-sets',
    label: 'Lounge Sets',
    department: 'lounge',
    category: 'Lounge Sets',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
    tint: '#EBF5FB',
  },

  // Decor & Crafts
  {
    id: 'decor-crafts',
    label: 'Craft Items & Urli',
    department: 'decor',
    category: 'Craft Items',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    tint: '#E8F6F3',
  },
  {
    id: 'decor-plates',
    label: 'Decorated Plates',
    department: 'decor',
    category: 'Decorated Plates',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    tint: '#FEF5E7',
  },
];
