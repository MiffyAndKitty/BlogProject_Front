import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyProfile } from '../services/getService';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [nickname, setNickname] = useState<string>('');
  const [isProfileFetched, setIsProfileFetched] = useState<boolean>(false);

  const fetchMyProfile = async (email: string) => {
    try {
      const fetchedProfile = await getMyProfile(email);
      console.log('fetchedProfile.data.user_nickname', fetchedProfile.data.user_nickname);
      setNickname(fetchedProfile.data.user_nickname);
      setIsProfileFetched(true);  // 프로필이 성공적으로 fetch되었음을 표시
    } catch (err) {
      console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const email = searchParams.get('data');

    if (token && token !== 'undefined' && email) {
      fetchMyProfile(email);
    } else if (token === 'undefined') {
      fetchMyProfile(email).then(() => {
        navigate(`/google/signup/${nickname}`);
      });
    } else if (error) {
      console.error(error);
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isProfileFetched) {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const email = searchParams.get('data');

      if (token && token !== 'undefined' && nickname) {
        sessionStorage.setItem('accessToken', token);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('nickname', nickname);
        navigate(`/dashboard/${nickname}`);
      } else if (token === 'undefined' && nickname) {
        sessionStorage.setItem('nickname', nickname);
        navigate(`/google/signup/${nickname}`);
      }
    }
  }, [isProfileFetched, nickname, navigate, location]);

  return <div>Loading...</div>;
};

export default AuthCallback;
