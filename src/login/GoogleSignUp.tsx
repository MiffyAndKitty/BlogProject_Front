import React, { useEffect, useState } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate,useParams } from "react-router-dom";
import { setSignUp ,checkDuplicated } from '../services/postService';
import { SignUpData,CheckDuplicatedData } from '../types';
import mainCharacterImg from '../img/main_character.png';
import './GoogleSignUp.css';

const SignUp: React.FC = () => {
  let { token } = useParams<{ token: string;  }>();
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
      //if(error.response) alert(`중복 확인 중 오류가 발생했습니다: ${error.response.data.message}`);
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

      setSignUpResult(response.result.toString());
      return response.result;
    } catch (error) {
      console.error("회원가입 오류:", error);     
      if(error.response) alert(`회원가입 중에 오류가 발생했습니다: ${error.response.data.message}`);
      return false;
    }
  };
  useEffect(() => {
    const validateFields = async () => {
      const newErrors = {
        email: validateEmail(email) ? '' : '유효한 이메일 주소를 입력하세요.',
        password: validatePassword(password) ? '' : '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.',
        nickname:
         !validateNickname(nickname)
          ? '닉네임을 입력하세요.'
          :  '',
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
    const nickname=sessionStorage.getItem('nickname');
    
    if(!nickname){navigate(-1)};
    setPassword(null);
    setEmail(nickname);

    if(token !== sessionStorage.getItem('accessToken')) navigate(-1);
  },[]);
   // 문자열의 바이트 길이 계산 함수
   const getByteLength = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
        byteLength += str.charCodeAt(i) > 0x007f ? 3 : 1; // 한글 3바이트, 영문 1바이트
    }
    return byteLength;
  };
  const changeNickName = (value:string)=>{
    
    
    if(getByteLength(value)>30){
     alert('닉네임은 한글10자/영문30자 이하로 입력해주세요.');
    }else{
     setNickname(value);
    }
  
  }
  useEffect(() => {

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
        <div className='signup2'>
          
          <h2 style={{color:"#A9A9A9"}}>회원가입</h2>
          <Form className='form'> 

          <Form.Group className="inputFieldCssForGoogleSignUp mb-3">
            <Form.Control 
              placeholder="닉네임" 
              value={nickname} 
              onChange={(e) =>  changeNickName(e.target.value)} 
              onBlur={() => setTouched({ ...touched, nickname: true })}
              isInvalid={touched.nickname && !!errors.nickname}
              className="transparent-input"
          
            />
            
          </Form.Group>
          <Form.Control.Feedback style={{color:'red', minHeight: '20px', fontSize:'12px'}} type="invalid">{errors.nickname}</Form.Control.Feedback>
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
