import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import mainCharacterImg from '../img/main_character.png';
import { getLogoutAuth } from '../services/getService';  // 추가된 부분
import { getMyProfile } from '../services/getService';

import './Profile.css';
import Cursor from 'quill/blots/cursor';

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
  pageType: 'login' | 'signup' | 'myBlog' | 'otherBlog' | 'signup_for_blog' | 'profileSetting';
  nicknameParam?:string | null
}

const Profile: React.FC<ProfileProps> = ({ pageType, nicknameParam }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string>("");
  const [error, setError] = useState(null);
  const [nickname, setNickname] = useState<string>();
  const [image, setImage] = useState<string | null>(null);
  const [otherImage, setOtherImage] = useState<string | null>(null);
  const [otherMessage, setOtherMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  

  const goToSignUp = () => {
    navigate(`/signup`);
  };

  const goToLogin = () => {
    navigate(`/login`);
  };

  const goToLogout = async () => {
    try {
      await getLogoutAuth();  // 로그아웃 API 호출
      sessionStorage.removeItem('accessToken');  // 토큰 삭제
      sessionStorage.removeItem('nickname');  // 토큰 삭제
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

  const goToFollower = ()=>{
    navigate(`/follower/${nickname}`);
  };

  /**
   * 내 블로그로 가기로 이동하기 위한 메서드
   */
  const goToMyBlog = () => {
    navigate(`/${nickname}`);
  };

  const goToManagePosts = ()=>{
    navigate(`/getpost/${nickname}`);
  };
  const goToProfileSetting = ()=>{
    navigate(`/myProfileSetting/${user}`);
  };
  const fetchMyProfile = async () => {
    try {
        const sessionStorageEmail = sessionStorage.getItem('other_email');
        if (sessionStorageEmail === null) {
            alert(`잘못된 접근입니다!`);
            navigate('/');
        }
        const fetchedProfile = await getMyProfile(sessionStorageEmail);
        setOtherImage(fetchedProfile.data.user_image);
        setOtherMessage(fetchedProfile.data.user_message);
        
    } catch (err) {
        console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
    }
};
  useEffect(()=>{
    try {
      const storedNickname = sessionStorage.getItem('nickname');
      setImage(sessionStorage.getItem('image'));
      
      const storedMessage = sessionStorage.getItem('message');

      if (storedMessage && storedMessage !== 'null' && storedMessage !== '') {
        setMessage(storedMessage);
        console.log(`typeof message`, typeof storedMessage, storedMessage);
      } else {
        setMessage('상태메시지가 없습니다.');
      }
      if (storedNickname) {
        setNickname(storedNickname);
      }
    } catch (err) {
      console.log(err);
    }
    setUser(sessionStorage.getItem("nickname"));
    fetchMyProfile();
  },[]);

  return (
    <section className={`profile-section ${pageType === 'myBlog' ? 'myBlog' : (pageType==='otherBlog'?'otherBlog':(pageType==='signup_for_blog'?'signup_for_blog':(pageType==='profileSetting'?'profileSetting':'')))}`}>
      
      {pageType === 'signup' && (
        <>
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile_dash" />
          <button className="login-button" onClick={goToLogin} style={{cursor:'pointer'}}>로그인</button>
          <div className="logins_profile">
            <button onClick={goToFindID} style={{cursor:'pointer'}}>아이디 찾기</button>
            <span>|</span>
            <button style={{cursor:'pointer'}}>비밀번호 찾기</button>
            <span>|</span>
            <button onClick={goToSignUp} style={{cursor:'pointer'}}>회원가입</button>
          </div>
        </>
      )}
       {pageType === 'signup_for_blog' && (
        <>
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile_dash" />
          <button className="login-button" onClick={goToLogin} style={{cursor:'pointer'}}>로그인</button>
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
          <div className="profile-container">
            <img 
              src={image || mainCharacterImg} 
              alt="Main Character" 
              className="mainCharacter_profile_login" 
              onError={(e) => { e.currentTarget.src = mainCharacterImg; }}
            />
            <div className="profile-details">
              <span className="username" onClick={goToProfileSetting} style={{cursor:'pointer'}}>{user}</span>
              <hr />
              <span className="status-message">{message}</span>
            </div>
          </div>
          
          <div className="login-buttons-container">
            <button className="login-button_profile" onClick={goToMyBlog}>내 블로그 가기</button>
            <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          </div>
          <div className="logins_profile">
            <button onClick={goToFindID} style={{cursor:'pointer'}}>팔로우</button>
            <span>|</span>
            <button onClick={goToFollower} style={{cursor:'pointer'}}>팔로워</button>
            <span>|</span>
            <button onClick={goToSignUp} style={{cursor:'pointer'}}>내소식</button>
            <span>|</span>
            <button onClick={goToLogout} style={{cursor:'pointer'}}>로그아웃 </button>
          </div>
        </>
      )}
      {pageType === 'myBlog' && (
        <>
         <div className="profile-container">
          <img 
            src={image || mainCharacterImg} 
            alt="Main Character" 
            className="mainCharacter_profile_login" 
            onError={(e) => { e.currentTarget.src = mainCharacterImg; }}
          />

            <div className="profile-details">
              <span className="username" onClick={goToProfileSetting} style={{cursor:'pointer'}}>{user}</span>
              <hr />
              <span className="status-message">{message}</span>
            </div>
          </div>
        
        <div className="login-buttons-container">
          <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          <button className="login-button_profile" onClick={goToManagePosts}>글 관리</button>
        </div>
        <div className="logins_profile">
          <button onClick={goToFindID}>팔로우</button>
          <span>|</span>
          <button onClick={goToFollower}>팔로워</button>
          <span>|</span>
          <button onClick={goToSignUp}>내소식</button>
          <span>|</span>
          <button onClick={goToLogout}>로그아웃 </button>
        </div>
      </>
      )}
    {pageType === 'profileSetting' && (
        <>
         <div className="profile-container">
          <img 
            src={image || mainCharacterImg} 
            alt="Main Character" 
            className="mainCharacter_profile_login" 
            onError={(e) => { e.currentTarget.src = mainCharacterImg; }}
          />

            <div className="profile-details">
              <span className="username" onClick={goToProfileSetting} style={{cursor:'pointer'}}>{user}</span>
              <hr />
              <span className="status-message">{message}</span>
            </div>
          </div>
        
        <div className="login-buttons-container">
          <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          <button className="login-button_profile" onClick={goToMyBlog}>내 블로그 가기</button>
        </div>
        <div className="logins_profile">
          <button onClick={goToFindID}>팔로우</button>
          <span>|</span>
          <button onClick={goToFollower}>팔로워</button>
          <span>|</span>
          <button onClick={goToSignUp}>내소식</button>
          <span>|</span>
          <button onClick={goToLogout}>로그아웃 </button>
        </div>
      </>
      )}
      {pageType === 'otherBlog' && (
        <>
        <div className="profile-container">
        <img src={otherImage|| mainCharacterImg} alt="Main Character" className="mainCharacter_profile_login" />
        
        <div className="profile-details">
        <span className="username"> {nicknameParam}님의 블로그</span>
              <hr />
              <span className="status-message">{otherMessage}</span>
            </div>
        </div>
        
        <div className="logins_profile">
          <button onClick={goToFindID}>팔로우</button>
          <span>|</span>
          <button onClick={goToFollower}>팔로워</button>
        </div>
      </>
      )}
      {error && <div className="error">{error}</div>}
    </section>
  );
};

export default Profile;
