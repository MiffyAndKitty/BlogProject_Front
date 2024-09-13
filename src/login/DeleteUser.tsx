import React, { useEffect, useState } from 'react';
import { Link,useParams, useLocation,useNavigate } from 'react-router-dom';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { setLogin } from '../services/postService';
import { loginData } from '../types';
import {deleteUser} from '../services/deleteService';
import openEye from '../img/openEye.png';
import closeEye from '../img/closeEye.png';
import mainCharacterImg from '../img/main_character.png';
import './LocalSignup.css';

const DeleteUser: React.FC = () => {
  const { token} = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [nickname, setNickname] = useState('');
  const [signUpResult, setSignUpResult] = useState('');
  const [checkDuplicatedResult, setCheckDuplicatedResult] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 표시 상태 관리
  const [isPasswordVisibleConfirm, setIsPasswordVisibleConfirm] = useState(false); // 비밀번호 확인 표시 상태 관리
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    password2: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    password2: false,
  });
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleDeleteUser = ()=>{
    checkSetLoginResult();
  };

  const checkSetLoginResult = async () => {
    const newPost: loginData = { 
      email: email,
      password: password,
    };
    let response:any={};
    try {
      response = await setLogin(newPost);
      const loginSuccess = response.data.result;
      const message = response.data.message;

      console.log(`token`,decodeJWT(token))
      console.log(`authorization`, decodeJWT(response.headers['authorization']))
      if(decodeJWT(token).id === decodeJWT(response.headers['authorization']).id){
        fetchDeleteUser();
      } else {
        // 실패한 경우 메시지 처리
        alert( "회원 탈퇴에 실패했습니다.");
      }
      return response.data.result;
    } catch (error) {
      // 오류 발생 시 메시지 출력
      console.log("회원 탈퇴 오류 발생:", error); 
      if(error.response) alert(`회원 탈퇴 실패했습니다: ${error.response.data.message}`);
      return false;
    }
  };

  const fetchDeleteUser = async()=>{
    try{
        let deleteUserResponse = await deleteUser();
        if(deleteUserResponse) {
            alert('회원탈퇴에 성공했습니다!');
            navigate('/');
        }
    }catch(error){
         // 오류 발생 시 메시지 출력
      console.log("회원 탈퇴에 오류 발생:", error); 
      if(error.response) alert(`회원 탈퇴에 실패했습니다: ${error.response.data.message}`);
    }
  };

  const decodeJWT=(token)=>{
    // 'Bearer '가 있으면 이를 제거
    if (token.startsWith('Bearer ')) {
      token = token.slice(7); // 'Bearer '는 7글자이므로, 이를 제거
    }
  
    // 토큰을 "." 기준으로 분리
    const parts = token.split('.');
  
    if (parts.length !== 3) {
      throw new Error('잘못된 JWT 형식입니다.');
    }
  
    // Base64 URL 디코딩을 위해 replace로 URL-safe 문자를 일반 Base64 문자로 변경
    const base64Url = parts[1]; // 페이로드 부분은 두 번째
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Base64 디코딩 후 JSON 문자열을 얻기
    const decodedPayload = atob(base64);
    
    // JSON 파싱하여 원본 데이터를 얻기
    return JSON.parse(decodedPayload);
  };

  useEffect(() => {
    const validateFields = async () => {
      const newErrors = {
        email: touched.email && !validateEmail(email) ? '유효한 이메일 주소를 입력하세요.' : '',
        password: touched.password && !validatePassword(password) ? '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.' : '',
        password2: touched.password2 && password !== password2 ? '비밀번호가 일치하지 않습니다.' : '',
     
      };

      setErrors(newErrors);
    };

    validateFields();
  }, [email, password, password2,touched]);
  useEffect(() => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPassword2Valid = password === password2;
  
    // 모든 필드가 유효하면 폼이 유효한 상태로 설정
    setIsFormValid(isEmailValid && isPasswordValid && isPassword2Valid  && !Object.values(errors).some(error => error !== ''));
  }, [email, password, password2, errors]);
  

  return (
    <div className="App">
      <Header pageType="otherblog"/>
      <main className="main">
      
        <div className='signup2'>
          <h2 style={{color:"#A9A9A9"}}>회원 탈퇴 </h2>
          <Form className='form'>
          <Form.Group className="inputFieldCss mb-3">
            <Form.Control 
              type="email" 
              placeholder="이메일" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              onBlur={() => setTouched({ ...touched, email: true })}
              isInvalid={touched.email && !!errors.email}
              className="transparent-input"
            />
            
          </Form.Group>
          <Form.Control.Feedback style={{color:'red', minHeight: '20px', fontSize:'12px'}} type="invalid">{errors.email}</Form.Control.Feedback>

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

            

          </Form>
          <Button variant="primary" type="button" onClick={handleDeleteUser} className={` ${!isFormValid ? 'authDisabledButton' : 'authButton'}`} disabled={!isFormValid}>회원 탈퇴하기</Button>
        </div>
        <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_localsignup" />
      </main>
      <Footer />
    </div>
  );
};

export default DeleteUser;
