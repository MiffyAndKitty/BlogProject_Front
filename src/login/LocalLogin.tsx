import React, { useEffect, useState } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { setLogin } from '../services/postService';
import { loginData } from '../types';
import mainCharacterImg from '../img/main_character.png';
import './LocalLogin.css';

const LocalLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState('');;
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };
  const checkSetLoginResult = async () => {
    const newPost: loginData = { 
      email: email,
      password: password,
    };

    try {
      const response = await setLogin(newPost);
      console.log(`checkSetLoginResult`,response.data.result.toString())
      console.log(`loginResult`,loginResult)
      setLoginResult(response.data.result.toString());
      console.log(response);
      if (response.data.result.toString() === 'true' && response.headers['authorization']) {
        localStorage.setItem('accessToken', response.headers['authorization']);
      }
      return response.data.result;
    } catch (error) {
      console.error("로그인 오류:", error);     
      return false;
    }
  };
  useEffect(() => {
    const validateFields = async () => {
      const newErrors = {
        email: validateEmail(email) ? '' : '유효한 이메일 주소를 입력하세요.',
        password: validatePassword(password) ? '' : '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.'
      };
      setErrors(newErrors);
    };

    validateFields();
  }, [email, password]);

  const handleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // 버튼의 기본 동작 방지

    // if (Object.values(errors).some((error) => error !== '')) {
    //   alert("입력된 값에 오류가 있습니다. 다시 확인해주세요.");
    //   return;
    // }

    const newPost: loginData = { 
      email: email,
      password: password,
    };
    const isSetSignUpResult = await checkSetLoginResult();

  };

  useEffect(() => {
    if (loginResult === 'true') {
      alert("로그인에 성공했습니다!!");
      
      navigate(`/dashboard`);
      
    } else if (loginResult === 'false') {
      alert("로그인에 실패했습니다!!");
    }
  }, [loginResult]);

  return (
    <div className="App">
      <Header pageType="signup"/>
      <main className="main">
        <div className='signup'>
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter" />
          <h2>로그인</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>이메일: </Form.Label>
              <Form.Control 
                type="email" 
                placeholder="newE@gmail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>비밀번호: </Form.Label>
              <Form.Control 
                type="password" 
                placeholder="newpwd" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
          </Form>
          <Button variant="primary" type="button" onClick={handleLogin}>로그인하기</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LocalLogin;
