import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import NewPost from './NewPost';
import Profile from './Profile';
import PopularPost from './PopularPost';
import PopularTags from './PopularTags';
import LotsOfFollowerBloger from './LotsOfFollowerBloger';
import CarrotBloger from './CarrotBloger';
import './MainPage.css';
/**
 * 로그인 전의 메인페이지
 * @returns 
 */

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      localStorage.removeItem('accessToken');  // 토큰 삭제
      localStorage.removeItem('nickname');  // 토큰 삭제
    }
  }, [navigate]);

  return (
    <div className="App">
      <Header pageType="signup"/>
      <main className="main-content">
        <Profile pageType="signup" />
        <NewPost />
        <PopularPost/>
        <PopularTags/>
        <LotsOfFollowerBloger/>
        <CarrotBloger/>
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
