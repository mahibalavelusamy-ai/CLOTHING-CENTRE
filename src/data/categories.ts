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
    id: 'sarees-tussar',
    label: 'Tussar Sarees',
    department: 'sarees',
    category: 'Tussar Sarees',
    tint: '#FDEEE9',
  },
  {
    id: 'sarees-handloom',
    label: 'Handloom Sarees',
    department: 'sarees',
    category: 'Handloom Sarees',
    tint: '#F5ECE1',
  },
  {
    id: 'sarees-silk-blend',
    label: 'Silk Blend Sarees',
    department: 'sarees',
    category: 'Silk Blend Sarees',
    tint: '#F9EBEA',
  },
  {
    id: 'sarees-cotton',
    label: 'Cotton Sarees',
    department: 'sarees',
    category: 'Cotton Sarees',
    tint: '#EAF2F8',
  },
  // Blouses & Crop Tops
  {
    id: 'blouses-block-printed',
    label: 'Block Printed Blouses',
    department: 'blouses',
    category: 'Block Printed Blouses',
    tint: '#E8F8F5',
  },
  {
    id: 'blouses-readymade',
    label: 'Readymade Blouses',
    department: 'blouses',
    category: 'Readymade Blouses',
    tint: '#FEF9E7',
  },
  // Co-ords
  {
    id: 'coords-sets',
    label: 'Co-ord Sets',
    department: 'coords',
    category: 'Co-ord Sets',
    tint: '#F4ECF7',
  },
  // Salwar Materials
  {
    id: 'salwar-materials',
    label: 'Salwar Materials',
    department: 'salwar',
    category: 'Salwar Materials',
    tint: '#FDEDEC',
  },
  // Lounge Wear
  {
    id: 'lounge-sets',
    label: 'Lounge Sets',
    department: 'lounge',
    category: 'Lounge Sets',
    tint: '#EBF5FB',
  },
  // Decor & Crafts
  {
    id: 'decor-plates',
    label: 'Decorated Plates',
    department: 'decor',
    category: 'Decorated Plates',
    tint: '#FEF5E7',
  },
  {
    id: 'decor-crafts',
    label: 'Craft Items',
    department: 'decor',
    category: 'Craft Items',
    tint: '#E8F6F3',
  },
];
