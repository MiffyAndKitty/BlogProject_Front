import React from 'react';
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
