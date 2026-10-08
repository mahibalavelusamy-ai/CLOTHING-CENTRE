import { Department, Size } from '../types';

export interface DepartmentMeta {
  label: string;
  categories: string[];
  sizes: Size[];
}

export const DEPARTMENT_CONFIG: Record<'sarees' | 'kurtis' | 'kids', DepartmentMeta> = {
  sarees: {
    label: 'Sarees',
    categories: [
      'Silk Sarees',
      'Cotton Sarees',
      'Georgette & Chiffon',
      'Party Wear Sarees',
    ],
    sizes: ['Free Size'],
  },
  kurtis: {
    label: 'Kurtis & Chudidars',
    categories: [
      'Kurtis',
      'Chudidar Sets',
      'Anarkali Suits',
      'Palazzo & Pant Sets',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  kids: {
    label: 'Kidswear',
    categories: [
      'Girls Ethnic Wear',
      'Girls Frocks',
      'Boys Kurta Sets',
      'Boys Casuals',
    ],
    sizes: [
      '1-2Y',
      '2-3Y',
      '3-4Y',
      '4-5Y',
      '5-6Y',
      '6-7Y',
      '7-8Y',
      '8-9Y',
      '9-10Y',
    ],
  },
};

export const DEPARTMENTS: { id: Department; label: string }[] = [
  { id: 'all', label: 'All Collections' },
  { id: 'sarees', label: 'Sarees' },
  { id: 'kurtis', label: 'Kurtis & Chudidars' },
  { id: 'kids', label: 'Kidswear' },
];

export const ALL_CATEGORIES: string[] = [
  ...DEPARTMENT_CONFIG.sarees.categories,
  ...DEPARTMENT_CONFIG.kurtis.categories,
  ...DEPARTMENT_CONFIG.kids.categories,
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
