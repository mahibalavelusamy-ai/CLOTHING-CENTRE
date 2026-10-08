import React from 'react';
import { Department } from '../types';
import { DEPARTMENT_CONFIG } from '../data/catalogConfig';

interface CategoryBarItem {
  id: string;
  label: string;
  department: Department;
  category: string;
}

const BAR_ITEMS: CategoryBarItem[] = [
  { id: 'all', label: 'All Collections', department: 'all', category: 'All' },
  { id: 'sarees', label: DEPARTMENT_CONFIG.sarees.label, department: 'sarees', category: 'All' },
  { id: 'kurtis', label: DEPARTMENT_CONFIG.kurtis.label, department: 'kurtis', category: 'All' },
  { id: 'kids', label: DEPARTMENT_CONFIG.kids.label, department: 'kids', category: 'All' },
  // Category quick links
  { id: 'silk-sarees', label: 'Silk Sarees', department: 'sarees', category: 'Silk Sarees' },
  { id: 'cotton-sarees', label: 'Cotton Sarees', department: 'sarees', category: 'Cotton Sarees' },
  { id: 'kurtis-cat', label: 'Kurtis', department: 'kurtis', category: 'Kurtis' },
  { id: 'anarkali', label: 'Anarkali Suits', department: 'kurtis', category: 'Anarkali Suits' },
  { id: 'chudidar', label: 'Chudidar Sets', department: 'kurtis', category: 'Chudidar Sets' },
  { id: 'girls-ethnic', label: 'Girls Ethnic', department: 'kids', category: 'Girls Ethnic Wear' },
  { id: 'boys-kurta', label: 'Boys Kurta Sets', department: 'kids', category: 'Boys Kurta Sets' },
];

interface CategoryBarProps {
  currentDepartment: Department;
  currentCategory: string;
  onSelect: (dept: Department, category: string) => void;
  departmentCounts?: Record<Department, number>;
  categoryCounts?: Record<string, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  currentDepartment,
  currentCategory,
  onSelect,
  departmentCounts,
  categoryCounts,
}) => {
  // Hide any department or category nav item that currently has zero products
  const visibleItems = BAR_ITEMS.filter((item) => {
    if (!departmentCounts || !categoryCounts) return true;
    if (item.category === 'All') {
      if (item.department === 'all') {
        return (departmentCounts['all'] ?? 0) > 0;
      }
      return (departmentCounts[item.department] ?? 0) > 0;
    }
    return (categoryCounts[item.category] ?? 0) > 0;
  });

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-[108px] sm:top-[112px] z-30 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory">
          {visibleItems.map((item) => {
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
