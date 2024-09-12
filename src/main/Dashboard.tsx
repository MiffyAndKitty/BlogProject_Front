import React, { useEffect,useState } from 'react';
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
import SSEComponent from './SSEComponent';
/**
 * 로그인 후의 메인페이지
 * @returns 
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);


  const handleNotification = (isNotified: boolean) => {
    setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
  };
  return (
    <div className="App">
      <Header pageType="otherblog" hasNotifications ={hasNotifications}/>
      <main className="main-content">
        <Profile pageType="login" />
        <NewPost />
        <PopularPost/>
        <PopularTags/>
        <LotsOfFollowerBloger/>
        {/* <CarrotBloger/> */}
        <SSEComponent onNotification={handleNotification}></SSEComponent>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
