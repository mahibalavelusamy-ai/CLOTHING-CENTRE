import { Department } from '../types';

export interface CategoryTile {
  id: string;
  label: string;
  department: Department;
  category: string;
  image: string;
  tint: string;
}

export const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'women-tops',
    label: "Women's Tops",
    department: 'women',
    category: 'T-Shirts & Tops',
    image: 'https://picsum.photos/seed/cat-w-top/400/400',
    tint: '#F5ECE1',
  },
  {
    id: 'women-dresses',
    label: 'Sundresses',
    department: 'women',
    category: 'Dresses',
    image: 'https://picsum.photos/seed/cat-w-dress/400/400',
    tint: '#F8E8E5',
  },
  {
    id: 'women-jeans',
    label: "Women's Jeans",
    department: 'women',
    category: 'Jeans & Trousers',
    image: 'https://picsum.photos/seed/cat-w-jean/400/400',
    tint: '#E8EFF7',
  },
  {
    id: 'men-shirts',
    label: "Men's Shirts",
    department: 'men',
    category: 'Shirts',
    image: 'https://picsum.photos/seed/cat-m-shirt/400/400',
    tint: '#E9EFE9',
  },
  {
    id: 'men-polos',
    label: "Men's Tees",
    department: 'men',
    category: 'T-Shirts & Tops',
    image: 'https://picsum.photos/seed/cat-m-polo/400/400',
    tint: '#F4EFE8',
  },
  {
    id: 'men-chinos',
    label: 'Men Chinos',
    department: 'men',
    category: 'Jeans & Trousers',
    image: 'https://picsum.photos/seed/cat-m-trous/400/400',
    tint: '#ECE6E1',
  },
  {
    id: 'kids-wear',
    label: 'Kids Playwear',
    department: 'kids',
    category: 'Kidswear',
    image: 'https://picsum.photos/seed/cat-kids-all/400/400',
    tint: '#FFF3E3',
  },
  {
    id: 'ethnic-kurtas',
    label: 'Kurtas & Sets',
    department: 'ethnic',
    category: 'Kurtas & Sets',
    image: 'https://picsum.photos/seed/cat-eth-kurta/400/400',
    tint: '#F3E8F5',
  },
];
