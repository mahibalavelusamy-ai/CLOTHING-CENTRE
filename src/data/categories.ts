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
  {
    id: 'sarees-silk',
    label: 'Silk Sarees',
    department: 'sarees',
    category: 'Silk Sarees',
    tint: '#FDEEE9',
  },
  {
    id: 'sarees-cotton',
    label: 'Cotton Sarees',
    department: 'sarees',
    category: 'Cotton Sarees',
    tint: '#F5ECE1',
  },
  {
    id: 'sarees-georgette',
    label: 'Georgette & Chiffon',
    department: 'sarees',
    category: 'Georgette & Chiffon',
    tint: '#F9EBEA',
  },
  {
    id: 'sarees-party',
    label: 'Party Wear Sarees',
    department: 'sarees',
    category: 'Party Wear Sarees',
    tint: '#F3E8F5',
  },
  {
    id: 'kurtis-daily',
    label: 'Kurtis',
    department: 'kurtis',
    category: 'Kurtis',
    tint: '#EBF5FB',
  },
  {
    id: 'kurtis-chudidar',
    label: 'Chudidar Sets',
    department: 'kurtis',
    category: 'Chudidar Sets',
    tint: '#E8F8F5',
  },
  {
    id: 'kurtis-anarkali',
    label: 'Anarkali Suits',
    department: 'kurtis',
    category: 'Anarkali Suits',
    tint: '#FEF9E7',
  },
  {
    id: 'kurtis-palazzo',
    label: 'Palazzo & Pant Sets',
    department: 'kurtis',
    category: 'Palazzo & Pant Sets',
    tint: '#F4ECF7',
  },
  {
    id: 'kids-girls-ethnic',
    label: 'Girls Ethnic Wear',
    department: 'kids',
    category: 'Girls Ethnic Wear',
    tint: '#FDEDEC',
  },
  {
    id: 'kids-girls-frocks',
    label: 'Girls Frocks',
    department: 'kids',
    category: 'Girls Frocks',
    tint: '#E8F6F3',
  },
  {
    id: 'kids-boys-kurta',
    label: 'Boys Kurta Sets',
    department: 'kids',
    category: 'Boys Kurta Sets',
    tint: '#EAF2F8',
  },
  {
    id: 'kids-boys-casuals',
    label: 'Boys Casuals',
    department: 'kids',
    category: 'Boys Casuals',
    tint: '#F9EBEA',
  },
];
