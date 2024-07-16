// src/pages/CategorySettings.js
import React, { useState, useEffect } from 'react';
import CategoryList from './CategoryList';
import { categories as Categories, category as Category, newCategory, newCategory as NewCategory } from '../types/index';
import { getCategories  } from '../services/getService';
import { saveNewCategory  } from '../services/postService';

const CategorySettings = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const addCategory = () => {
    const newCategory: NewCategory = {
      categoryName: newCategoryName,
      topcategoryId: parentCategoryId,
    };

    const postCategory = async () => {
      try {

        const postCategoryData: newCategory = await saveNewCategory(newCategory);
      } catch (err) {
        console.error(err);
        setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    postCategory();

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

    fetchCategories();
    setNewCategoryName('');
    setParentCategoryId('');
  };

  useEffect(() => {
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

    fetchCategories();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>카테고리 설정</h1>
      <CategoryList categories={categories} />
      <input
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        placeholder="새 카테고리"
      />
      <input
        type="text"
        value={parentCategoryId || ''}
        onChange={(e) => setParentCategoryId(e.target.value ? e.target.value : '')}
        placeholder="상위 카테고리 아이디"
      />
      <button onClick={addCategory}>카테고리 추가하기</button>
    </div>
  );
};

export default CategorySettings;
