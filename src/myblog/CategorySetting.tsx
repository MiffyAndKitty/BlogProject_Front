// src/pages/CategorySettings.tsx
import React, { useState, useEffect } from 'react';
import CategoryList from './CategoryList';
import { categories as Categories, category as Category, newCategory as NewCategory } from '../types/index';
import { getCategories  } from '../services/getService';
import {  saveNewCategory} from '../services/postService';
import {  deleteCategory} from '../services/deleteService';
import {  updateCategory} from '../services/putService';
import * as TYPES from '../types/index';
import './CategorySetting.css'

const CategorySettings = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCategories = async () => {
    try {
      const nickname = localStorage.getItem("nickname");
      if (!nickname) {
        throw new Error("Nickname not found in localStorage");
      }
      const fetchedCategories: Categories[] = await getCategories(nickname);
      setCategories(fetchedCategories);
      console.log(fetchedCategories);
    } catch (err) {
      console.error(err);
      setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError('카테고리를 수정하는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (categoryId: string) => {
    try {
      // let removeData: TYPES.deleteCategory={
      //   categoryId: categoryId
      // }
      await deleteCategory(categoryId);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('카테고리를 삭제하는 중에 오류가 발생했습니다.');

    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <CategoryList
        categories={categories}
        onAddSubcategory={addSubcategory}
        onEditCategory={editCategory}
        onDeleteCategory={removeCategory}
      />
      <input
        className='inputNewCategory'
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        placeholder="새 카테고리"
      />
      <button className='addCategoryBtn' onClick={addCategory}>새 카테고리 추가하기</button>
    </div>
  );
};

export default CategorySettings;
