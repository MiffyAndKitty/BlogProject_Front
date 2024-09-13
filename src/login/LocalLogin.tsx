import React, { useState, useEffect } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { setLogin } from '../services/postService';
import { getMyProfile } from '../services/getService';
import { loginData } from '../types';
import mainCharacterImg from '../img/main_character.png';
import openEye from '../img/openEye.png';
import closeEye from '../img/closeEye.png';
import './LocalLogin.css';

const LocalLogin: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState('');
  const [message, setMessage] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [isProfileFetched, setIsProfileFetched] = useState<boolean>(false);
  const [areYouFollowing, setAreYouFollowing] = useState<string>('');
  const [areYouFollowed, setAreYouFollowed] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 표시 상태 관리



  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const goToSignUp = () => {
    navigate(`/signup`);
  };

  const goToFindID = () => {
    // navigate(`/findID`);
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
      console.log(`checkSetLoginResult`,loginSuccess.toString())
      console.log(`loginResult`,loginResult)
      setLoginResult(loginSuccess.toString());
      console.log(response);

      if (loginSuccess.toString() === 'true' && response.headers['authorization']) {
        sessionStorage.setItem('accessToken', response.headers['authorization']);
        sessionStorage.setItem('email', response.data['data']);
        fetchMyProfile(email);
      } else {
        // 실패한 경우 메시지 처리
        alert(message || "로그인에 실패했습니다.");
      }
      return response.data.result;
    } catch (error) {
      // 오류 발생 시 메시지 출력
      console.log("로그인 오류 발생:", error); 
      if(error.response) alert(`로그인 실패했습니다: ${error.response.data.message}`);
      return false;
    }
  };

  const fetchMyProfile = async (email: string) => {
    try {
      const fetchedProfile = await getMyProfile(email);
      console.log('fetchedProfile.data.user_nickname', fetchedProfile.data.user_nickname);
      setNickname(fetchedProfile.data.user_nickname);
      setMessage(fetchedProfile.data.user_message);
      setImage(fetchedProfile.data.user_image);
      setAreYouFollowing(fetchedProfile.data.areYouFollowing);
      setAreYouFollowed(fetchedProfile.data.areYouFollowed);
      sessionStorage.setItem('nickname', fetchedProfile.data.user_nickname);
      sessionStorage.setItem('image', fetchedProfile.data.user_image);
      sessionStorage.setItem('message', fetchedProfile.data.user_message);
      sessionStorage.setItem('areYouFollowing', areYouFollowing);
      sessionStorage.setItem('areYouFollowed', areYouFollowed);
      setIsProfileFetched(true);  // 프로필이 성공적으로 fetch되었음을 표시
    } catch (err) {
      console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
      if(err.response) alert(`개인정보를 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`);
    }
  };

  const handleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // 버튼의 기본 동작 방지

    const newErrors = {
      email: !validateEmail(email) ? '유효한 이메일 주소를 입력하세요.' : '',
      password: !validatePassword(password) ? '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.' : ''
    };
  
    setErrors(newErrors);
  
    if (Object.values(newErrors).some((error) => error !== '')) {
      alert("입력된 값에 오류가 있습니다. 다시 확인해주세요.");
      return;
    }

    const isSetSignUpResult = await checkSetLoginResult();
  };

  useEffect(()=>{
    const newErrors = {
      email: touched.email && !validateEmail(email) ? '유효한 이메일 주소를 입력하세요.' : '',
      password: touched.password && !validatePassword(password) ? '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.' : ''
    };

    setErrors(newErrors);
  },[email, password,touched]);

  const goToFindPW = () => {
    navigate(`/find-password`);
  };
  
  useEffect(() => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
  
    // 모든 필드가 유효하면 폼이 유효한 상태로 설정
    setIsFormValid(isEmailValid && isPasswordValid&& !Object.values(errors).some(error => error !== ''));
  }, [email, password, errors]);

  useEffect(() => {
    if (loginResult === 'true') {
      alert("로그인에 성공했습니다!!");
      navigate(`/dashboard`);
    } else if (loginResult === 'false') {
      alert("로그인에 실패했습니다!!");
    }
  }, [loginResult, navigate]);

  return (
    <div className="App">
      <Header pageType="signup"/>
      <main className="main">
        <div className="content-wrapper">
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter" />
          <div className='loginForm'>
            <h2 style={{color:"#A9A9A9"}}>로그인</h2>
            <Form>
              <Form.Group className="inputFieldCss mb-3">
                <div className='password-container'>
                <Form.Control 
                  type="email" 
                  placeholder="이메일" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onBlur={() => setTouched({ ...touched, email: true })}
                  isInvalid={touched.email && !!errors.email}
                  className="transparent-input"
                />
                </div>
              
                
              </Form.Group>
              <Form.Control.Feedback style={{color:'red', minHeight: '20px', fontSize:'12px'}} type="invalid">{errors.email}</Form.Control.Feedback>

              <Form.Group className="inputFieldCss mb-3">
                <Form.Label></Form.Label>
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
            </Form>

            <Button variant="primary" type="button" className={`loginButton ${!isFormValid ? 'disabledButton' : ''}`} onClick={handleLogin} disabled={!isFormValid}>로그인</Button>
            <div className="loginsForLocalLogin">
            {/* <Button onClick={goToFindID}>아이디 찾기</Button>
            <span>|</span> */}
            <Button onClick={goToFindPW} >비밀번호 찾기</Button>
            <span>|</span>
            <Button onClick={goToSignUp}>회원가입</Button>
          </div>
          </div>

        </div>
      </main>
      <Footer />
  </div>
  );
};

export default LocalLogin;
