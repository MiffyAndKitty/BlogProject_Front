// src/components/CategoryList.tsx
import React, { useState } from 'react';
import { categories as Categories } from '../types/index';
import up_arrow from '../img/up_arrow.png';
import down_arrow from '../img/down_arrow.png';
import './CategoryList.css';
import ConfirmModal from './ConfirmModal'; 

interface CategoryListProps {
  categories: Categories[];
  level?: number;
  expandedCategories: string[];
  toggleCategory: (categoryId: string) => void;
  onAddSubcategory: (parentCategoryId: string, subcategoryName: string) => void;
  onEditCategory: (categoryId: string, newCategoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, level = 0, expandedCategories, toggleCategory, onAddSubcategory, onEditCategory, onDeleteCategory }) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [addingSubcategoryId, setAddingSubcategoryId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null); 
  const handleMouseEnter = (categoryId: string) => {
    setHoveredCategoryId(categoryId);
  };

  const handleMouseLeave = () => {
    setHoveredCategoryId(null);
  };
  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
    }
    setIsModalOpen(false);
    setCategoryToDelete(null);
  };
  return (
    <div>
      {categories.map(category => (
        <div key={category.category_id} className={`level-${level}`} onMouseEnter={() => handleMouseEnter(category.category_id)} onMouseLeave={handleMouseLeave}>
          <div onClick={() => toggleCategory(category.category_id)} style={{ cursor: 'pointer' }} className="category-item">
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
                {level !== 2 && (
                  expandedCategories.includes(category.category_id) 
                    ? <img className='arrow' src={up_arrow} alt="up arrow" /> 
                    : <img className='arrow' src={down_arrow} alt="down arrow" />
                )}
                {hoveredCategoryId === category.category_id && ( 
                  <span className='addChangeDeleteBtn'>
                    {level !== 2 && (
                      <button className='addChangeDeleteBtn' onClick={() => setAddingSubcategoryId(category.category_id)}>추가</button>
                    )}
                    <button className='addChangeDeleteBtn' onClick={() => setEditingCategoryId(category.category_id)}>수정</button>
                    {(level === 2 ||!category.subcategories ) &&(
                    <>
                    <button className='addChangeDeleteBtn' onClick={() => handleDeleteCategory(category.category_id)}>삭제</button>
                      <ConfirmModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onConfirm={confirmDeleteCategory}
                        message="이 카테고리를 삭제하시겠습니까?"
                      />
                  </>
                    )}
                   
                  </span>
                )}
              </div>
            )}
          </div>

          {addingSubcategoryId === category.category_id && (
            <div>
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="하위 카테고리 이름"
              />
              <button className='addChangeDeleteBtn' onClick={() => { onAddSubcategory(category.category_id, newSubcategoryName); setAddingSubcategoryId(null); setNewSubcategoryName('');}}>추가</button>
              <button className='addChangeDeleteBtn' onClick={() => {setAddingSubcategoryId(null); setNewSubcategoryName('');}}>취소</button>
            </div>
          )}

          {expandedCategories.includes(category.category_id) && category.subcategories && category.subcategories.length > 0 && (
            <CategoryList
              level={level + 1}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
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
