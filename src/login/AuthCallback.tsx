import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const nickname = searchParams.get('data');

    if (token && token !== 'undefined') {
      // JWT 토큰을 로컬 스토리지에 저장
      try {
        console.log(token, typeof token);
        localStorage.setItem('accessToken', token);
        if (nickname) {
          localStorage.setItem('nickname', nickname);
        }
        console.log(token);
        console.log(nickname);
      } catch (error) {
        console.error("Invalid token", error);
      }

      // 대시보드로 리다이렉션
      navigate(`/dashboard/${nickname}`);
    } else if (token === 'undefined') {
      navigate(`/google/signup/${nickname}`);
      if (nickname) {
        localStorage.setItem('nickname', nickname);
      }
    } else if (error) {
      // 오류 처리 (로그인 페이지로 리다이렉션하거나 오류 메시지 표시)
      console.error(error);
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
