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

const MainPage: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Profile />
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
