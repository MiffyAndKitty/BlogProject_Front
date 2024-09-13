import React, { useEffect, useState } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Form from 'react-bootstrap/Form';
import './FindPassword.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { setTempPasswd  } from '../services/postService';
import mainCharacterImg from '../img/main_character.png';
import './LocalSignup.css';

const FindPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [signUpResult, setSignUpResult] = useState('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    email: '',

  });
  const [touched, setTouched] = useState({
    email: false,

  });
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

 
 const handleFindPasswd = async () => {
      
      try{

        console.log(`비밀번호 재설정 `,{email:email})
        const result = await setTempPasswd({email:email});
        
        if(result) {
          alert(`비밀번호 재설정 메일 전송 성공했습니다!`);
          navigate(`/locallogin`);

        }
      }catch(err){
        console.log(err)
         // 상태 코드에 따른 에러 메시지 처리
         if(err.response) alert(`이메일 전송 중에 오류가 발생했습니다: ${err.response.data.message}`); 
      }
  };
  
  useEffect(() => {
    const validateFields = async () => {
      const newErrors = {
        email: touched.email && !validateEmail(email) ? '유효한 이메일 주소를 입력하세요.' : '',
      };


      setErrors(newErrors);
    };

    validateFields();
  }, [email, touched]);

  useEffect(() => {
    const isEmailValid = validateEmail(email);
  
    // 모든 필드가 유효하면 폼이 유효한 상태로 설정
    setIsFormValid(isEmailValid  && !Object.values(errors).some(error => error !== ''));
  }, [email, errors]);

  return (
    <div className="App">
      <Header pageType="signup"/>
      <main className="main">
      
        <div className='signup2'>
          <h2 style={{color:"#A9A9A9"}}>비밀번호 찾기</h2>

          <div className='form-btn'>
            <Form className='form'>
              <Form.Group className="findpasswd-inputFieldCss mb-3">
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
            </Form>
            <Button variant="primary" type="button" onClick={handleFindPasswd} className={` ${!isFormValid ? 'authDisabledButton' : 'authButton'}`} disabled={!isFormValid}>인증번호 전송</Button>
          </div>


        </div>
        <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_localsignup" />
      </main>
      <Footer />
    </div>
  );
};

export default FindPassword;
