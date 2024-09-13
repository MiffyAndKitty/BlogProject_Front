// src/pages/CategorySettings.tsx
import React, { useState, useEffect } from 'react';
import CategoryList from './CategoryList';
import { categories as Categories, category as Category, newCategory as NewCategory } from '../types/index';
import { getCategories  } from '../services/getService';
import {  saveNewCategory} from '../services/postService';
import {  deleteCategory} from '../services/deleteService';
import {  updateCategory,updateCategoryLevel} from '../services/putService';
import { DropResult,DragDropContext } from 'react-beautiful-dnd';
import * as TYPES from '../types/index';
import './CategorySetting.css'
const CategorySettings = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  const onDragEnd = (result: DropResult, level?: number, parentId?: string) => {
    const { destination, source, draggableId } = result;
  
    if (!destination) {
      return;
    }
  
    let sourceParentId = source.droppableId;
    let destinationParentId = destination.droppableId;
    console.log(`
      
      
      sourceParentId :${sourceParentId}
      destinationParentId:${destinationParentId}
      
      
      
      `,result)
    // 같은 부모 카테고리 내에서 이동하는 경우
    if (sourceParentId === destinationParentId) {
      // 기존 카테고리 배열을 복사한 후 드래그된 항목을 재배치
      const newCategories = Array.from(categories);
      const [movedItem] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, movedItem);
  
      // 상태 업데이트
      setCategories(newCategories);
    } else {
      if(destinationParentId ==='root') destinationParentId = '';
      // 부모 카테고리 변경
      editCategoryLevel(draggableId, destinationParentId);
    }
  };
  
  
  const fetchCategories = async () => {
    try {
      const nickname = sessionStorage.getItem("nickname");
      if (!nickname) {
        throw new Error("Nickname not found in sessionStorage");
      }
      const fetchedCategories: any = await getCategories(nickname);
      setCategories(fetchedCategories.hierarchicalCategory);
      console.log(`
        
        
        
        
        fetchedCategories.hierarchicalCategory
        
        
        
        
        
        `,fetchedCategories.hierarchicalCategory);
    } catch (err) {
      console.error(err);
      alert(`카테고리를 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
      setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
    console.log(`
      
      
      categories
      
      
      
      
      `,categories)
    setExpandedCategories(getAllCategoryIds(categories));
  }, [categories]);
  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    const newCategory: NewCategory = {
      categoryName: newCategoryName,
      topcategoryId: parentCategoryId,
    };

    try {
      await saveNewCategory(newCategory);
      fetchCategories();
      alert('카테고리 추가를 성공했습니다!');
    } catch (err) {
      console.error(err);
      alert(`카테고리를 추가하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
      setError('카테고리를 추가하는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }

    setNewCategoryName('');
    setParentCategoryId('');
  };

  const addSubcategory = async (parentCategoryId: string, subcategoryName: string) => {
    const newCategory: NewCategory = {
      categoryName: subcategoryName,
      topcategoryId: parentCategoryId,
    };

    try {
      await saveNewCategory(newCategory);
      fetchCategories();
      alert('카테고리를 추가했습니다!');
    } catch (err) {
      console.error(err);
      alert(`하위 카테고리를 추가하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
      setError('하위 카테고리를 추가하는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const editCategory = async (categoryId: string, newCategoryName: string) => {
    try {

      let changeData: TYPES.changeCategory= {
        categoryName : newCategoryName,
        categoryId: categoryId

      }
      await updateCategory(changeData);
      alert('카테고리를 수정했습니다!');
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(`카테고리를 수정하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
    } finally {
      setLoading(false);
    }
  };
  const editCategoryLevel = async (categoryId: string, topcategoryId: string) => {
    try {

      let changeData= {
        topcategoryId : topcategoryId,
        categoryId: categoryId

      }
      await updateCategoryLevel(changeData);
      alert('카테고리 위치를 수정했습니다!');
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(`카테고리 위치를 수정하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      alert('카테고리를 삭제했습니다!');
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(`카테고리를 삭제하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 

    } finally {
      setLoading(false);
    }
  };


  return (

    <div>
      {loading ? (
        <div className="no-posts-message">
          <div className="no-posts-container">
            <p>로딩중...</p>
          </div>
        </div>
      ) :  (
        <>
        <input
         className='inputNewCategory'
         type="text"
         value={newCategoryName}
         onChange={(e) => setNewCategoryName(e.target.value)}
         placeholder="새 최상위 카테고리"
       />
       <button className='addCategoryBtn' onClick={addCategory}>새 카테고리 추가하기</button>
       <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
       <CategoryList
         categories={categories}
         expandedCategories={expandedCategories} 
         toggleCategory={toggleCategory} 
         onAddSubcategory={addSubcategory}
         onEditCategory={editCategory}
         onEditCategoryLevel={editCategoryLevel}
         onDeleteCategory={removeCategory}
         onDragEnd={onDragEnd}  // 추가
       />
      </DragDropContext>
       </>
      )}
     
     
    </div>
  );
};

export default CategorySettings;
