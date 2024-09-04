import React, { useEffect, useState } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { setSignUp ,checkDuplicated } from '../services/postService';
import { SignUpData,CheckDuplicatedData } from '../types';
import mainCharacterImg from '../img/main_character.png';
import './GoogleSignUp.css';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [signUpResult, setSignUpResult] = useState('');;
  const [checkDuplicatedResult, setCheckDuplicatedResult] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    nickname: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    nickname: false,
  });
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateNickname = (nickname: string) => {
    return nickname.trim() !== '';
  };
  
  const checkDuplication = async (column: string, data: string) => {
    const newPost: CheckDuplicatedData = {
      column: column,
      data: data,
    };

    try {
      const response = await checkDuplicated(newPost);
      return response.result;  // 가정: API 응답이 { result: 계산된 값 } 형식일 때
    } catch (error) {
      console.error("중복 확인 오류:", error);
      return false;
    }
  };
  const checkSetSignUpResult = async () => {
    const newPost: SignUpData = { 
      email: email,
      provider: 'google',
      password: null,
      nickname: nickname,
    };

    try {
      const response = await setSignUp(newPost);
      console.log(`setSignUpResult`,response.result.toString())
      console.log(`signUpResult`,signUpResult)
      setSignUpResult(response.result.toString());
      return response.result;
    } catch (error) {
      console.error("회원가입 오류:", error);     
      return false;
    }
  };
  useEffect(() => {
    const validateFields = async () => {
      const newErrors = {
        email: validateEmail(email) ? '' : '유효한 이메일 주소를 입력하세요.',
        password: validatePassword(password) ? '' : '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.',
        nickname: validateNickname(nickname) ? '' : '닉네임을 입력하세요.',
      };
      if (validateEmail(email)) {
        const isEmailDuplicate = await checkDuplication('user_email', email);
        if (isEmailDuplicate) {
          newErrors.email = '사용 가능한 이메일입니다.';
        }else{
          newErrors.email = '이미 사용 중인 이메일입니다.';
        }
      }
      if (validateNickname(nickname)) {
        const isNicknameDuplicate = await checkDuplication('user_nickname', nickname);
        if (!isNicknameDuplicate) {
          newErrors.nickname = '이미 사용 중인 닉네임입니다.';
        }
      }
      setErrors(newErrors);
    };
    validateFields();
  }, [email, password, nickname]);

  const handleSignUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // 버튼의 기본 동작 방지
    await checkSetSignUpResult();
  };

  useEffect(()=>{
    setEmail(sessionStorage.getItem('nickname'));
    setPassword(null);
  },[]);

  useEffect(() => {
    console.log(`
    
    signUpResult
    
    `,signUpResult)
    if (signUpResult === 'true') {
      alert("회원가입에 성공했습니다!!");
      sessionStorage.setItem('nickname', nickname);
      navigate(`/login`);
      
    } else if (signUpResult === 'false') {
      alert("회원가입에 실패했습니다!!");
    }
  }, [signUpResult]);

  return (
    <div className="App">
      <Header pageType="signup"/>
      <main className="main">
        <div className='signup'>
          
          <h2 style={{color:"#A9A9A9"}}>회원가입</h2>
          <Form>

          <Form.Group className="inputFieldCssForGoogleSignUp mb-3">
            <Form.Control 
              placeholder="닉네임" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              onBlur={() => setTouched({ ...touched, nickname: true })}
              isInvalid={touched.nickname && !!errors.nickname}
              className="transparent-input"
            />
            
          </Form.Group>
          <Form.Control.Feedback style={{color:'red'}} type="invalid">{errors.nickname}</Form.Control.Feedback>
          </Form>
          <Button className={'login-button'} variant="primary" type="button" onClick={handleSignUp}>회원가입</Button>
        </div>
        <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_google" />
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
