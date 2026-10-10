import React from 'react';
import { Department } from '../types';
import { DEPARTMENTS, DEPARTMENT_CONFIG } from '../data/catalogConfig';

interface CategoryBarItem {
  id: string;
  label: string;
  department: Department;
  category: string;
}

const BAR_ITEMS: CategoryBarItem[] = [
  { id: 'all', label: 'All Collections', department: 'all', category: 'All' },
  ...DEPARTMENTS.filter(d => d.id !== 'all').map(d => ({
    id: d.id,
    label: d.label,
    department: d.id,
    category: 'All',
  })),
  ...Object.entries(DEPARTMENT_CONFIG).flatMap(([dept, meta]) =>
    meta.categories.map((cat) => ({
      id: `${dept}-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: cat,
      department: dept as Department,
      category: cat,
    }))
  ),
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
    <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E8ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5">
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
                className={`snap-start whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer border-0 ${
                  isActive
                    ? 'bg-[#1D1D1F] text-white font-semibold'
                    : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#EFEFF2] hover:text-[#1D1D1F]'
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
