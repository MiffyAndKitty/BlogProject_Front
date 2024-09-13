import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyProfile } from '../services/getService';
import mainCharacterImg from '../img/main_character.png';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [nickname, setNickname] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [isProfileFetched, setIsProfileFetched] = useState<boolean>(false);
  const [areYouFollowing, setAreYouFollowing] = useState<string>('');
  const [areYouFollowed, setAreYouFollowed] = useState<string>('');

  const fetchMyProfile = async (email: string) => {
    try {
      const fetchedProfile = await getMyProfile(email);
      console.log('fetchedProfile.data.user_nickname', fetchedProfile.data.user_nickname);
      setNickname(fetchedProfile.data.user_nickname);
      setMessage(fetchedProfile.data.user_message);
      setAreYouFollowing(fetchedProfile.data.areYouFollowing);
      setAreYouFollowed(fetchedProfile.data.areYouFollowed);
      setImage(fetchedProfile.data.user_image ? fetchedProfile.data.user_image : mainCharacterImg);
      setIsProfileFetched(true);  // 프로필이 성공적으로 fetch되었음을 표시
    } catch (err) {
      console.log(`개인정보를 불러오는 중에 오류가 발생했습니다: ${err}`);
      alert(`개인정보를 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`);

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
        sessionStorage.setItem('image', image);
        sessionStorage.setItem('message', message);
        sessionStorage.setItem('areYouFollowing', areYouFollowing);
        sessionStorage.setItem('areYouFollowed', areYouFollowed);
        navigate(`/dashboard`);
      } else if (token === 'undefined' && nickname) {
        sessionStorage.setItem('email', email);
      
        sessionStorage.setItem('nickname', nickname);
        sessionStorage.setItem('image', image);
        sessionStorage.setItem('message', message);
        sessionStorage.setItem('areYouFollowing', areYouFollowing);
        sessionStorage.setItem('areYouFollowed', areYouFollowed);
        navigate(`/google/signup/${nickname}`);
      }
    }
  }, [isProfileFetched, nickname, navigate, location]);

  return <div>Loading...</div>;
};

export default AuthCallback;
