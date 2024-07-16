// src/components/CategoryList.tsx
import React, { useState } from 'react';
import { categories as Categories } from '../types/index';

interface CategoryListProps {
  categories: Categories[];
  level?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories = [], level = 0 }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <ul>
      {categories.map((category) => (
        <li key={category.category_id}>
          <div onClick={() => toggleCategory(category.category_id)} style={{ cursor: 'pointer' }}>
            {category.category_name} {expandedCategories.includes(category.category_id) ? '▲' : '▼'}
          </div>
          {expandedCategories.includes(category.category_id) && category.subcategories.length > 0 && (
            <CategoryList categories={category.subcategories} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoryList;
