import React, { useEffect, useState } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { setLogin } from '../services/postService';
import { getGoogleLogin } from '../services/getService';  // 추가된 부분
import { loginData } from '../types';
import mainCharacterImg from '../img/main_character.png';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const goToLocalLogin = () => {
    navigate(`/locallogin`);
  };
  const goToGoogleLogin = async() => {
    try {
      window.location.href = 'http://mk-blogservice.site:65020/auth/google';
      // await getGoogleLogin();  // 로그아웃 API 호출
      // navigate(`/dashboard`);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="App">
      <Header pageType="signup"/>
      <main className="main">
        <div className='signup'>
            <div>
              <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile" />
            </div>
            <div>
              <button className="login-button" style={{ marginBottom: '10px' }} onClick={goToLocalLogin}>계정으로 로그인</button>
            </div>
            <div>
            <button className="google-login-button" onClick={goToGoogleLogin}>
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="google-logo" />
            Google 계정으로 로그인
          </button>
            </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default Login;
