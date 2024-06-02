import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // JWT 토큰을 로컬 스토리지에 저장
      localStorage.setItem('accessToken', token);
      // 대시보드로 리다이렉션
      navigate('/dashboard');
    } else if (error) {
      // 오류 처리 (로그인 페이지로 리다이렉션하거나 오류 메시지 표시)
      console.error(error);
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
