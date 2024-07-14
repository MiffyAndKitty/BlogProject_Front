import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from '../main/Profile';
import MainPosts from '../myblog/MainPosts'
import './MyBlogMainPage.css';
/**
 * 로그인 후의 메인페이지
 * @returns 
 */
const MyBlogMainPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);
  return (
    <div className="App">
      <Header pageType="logout"/>
      <main className="main-content">
        <Profile pageType="myBlog" />
        <MainPosts></MainPosts>
      </main>
      <Footer />
    </div>
  );
};

export default MyBlogMainPage;
