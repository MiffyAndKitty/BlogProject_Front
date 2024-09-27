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
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }
  
    let sourceParentId = source.droppableId;
    let destinationParentId = destination.droppableId;
    // 출발지와 목적지가 같은 경우
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return; // 이동이 없으므로 종료
    }
    // console.log(`




    //   [result]
    // draggableId :${draggableId}
    // sourceParentId :${sourceParentId}
    // destinationParentId: ${destinationParentId}




    // `,destination, source, draggableId )

    try {
      if (sourceParentId === destinationParentId) {
        // // 기존 카테고리 배열을 복사한 후 드래그된 항목을 재배치
        // const newCategories = Array.from(categories);
        // const [movedItem] = newCategories.splice(source.index, 1);
        // newCategories.splice(destination.index, 0, movedItem);
    
        // // 상태 업데이트
        // setCategories(newCategories);
        return;
      }
      if (source.droppableId === "level-1" && destination.droppableId === "level-1") {
       return;
      } else {
        if(destinationParentId ==='root') destinationParentId = '';
        // 부모 카테고리 변경
        editCategoryLevel(draggableId, destinationParentId);
        }
    } catch (error) {
      console.error("드래그 종료 처리 중 오류 발생:", error);
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

    } catch (err) {
      console.error(err);
      if(err.response) alert(`카테고리를 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
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
      if(err.response) alert(`카테고리를 추가하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
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
      if(err.response) alert(`하위 카테고리를 추가하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
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
      if(err.response) alert(`카테고리를 수정하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
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
      if(err.response) alert(`카테고리 위치를 수정하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
    } finally {
      setLoading(false);
    }
  };
   // 문자열의 바이트 길이 계산 함수
   const getByteLength = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
        byteLength += str.charCodeAt(i) > 0x007f ? 3 : 1; // 한글 3바이트, 영문 1바이트
    }
    return byteLength;
 };
  const changeCategory = (value:string)=>{
    if(getByteLength(value)>48){
      alert('카테고리는 한글16자/영문48자 이하로 입력해주세요.')
    }else{
      setNewCategoryName(value);
    }
    
  };
  const removeCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      alert('카테고리를 삭제했습니다!');
      fetchCategories();
    } catch (err) {
      console.error(err);
      if(err.response) alert(`카테고리를 삭제하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 

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
         onChange={(e) => changeCategory(e.target.value)}    
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
