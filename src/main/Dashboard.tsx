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
import './Dashboard.css';
/**
 * 로그인 후의 메인페이지
 * @returns 
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);
  return (
    <div className="App">
      <Header pageType="login"/>
      <main className="main-content">
        <Profile pageType="login" />
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

export default Dashboard;
