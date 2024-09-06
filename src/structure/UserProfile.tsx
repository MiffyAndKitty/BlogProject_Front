// SearchBar.jsx
import React, { useState,useEffect,useRef } from 'react';
import { Link ,useNavigate } from 'react-router-dom';
import './UserProfile.css';

interface UserProfileProp  {
    profileType: 'signup' |  'logout' | 'profileSetting' | 'otherblog'|'myBlog';
    profileImage: string;
}
const UserProfile = ({ profileType ,profileImage}) => {
  const [nickname, setNickname] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const nickname = sessionStorage.getItem('nickname');
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
      <img src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
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
       <img src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate("/signup")}>회원가입</button>
                       <button className="dropdown-item-profile" onClick={() =>navigate("/login")}>로그인</button>
 
                     </div>
       )}
       </div>
      
    )}

    {profileType==='profileSetting' &&(
       <div ref={dropdownRef}>
       <img src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/${nickname}`)}>내 블로그 가기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate("/")}>로그아웃</button>
 
                     </div>
       )}
       </div>
      
    )}

    {profileType==='otherblog' &&(
       <div ref={dropdownRef}>
       <img src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/${nickname}`)}>내 블로그 가기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/myProfileSetting/${nickname}`)}>내 프로필 설정</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate("/")}>로그아웃</button>
 
                     </div>
       )}
       </div>
      
    )}

  {profileType==='myBlog' &&(
       <div ref={dropdownRef}>
       <img src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/writenewpost/${nickname}`)}>글 작성하기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/getpost/${nickname}`)}>글 관리</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/myProfileSetting/${nickname}`)}>내 프로필 설정</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate("/")}>로그아웃</button>
 
                     </div>
       )}
       </div>
      
    )}
    </>
  );
};

export default UserProfile;
