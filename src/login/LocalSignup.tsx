import React, { useEffect, useState } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { setSignUp ,checkDuplicated } from '../services/postService';
import { SignUpData,CheckDuplicatedData } from '../types';
import mainCharacterImg from '../img/main_character.png';
import './LocalSignup.css';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [nickname, setNickname] = useState('');
  const [signUpResult, setSignUpResult] = useState('');;
  const [checkDuplicatedResult, setCheckDuplicatedResult] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    password2: '',
    nickname: '',
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
      password: password,
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
        password2: password === password2 ? '' : '비밀번호가 일치하지 않습니다.',
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
        if (isNicknameDuplicate) {
          newErrors.nickname = '사용 가능한 닉네임입니다.';
        }else{
          newErrors.nickname = '이미 사용 중인 닉네임입니다.';
        }
      }

      setErrors(newErrors);
    };

    validateFields();
  }, [email, password, password2, nickname]);

  const handleSignUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // 버튼의 기본 동작 방지

    // if (Object.values(errors).some((error) => error !== '')) {
    //   alert("입력된 값에 오류가 있습니다. 다시 확인해주세요.");
    //   return;
    // }

    const newPost: SignUpData = { 
      email: email,
      password: password,
      nickname: nickname,
    };
    const isSetSignUpResult = await checkSetSignUpResult();
    // if (isSetSignUpResult === 'true') {
    //   alert("회원가입에 성공했습니다!!");
    // } else if (isSetSignUpResult === 'false') {
    //   alert("회원가입에 실패했습니다!!");
    // }
    // try {
    //   const postData = await checkSetSignUpResult(newPost);
    //   setSignUpResult(postData.result);  // 가정: API 응답이 { result: 계산된 값 } 형식일 때
     
    // } catch (error) {
    //   console.error("회원가입 오류:", error);
    //   setSignUpResult('false'); // 오류 발생 시 결과를 'false'로 설정
    //   alert("회원가입 중 오류가 발생했습니다.");
    // }
  };

  useEffect(() => {
    console.log(`
    
    signUpResult
    
    `,signUpResult)
    if (signUpResult === 'true') {
      alert("회원가입에 성공했습니다!!");
      navigate(`/login`);
      
    } else if (signUpResult === 'false') {
      alert("회원가입에 실패했습니다!!");
    }
  }, [signUpResult]);

  return (
    <div className="App">
      <Header pageType="login"/>
      <main className="main">
        <div className='signup'>
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter" />
          <h2>회원가입</h2>
          <Form>
            <Form.Group className="inputFieldCssForSignUp mb-3">
              <Form.Control 
                type="email" 
                placeholder="이메일: newE@gmail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                isInvalid={!!errors.email}
                className="transparent-input"
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="inputFieldCssForSignUp mb-3">
              <Form.Control 
                type="password" 
                placeholder="비밀번호: *******" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                isInvalid={!!errors.password}
                className="transparent-input"
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="inputFieldCssForSignUp mb-3">
              <Form.Control 
                type="password" 
                placeholder="비밀번호 확인: *******" 
                value={password2} 
                onChange={(e) => setPassword2(e.target.value)} 
                isInvalid={!!errors.password2}
                className="transparent-input"
              />
              <Form.Control.Feedback type="invalid">{errors.password2}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="inputFieldCssForSignUp mb-3">
              <Form.Control 
                placeholder="닉네임: nickname" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                isInvalid={!!errors.nickname}
                className="transparent-input"
              />
              <Form.Control.Feedback type="invalid">{errors.nickname}</Form.Control.Feedback>
            </Form.Group>
          </Form>
          <Button variant="primary" type="button" onClick={handleSignUp}>회원가입</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
