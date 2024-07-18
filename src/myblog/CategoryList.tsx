// src/components/CategoryList.tsx
import React, { useEffect, useState } from 'react';
import { categories as Categories, category as Category } from '../types/index';
import './CategoryList.css';
interface CategoryListProps {
  categories: Categories[];
  level?: number;
  onAddSubcategory: (parentCategoryId: string, subcategoryName: string) => void;
  onEditCategory: (categoryId: string, newCategoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories,level = 0, onAddSubcategory, onEditCategory, onDeleteCategory }) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [addingSubcategoryId, setAddingSubcategoryId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>('');

  const handleMouseEnter = (categoryId: string) => {
    setHoveredCategoryId(categoryId);
    console.log(`hoveredCategoryId`,hoveredCategoryId);
  };
  
  const handleMouseLeave = () => {
    setHoveredCategoryId(null);
    console.log(`====hoveredCategoryId cancel====`,hoveredCategoryId);
  };

  useEffect( ()=>{
    console.log(
      `
      
      categories
      
      `,categories, 
    )
  }, []
    
  )
  return (
    <div>
      {categories.map(category => (
        <div
          key={category.category_id}
          className={`level-${level}`}
          onMouseEnter={() => handleMouseEnter(category.category_id)  }
          onMouseLeave={handleMouseLeave}
        >
          {editingCategoryId === category.category_id ? (
            <div>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={category.category_name}
              />
              <button className='addChangeDeleteBtn' onClick={() => { onEditCategory(category.category_id, newCategoryName); setEditingCategoryId(null); }}>저장</button>
              <button className='addChangeDeleteBtn' onClick={() => setEditingCategoryId(null)}>취소</button>
            </div>
          ) : (
            <div>
              {category.category_name}
              {hoveredCategoryId === category.category_id && (
                <span className='addChangeDeleteBtn'>
                {level !==2 &&(
                  <button className='addChangeDeleteBtn' onClick={() => setAddingSubcategoryId(category.category_id)}>추가</button>
                )}                 
                <button className='addChangeDeleteBtn' onClick={() => setEditingCategoryId(category.category_id)}>수정</button>                  
                <button className='addChangeDeleteBtn' onClick={() => onDeleteCategory(category.category_id)}>삭제</button>
              </span>
              )}

              {/* 임시 */}
              
              
            </div>
          )}

          {addingSubcategoryId === category.category_id && (
            <div>
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="하위 카테고리 이름"
              />
              <button className='addChangeDeleteBtn' onClick={() => { onAddSubcategory(category.category_id, newSubcategoryName); setAddingSubcategoryId(null); }}>추가</button>
              <button className='addChangeDeleteBtn' onClick={() => setAddingSubcategoryId(null)}>취소</button>
            </div>
          )}

          {category.subcategories && category.subcategories.length > 0 && (
            <CategoryList
              level={level + 1}
              categories={category.subcategories}
              onAddSubcategory={onAddSubcategory}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
