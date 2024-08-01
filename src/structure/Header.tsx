import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Header.css';
import mainCharacterImg from '../img/main_character.png';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';
import profileImg from '../img/profileImg.png'

interface ProfileProps {
  pageType: 'login' | 'signup'|'logout' ;
}
const Header: React.FC<ProfileProps> = ({pageType}) => {
  const [nickname, setNickname] = useState<string>();
  useEffect(() => {
    try {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);
  return (
    <header className="header">
      
      {pageType === 'login' &&(
        <>
          <div className="header__logo">
            <Link to="/">
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>

          <div className="header__auth">
            <Link to="/login">
            <UserProfile profileType={'signup'} profileImage={profileImg}></UserProfile>
            </Link>
          </div>
        </>
      
      )}
      {pageType === 'logout' &&(
        <>
          <div className="header__logo">
            <Link to={`/dashboard/${nickname}`}>
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>

          <div className="header__auth">
            <Link to="/">로그아웃</Link>
          </div>
        </>
       
      )}

      {pageType === 'signup' &&(
        <>
          <div className="header__logo">
            <Link to="/">
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>

          <div className="header__auth">
            <Link to="/login">
            <UserProfile profileType={'signup'} profileImage={profileImg}></UserProfile>
            </Link>
          </div>
        </>
       
      )}
      
    </header>
  );
};

export default Header;
