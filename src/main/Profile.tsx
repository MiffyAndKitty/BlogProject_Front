// Import the functions you need from the SDKs you need
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React from 'react';
import mainCharacterImg from '../img/main_character.png';

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

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential && credential.accessToken) {
          localStorage.setItem('accessToken', credential.accessToken);
          console.log(result.user);
          navigate(`/dashboard`);
        } else {
          console.error('No accessToken or credential returned from Google login.');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const goToSignUp = () => {
    navigate(`/signup`);
  };

  const goToLogin = () => {
    navigate(`/login`);
  };

  const goToFindID = () => {
    navigate(`/findID`);
  };
  return (
    <section className="profile-section">
        <img src={mainCharacterImg} alt="Main Character" className="mainCharacter" />
        <button className="login-button" onClick={goToLogin}>로그인</button>
        <div className="logins">
          <button onClick={goToFindID}>아이디 찾기</button>
          <span>|</span>
          <button onClick={signInWithGoogle}>구글 로그인</button>
          <span>|</span>
          <button onClick={goToSignUp}>회원가입</button>
        </div>
        

    </section>
  );
};

export default Profile;
