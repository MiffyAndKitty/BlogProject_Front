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
  const [token, setToken] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const nickname = sessionStorage.getItem('nickname');
      setNickname(nickname);

      const accessToken = sessionStorage.getItem('accessToken');
      setToken(accessToken);
    }catch (err) {
      console.log(err);
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
    <div  style={{cursor:'pointer'}}>

    {profileType==='signup' &&(
       <div ref={dropdownRef}>
       <img style={{marginRight:'5px'}} src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
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
       <img style={{marginRight:'5px'}} src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/writenewpost`)}>글 작성하기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/getpost`)}>글 관리</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/${nickname}`)}>내 블로그 가기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate("/")}>로그아웃</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/delete-user/${token}`)}>회원 탈퇴하기</button>
                     </div>
       )}
       </div>
      
    )}

    {profileType==='otherblog' &&(
       <div ref={dropdownRef}>
       <img style={{marginRight:'5px'}} src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/writenewpost`)}>글 작성하기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/getpost`)}>글 관리</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/${nickname}`)}>내 블로그 가기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/myProfileSetting`)}>내 프로필 설정</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate("/")}>로그아웃</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/delete-user/${token}`)}>회원 탈퇴하기</button>
 
                     </div>
       )}
       </div>
      
    )}

  {profileType==='myBlog' &&(
       <div ref={dropdownRef}>
       <img style={{marginRight:'5px'}} src={profileImage} alt="Profile" className="heart" onClick={() => setDropdownOpen(!dropdownOpen)}/>
       {dropdownOpen && (
                     <div className="dropdown-menu-profile" >
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/writenewpost`)}>글 작성하기</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/getpost`)}>글 관리</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/myProfileSetting`)}>내 프로필 설정</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate("/")}>로그아웃</button>
                      <button className="dropdown-item-profile" onClick={() =>navigate(`/delete-user/${token}`)}>회원 탈퇴하기</button>
 
                     </div>
       )}
       </div>
      
    )}
    </div>
  );
};

export default UserProfile;
