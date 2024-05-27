// Import the functions you need from the SDKs you need
import React, { useState } from 'react';
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
  pageType: 'login' | 'signup' ;
}
const Profile: React.FC<ProfileProps> = ({pageType}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        localStorage.setItem('accessToken', credential.accessToken);
        setUser(result.user);
        navigate(`/dashboard`);
      } else {
        console.error('No accessToken or credential returned from Google login.');
        setError('No accessToken or credential returned from Google login.');
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };
  const goToSignUp = () => {
    navigate(`/signup`);
  };

  const goToLogin = () => {
    navigate(`/login`);
  };
  const goToLogout = async() => {
    try {
      await getLogoutAuth();  // 로그아웃 API 호출
      localStorage.removeItem('accessToken');  // 토큰 삭제
      navigate(`/`);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }

  };
  const goToFindID = () => {
    navigate(`/findID`);
  };
  return (
    <section className="profile-section">
        <img src={mainCharacterImg} alt="Main Character" className="mainCharacter" />
        {pageType === 'signup' && (
        <>
          <button className="login-button" onClick={goToLogin}>로그인</button>
          <div className="logins">
            <button onClick={goToFindID}>아이디 찾기</button>
            <span>|</span>
            <button onClick={signInWithGoogle}>비밀번호 찾기</button>
            <span>|</span>
            <button onClick={goToSignUp}>회원가입</button>
          </div>
        </>
      )}
      {pageType === 'login' && (
        <>
          <button className="login-button" onClick={goToLogout}>로그아웃</button>
          <div className="logins">
            {/* <button onClick={goToFindID}>아이디 찾기</button>
            <span>|</span>
            <button onClick={signInWithGoogle}>구글 로그인</button>
            <span>|</span>
            <button onClick={goToSignUp}>회원가입</button> */}
          </div>
        </>
      )}

      {user && <div>Welcome, {user.displayName}</div>}
      {error && <div className="error">{error}</div>}

    </section>
  );
};

export default Profile;
