import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import mainCharacterImg from '../img/main_character.png';
import { getLogoutAuth } from '../services/getService';  // 추가된 부분

import './Profile.css';

const firebaseConfig = {
  apiKey: "AIzaSyCfoepTZGKKL7SubUSCy81pHHag-vDSWmY",
  authDomain: "mk-blog-e88c8.firebaseapp.com",
  projectId: "mk-blog-e88c8",
  storageBucket: "mk-blog-e88c8.appspot.com",
  messagingSenderId: "329301984688",
  appId: "1:329301984688:web:f7e2819bdd730419a64275",
  measurementId: "G-KGMPV32SSK"
};
console.log(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth 참조 가져오기
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

interface ProfileProps {
  pageType: 'login' | 'signup' | 'myBlog';
}

const Profile: React.FC<ProfileProps> = ({ pageType }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string>("");
  const [error, setError] = useState(null);
  const [nickname, setNickname] = useState<string>();

  const goToSignUp = () => {
    navigate(`/signup`);
  };

  const goToLogin = () => {
    navigate(`/login`);
  };

  const goToLogout = async () => {
    try {
      await getLogoutAuth();  // 로그아웃 API 호출
      localStorage.removeItem('accessToken');  // 토큰 삭제
      localStorage.removeItem('nickname');  // 토큰 삭제
      navigate(`/`);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const goToFindID = () => {
    navigate(`/findID`);
  };

  /**
   * 새 글 작성하기로 이동하기 위한 메서드
   */
  const goToWritePost = () => {
    navigate(`/writenewpost/${nickname}`);
  };

  /**
   * 내 블로그로 가기로 이동하기 위한 메서드
   */
  const goToMyBlog = () => {
    navigate(`/blogmain/${nickname}`);
  };

  const goToManagePosts = ()=>{
    navigate(`/getpost/${nickname}`);
  }

  useEffect(()=>{
    try {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    } catch (err) {
      console.log(err);
    }
    setUser(localStorage.getItem("nickname"));
  },[]);

  return (
    <section className={`profile-section ${pageType === 'myBlog' ? 'myBlog' : ''}`}>
      
      {pageType === 'signup' && (
        <>
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile_dash" />
          <button className="login-button" onClick={goToLogin}>로그인</button>
          <div className="logins_profile">
            <button onClick={goToFindID}>아이디 찾기</button>
            <span>|</span>
            <button>비밀번호 찾기</button>
            <span>|</span>
            <button onClick={goToSignUp}>회원가입</button>
          </div>
        </>
      )}
      {pageType === 'login' && (
        <>
          <div>
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile_login" />
          <span> {user}</span>
          </div>
          
          <div className="login-buttons-container">
            <button className="login-button_profile" onClick={goToMyBlog}>내 블로그 가기</button>
            <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          </div>
          <div className="logins_profile">
            <button onClick={goToFindID}>팔로우</button>
            <span>|</span>
            <button>팔로워</button>
            <span>|</span>
            <button onClick={goToSignUp}>내소식</button>
            <span>|</span>
            <button onClick={goToLogout}>로그아웃 </button>
          </div>
        </>
      )}
      {pageType === 'myBlog' && (
        <>
        <div className="profile-container">
        <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile_login" />
        <span className="username"> {user}</span>
        </div>
        
        <div className="login-buttons-container">
          <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          <button className="login-button_profile" onClick={goToManagePosts}>글 관리</button>
        </div>
        <div className="logins_profile">
          <button onClick={goToFindID}>팔로우</button>
          <span>|</span>
          <button>팔로워</button>
          <span>|</span>
          <button onClick={goToSignUp}>내소식</button>
          <span>|</span>
          <button onClick={goToLogout}>로그아웃 </button>
        </div>
      </>
      )}
      {error && <div className="error">{error}</div>}
    </section>
  );
};

export default Profile;
