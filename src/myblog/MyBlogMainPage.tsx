import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from '../main/Profile';
import MainPosts from '../myblog/MainPosts'
import './MyBlogMainPage.css';
import CategoryList from './CategoryList';
import { categories as Categories } from '../types/index';
import { getCategories  } from '../services/getService';

/**
 * 로그인 후의 메인페이지
 * @returns 
 */
const MyBlogMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Categories[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }

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
  }, [navigate]);
  return (
    <div className="App">
      <Header pageType="logout"/>
      <main className="main-content">
        <Profile pageType="myBlog" />
        <CategoryList categories={categories}></CategoryList>
        <MainPosts></MainPosts>
      </main>
      <Footer />
    </div>
  );
};

export default MyBlogMainPage;
