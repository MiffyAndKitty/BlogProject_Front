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
    navigate(`/findID`);
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
        sessionStorage.setItem('accessToken', response.headers['authorization']);
        sessionStorage.setItem('email', response.data['data']);
        sessionStorage.setItem('other_email', response.data['data']);
        fetchMyProfile(email);
      }
      return response.data.result;
    } catch (error) {
     alert(`로그인하는데 오류가 발생했습니다. 오류: ${error}`);     
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
  // useEffect(() => {
  //   try {
  //     const storedNickname = sessionStorage.getItem('nickname');
  //     if (storedNickname) {
  //       setNickname(storedNickname);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }, []);
  useEffect(()=>{
    const newErrors = {
      email: touched.email && !validateEmail(email) ? '유효한 이메일 주소를 입력하세요.' : '',
      password: touched.password && !validatePassword(password) ? '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.' : ''
    };

    setErrors(newErrors);
  },[email, password,touched]);

  useEffect(() => {
    if (loginResult === 'true') {
      alert("로그인에 성공했습니다!!");
      navigate(`/dashboard/${nickname}`);
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
            <h1 style={{color:"#A9A9A9"}}>로그인</h1>
            <Form>
              <Form.Group className="inputFieldCss mb-3">
                <Form.Control 
                  type="email" 
                  placeholder="이메일: newE@gmail.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onBlur={() => setTouched({ ...touched, email: true })}
                  isInvalid={touched.email && !!errors.email}
                  className="transparent-input"
                />
                <Form.Control.Feedback style={{color:'red'}} type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="inputFieldCss mb-3">
                <Form.Label></Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="비밀번호: ******" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  onBlur={() => setTouched({ ...touched, password: true })}
                  isInvalid={touched.password && !!errors.password}
                  className="transparent-input"
                />
                <Form.Control.Feedback style={{color:'red'}} type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
            </Form>

            <Button variant="primary" type="button" className="loginButton" onClick={handleLogin}>로그인</Button>
            <div className="loginsForLocalLogin">
            <button onClick={goToFindID}>아이디 찾기</button>
            <span>|</span>
            <button>비밀번호 찾기</button>
            <span>|</span>
            <button onClick={goToSignUp}>회원가입</button>
          </div>
          </div>

        </div>
      </main>
      <Footer />
  </div>
  );
};

export default LocalLogin;
