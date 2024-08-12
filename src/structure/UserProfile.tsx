// SearchBar.jsx
import React, { useState,useEffect,useRef } from 'react';
import { Link ,useNavigate } from 'react-router-dom';
import './UserProfile.css';
import  signup_img  from '../img/signup_img.png'

interface UserProfileProp  {
    profileType: 'signup' | 'login' | 'logout';
    profileImage: string;
}
const UserProfile = ({ profileType ,profileImage}) => {
  const [nickname, setNickname] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const nickname = localStorage.getItem('nickname');
      setNickname(nickname);
    }catch (err) {
      console.log('게시물을 불러오는 중에 오류가 발생했습니다.');
    } 
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <>
    {profileType==='logout' &&(
      <div ref={dropdownRef}>
      <img src={signup_img} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
      {dropdownOpen && (
                    <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/myProfileSetting/${nickname}`)}>내 프로필 설정</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate("/")}>로그아웃</button>

                    </div>
      )}
      </div>
      
    )}

    {profileType==='signup' &&(
       <div ref={dropdownRef}>
       <img src={signup_img} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate("/signup")}>회원가입</button>
                       <button className="dropdown-item-profile" onClick={() =>navigate("/login")}>로그인</button>
 
                     </div>
       )}
       </div>
      
    )}

  {profileType==='login' &&(
       <div ref={dropdownRef}>
       <img src={signup_img} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                       <button className="dropdown-item-profile" onClick={() =>navigate("/signup")}>회원가입</button>
                       <button className="dropdown-item-profile" onClick={() =>navigate("/login")}>로그인</button>
                     </div>
       )}
       </div>
      
    )}
    </>
  );
};

export default UserProfile;
