import React, { useEffect, useState } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { setSignUp ,checkDuplicated,verifyEmail } from '../services/postService';
import { SignUpData,CheckDuplicatedData } from '../types';
import openEye from '../img/openEye.png';
import closeEye from '../img/closeEye.png';
import mainCharacterImg from '../img/main_character.png';
import './LocalSignup.css';
import Confirm from './Confirm';
import notConfirm from '../img/not_confirm.png';
const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailAuth, setEmailAuth] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [nickname, setNickname] = useState('');
  const [signUpResult, setSignUpResult] = useState('');
  const [checkDuplicatedResult, setCheckDuplicatedResult] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isEmailFormValid, setIsEmailFormValid] = useState<boolean>(false);
  const [emailError, setEmailError] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 표시 상태 관리
  const [verifiedEmailAuth,setVerifiedEmailAuth] =  useState();
  const [isPasswordVisibleConfirm, setIsPasswordVisibleConfirm] = useState(false); // 비밀번호 확인 표시 상태 관리
  const [isEmailAuthTrue, setIsEmailAuthTrue] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    password2: '',
    nickname: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    password2: false,
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
  const handleVerifyEmail = () =>{
    verifiedEmail();
  };
  const verifiedEmail = async () => {

    try {
      const response = await verifyEmail({email:email});
      if(response){

        setVerifiedEmailAuth(response.data.data);
      }
    } catch (error) {
      console.error("중복 확인 오류:", error);
      if(error.response) alert(`이메일 인증 오류가 발생했습니다: ${error.response.data.message}`);
      
    }
  };
  const handleVerifyEmailConfirm =()=>{

    if(parseInt(emailAuth )===verifiedEmailAuth){
      alert('이메일 인증 확인되었습니다!');
      setIsEmailAuthTrue(true);
    }else{
      alert('이메일 인증 번호를 정확히 다시 입력해주세요!');
      setIsEmailAuthTrue(false);
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

       // 서버에서 받은 response가 { result: boolean, message: string } 형식일 때
    if (response.result.toString() ==='true') {
      setSignUpResult('success');
      alert("회원가입에 성공했습니다!!");
      navigate(`/login`);
    } else {
      setSignUpResult(`error: ${response.message}`);
      alert(`회원가입에 실패했습니다: ${response.message.replace('error: ', '')}`);
    }
      setSignUpResult(response.result.toString());
      return response.result;
    } catch (error) {
      setSignUpResult(`error: ${error.response.data.message}`);
      if(error.response) alert(`회원가입에 실패했습니다: ${error.response.data.message}`);
    console.error("회원가입 오류:", error);
  }
  };
  
  useEffect(() => {
    const validateFields = async () => {
      const newErrors = {
        email:
          touched.email && !validateEmail(email)
            ? '유효한 이메일 주소를 입력하세요.'
            : email.length > 255
            ? '이메일은 255자 이하로 입력하세요.'
            : '',
        password:
          touched.password && !validatePassword(password)
            ? '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.'
            : password.length > 255
            ? '비밀번호는 255자 이하로 입력하세요.'
            : '',
        password2:
          touched.password2 && password !== password2
            ? '비밀번호가 일치하지 않습니다.'
            : '',
        nickname:
          touched.nickname && !validateNickname(nickname)
            ? '닉네임을 입력하세요.': '',
      };
  
      // 이메일 중복 체크 로직 유지
      if (touched.email && validateEmail(email) && email.length <= 255) {
        const isEmailDuplicate = await checkDuplication('user_email', email);
        if (!isEmailDuplicate) {
          newErrors.email = '이미 사용 중인 이메일입니다.';
          setIsEmailFormValid(false);
        } else {
          setIsEmailFormValid(true);
        }
      }
  
      // 닉네임 중복 체크 로직 유지
      if (touched.nickname && validateNickname(nickname) && nickname.length <= 10) {
        const isNicknameDuplicate = await checkDuplication('user_nickname', nickname);
        if (!isNicknameDuplicate) {
          newErrors.nickname = '이미 사용 중인 닉네임입니다.';
        }
      }
  
      setEmailError(newErrors.email);
      setErrors(newErrors);
    };
  
    validateFields();
  }, [email, password, password2, nickname, touched]);
  
  useEffect(() => {
    const isEmailValid = validateEmail(email) && email.length <= 255;
    const isPasswordValid = validatePassword(password) && password.length <= 255;
    const isPassword2Valid = password === password2;
    const isNicknameValid = validateNickname(nickname) && nickname.length <= 10;
    
    setIsEmailFormValid(isEmailValid);
  
    setIsFormValid(
      isEmailValid &&
        isPasswordValid &&
        isPassword2Valid &&
        isNicknameValid &&
        !Object.values(errors).some((error) => error !== '')
    );
  }, [email, password, password2, nickname, errors]);
  
  const handleSignUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // 버튼의 기본 동작 방지
    
     checkSetSignUpResult();
    

  };
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

  return (
    <div className="App">
      <Header pageType="signup"/>
      <main className="main">
      
        <div className='signup2'>
          <h2 style={{color:"#A9A9A9"}}>회원가입</h2>
          <Form className='form'>

          <div className='email-submit'>

            <div>
              <Form.Group className="inputFieldCss mb-3">
                <Form.Control 
                  type="email" 
                  placeholder="이메일" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onBlur={() => setTouched({ ...touched, email: true })}
                  isInvalid={touched.email && !!errors.email}
                  className="transparent-input"
                  maxLength={255}  // 이메일 입력 길이 제한
                />

              </Form.Group>
              <Form.Control.Feedback style={{color:'red', minHeight: '20px', fontSize:'12px'}} type="invalid">{errors.email}</Form.Control.Feedback>
            </div>

            <div>
              <Button variant="primary" type="button" onClick={handleVerifyEmail} className={` ${!isEmailFormValid||emailError ? 'authDisabledButton' : 'authButton'}`} disabled={!isEmailFormValid||emailError}>인증번호 전송</Button>
            </div>
            
          </div>
          {verifiedEmailAuth && (
            <div className="email-submit">
              <div style={{ flexGrow: 2, marginLeft:'25px' }}>
                <Form.Group className="inputFieldCss mb-3">
                  <Form.Control
                    type="text"
                    placeholder="인증번호 입력"
                    value={emailAuth}
                    onChange={(e) => setEmailAuth(e.target.value)}
                    className="transparent-input"
                    maxLength={255}  // 이메일 입력 길이 제한
                  />
                </Form.Group>
              </div>
                    
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div >
                  <Button
                    variant="primary"
                    type="button"
                    onClick={handleVerifyEmailConfirm}
                    className="authButton"
                    
                  >
                    인증번호 확인
                  </Button>
                </div>
                <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                  {isEmailAuthTrue ? (
                    <Confirm />
                  ) : (
                    <img src={notConfirm} style={{ width: '1em', height: '1em' }} alt="Not Confirmed" />
                  )}
                </div>
              </div>
            </div>
          )}

          <Form.Group className="inputFieldCss mb-3">
             <div className="password-container">
                  <Form.Control 
                    type={isPasswordVisible ? 'text' : 'password'} // 상태에 따라 비밀번호 보이기/숨기기
                    placeholder="비밀번호" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    onBlur={() => setTouched({ ...touched, password: true })}
                    isInvalid={touched.password && !!errors.password}
                    className="transparent-input"
                    maxLength={255}  // 이메일 입력 길이 제한
                  />
                   <img
                    src={isPasswordVisible ? closeEye : openEye} // 상태에 따라 아이콘 전환
                    alt="Toggle visibility"
                    className="toggle-password-visibility"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)} // 클릭 시 상태 변경
                    style={{ cursor: 'pointer',  width:'15px', height:'15px' }}
                  />
                </div>
          </Form.Group>
          <Form.Control.Feedback style={{color:'red', minHeight: '20px', fontSize:'12px'}} type="invalid">{errors.password}</Form.Control.Feedback>

          <Form.Group className="inputFieldCss mb-3">
          <div className="password-container">
            <Form.Control 
              type={isPasswordVisibleConfirm ? 'text' : 'password'} // 상태에 따라 비밀번호 보이기/숨기기
              placeholder="비밀번호 확인" 
              value={password2} 
              onChange={(e) => setPassword2(e.target.value)} 
              onBlur={() => setTouched({ ...touched, password2: true })}
              isInvalid={touched.password2 && !!errors.password2}
              className="transparent-input"
              maxLength={255}  // 이메일 입력 길이 제한
            />
             <img
                    src={isPasswordVisibleConfirm ? closeEye : openEye} // 상태에 따라 아이콘 전환
                    alt="Toggle visibility"
                    className="toggle-password-visibility"
                    onClick={() => setIsPasswordVisibleConfirm(!isPasswordVisibleConfirm)} // 클릭 시 상태 변경
                    style={{ cursor: 'pointer',  width:'15px', height:'15px' }}
                  />
          </div>
          </Form.Group>
          <Form.Control.Feedback style={{color:'red', minHeight: '20px', fontSize:'12px'}} type="invalid">{errors.password2}</Form.Control.Feedback>

            
          <Form.Group className="inputFieldCss mb-3">
            <Form.Control 
              placeholder="닉네임" 
              value={nickname} 
              onChange={(e) => changeNickName(e.target.value)} 
              onBlur={() => setTouched({ ...touched, nickname: true })}
              isInvalid={touched.nickname && !!errors.nickname}
              className="transparent-input"
             
            />
            
          </Form.Group>
          <Form.Control.Feedback style={{color:'red', minHeight: '20px', fontSize:'12px'}} type="invalid">{errors.nickname}</Form.Control.Feedback>

          </Form>
          <Button variant="primary" type="button" onClick={handleSignUp} className={`loginButton ${!isFormValid || !isEmailAuthTrue ? 'disabledButton' : ''}`} disabled={!isFormValid|| !isEmailAuthTrue}>회원가입</Button>
        </div>
        <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_localsignup" />
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
