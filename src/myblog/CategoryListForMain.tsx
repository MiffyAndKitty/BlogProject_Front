// src/components/CategoryList.tsx
import React, { useState,useEffect } from 'react';
import { categories as Categories } from '../types/index';
import './CategoryListForMain.css'
import up_arrow from '../img/up_pink_arrow.png';
import down_arrow from '../img/down_pink_arrow.png';

interface CategoryListProps {
  categories: Categories[];
  level?: number;
  onCategoryClick?: (categoryId: string) => void; // 클릭 핸들러 prop 추가

}

const CategoryListForMain: React.FC<CategoryListProps> = ({ categories = [], level = 0 ,onCategoryClick}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    // setExpandedCategories((prev) =>
    //   prev.includes(categoryId)
    //     ? prev.filter((id) => id !== categoryId)
    //     : [...prev, categoryId]
    // );
    if (onCategoryClick) {
      onCategoryClick(categoryId); // 카테고리를 클릭할 때 클릭 핸들러 호출
    }
  };
  const toggleUpCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    // if (onCategoryClick) {
    //   onCategoryClick(categoryId); // 카테고리를 클릭할 때 클릭 핸들러 호출
    // }
  };
  useEffect(() => {
    const getAllCategoryIds = (categories: Categories[]): string[] => {
      let ids: string[] = [];
      categories.forEach((category) => {
        ids.push(category.category_id);
        if (category.subcategories && category.subcategories.length>0) {
          ids = ids.concat(getAllCategoryIds(category.subcategories));
        }
      });
      return ids;
    };

    setExpandedCategories(getAllCategoryIds(categories));
  }, [categories]);
  return (
    <div > 
    <div >
      {categories.map((category) => (
        <div className={`categories level2-${level}`} key={category.category_id}>
          <div style={{ cursor: 'pointer' }} className="category-item">
            <div onClick={() => toggleCategory(category.category_id)}>
              {level ===1 && ('- '+ category.category_name+'  ('+ category.board_count+')')} 

              {level ===0 && <span style={{color:'#FF88D7'}}>{(category.category_name+'  ('+ category.board_count+')')}</span>} 
            </div>
            { level ===0 &&(expandedCategories.includes(category.category_id) ? <img onClick={()=>{toggleUpCategory(category.category_id)}} className='arrow' src={up_arrow}></img> : <img onClick={()=>{toggleUpCategory(category.category_id)}} className='arrow' src={down_arrow}></img> )}
          </div>
          {expandedCategories.includes(category.category_id) && category.subcategories && category.subcategories.length>0&& level ===0&&(
            <CategoryListForMain categories={category.subcategories} level={level + 1} onCategoryClick={onCategoryClick}/>
          )}
        </div>
      ))}
    </div>
    </div>
  );
};

export default CategoryListForMain;
