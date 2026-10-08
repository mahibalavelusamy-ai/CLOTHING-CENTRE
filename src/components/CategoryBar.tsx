import React from 'react';
import { Department } from '../types';

interface CategoryBarItem {
  id: string;
  label: string;
  department: Department;
  category: string;
}

const BAR_ITEMS: CategoryBarItem[] = [
  { id: 'all', label: 'All Collections', department: 'all', category: 'All' },
  { id: 'women', label: 'Women', department: 'women', category: 'All' },
  { id: 'men', label: 'Men', department: 'men', category: 'All' },
  { id: 'kids', label: 'Kids', department: 'kids', category: 'All' },
  { id: 'ethnic', label: 'Ethnic & Festive', department: 'ethnic', category: 'All' },
  { id: 'dresses', label: 'Dresses', department: 'women', category: 'Dresses' },
  { id: 'tops', label: 'T-Shirts & Tops', department: 'all', category: 'T-Shirts & Tops' },
  { id: 'shirts', label: 'Shirts', department: 'men', category: 'Shirts' },
  { id: 'jeans', label: 'Jeans & Trousers', department: 'all', category: 'Jeans & Trousers' },
  { id: 'kurtas', label: 'Kurtas & Sets', department: 'ethnic', category: 'Kurtas & Sets' },
];

interface CategoryBarProps {
  currentDepartment: Department;
  currentCategory: string;
  onSelect: (dept: Department, category: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  currentDepartment,
  currentCategory,
  onSelect,
}) => {
  return (
    <div className="sticky top-[108px] sm:top-[112px] z-30 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory">
          {BAR_ITEMS.map((item) => {
            const isActive =
              (item.department === 'all' && item.category === 'All' && currentDepartment === 'all' && currentCategory === 'All') ||
              (item.category !== 'All' && currentCategory === item.category && (item.department === 'all' || currentDepartment === item.department)) ||
              (item.category === 'All' && item.department !== 'all' && currentDepartment === item.department && currentCategory === 'All');

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.department, item.category)}
                className={`snap-start whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100/80 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
