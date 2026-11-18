import { Department, Size } from '../types';

export interface DepartmentMeta {
  label: string;
  categories: string[];
  sizes: Size[];
}

export const DEPARTMENT_CONFIG: Record<Exclude<Department, 'all'>, DepartmentMeta> = {
  sarees: {
    label: 'Sarees',
    categories: [
      'Silk Sarees',
      'Cotton Sarees',
      'Georgette & Chiffon',
      'Party Wear Sarees',
      'Tussar Sarees',
      'Handloom Sarees',
      'Silk Blend Sarees',
    ],
    sizes: ['Free Size'],
  },
  kurtis: {
    label: 'Kurtis & Suits',
    categories: [
      'Kurtis',
      'Chudidar Sets',
      'Anarkali Suits',
      'Palazzo & Pant Sets',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  kids: {
    label: 'Kidswear',
    categories: [
      'Girls Ethnic Wear',
      'Girls Frocks',
      'Boys Kurta Sets',
    ],
    sizes: ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y'],
  },
  blouses: {
    label: 'Blouses & Crop Tops',
    categories: [
      'Block Printed Blouses',
      'Crop Tops',
      'Readymade Blouses',
    ],
    sizes: ['32', '34', '36', '38', '40', '42', '44', '46'],
  },
  coords: {
    label: 'Co-ords',
    categories: [
      'Co-ord Sets',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  salwar: {
    label: 'Salwar Materials',
    categories: [
      'Salwar Materials',
    ],
    sizes: ['Free Size'],
  },
  lounge: {
    label: 'Lounge Wear',
    categories: [
      'Lounge Sets',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  decor: {
    label: 'Decor & Crafts',
    categories: [
      'Decorated Plates',
      'Craft Items',
    ],
    sizes: ['Free Size'],
  },
};

export const DEPARTMENTS: { id: Department; label: string }[] = [
  { id: 'all', label: 'All Collections' },
  { id: 'sarees', label: 'Sarees' },
  { id: 'kurtis', label: 'Kurtis & Suits' },
  { id: 'kids', label: 'Kidswear' },
  { id: 'blouses', label: 'Blouses & Crop Tops' },
  { id: 'coords', label: 'Co-ords' },
  { id: 'salwar', label: 'Salwar Materials' },
  { id: 'lounge', label: 'Lounge Wear' },
  { id: 'decor', label: 'Decor & Crafts' },
];

export const ALL_CATEGORIES: string[] = [
  ...DEPARTMENT_CONFIG.sarees.categories,
  ...DEPARTMENT_CONFIG.kurtis.categories,
  ...DEPARTMENT_CONFIG.kids.categories,
  ...DEPARTMENT_CONFIG.blouses.categories,
  ...DEPARTMENT_CONFIG.coords.categories,
  ...DEPARTMENT_CONFIG.salwar.categories,
  ...DEPARTMENT_CONFIG.lounge.categories,
  ...DEPARTMENT_CONFIG.decor.categories,
];

export const OCCASIONS: ('Daily Wear' | 'Festive' | 'Wedding' | 'Party' | 'Office')[] = [
  'Daily Wear',
  'Festive',
  'Wedding',
  'Party',
  'Office',
];

export const FIT_TYPES: ('Straight Cut' | 'A-Line' | 'Anarkali Flare' | 'Regular Fit' | 'Relaxed Fit')[] = [
  'Straight Cut',
  'A-Line',
  'Anarkali Flare',
  'Regular Fit',
  'Relaxed Fit',
];
