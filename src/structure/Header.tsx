import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Header.css';
import mainCharacterImg from '../img/main_character.png';
import SearchBar from './SearchBar';
interface ProfileProps {
  pageType: 'login' | 'signup' ;
}
const Header: React.FC<ProfileProps> = ({pageType}) => {
  return (
    <header className="header">
      <div className="header__logo">
        <Link to="/">
          <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
        </Link>
      </div>
      <nav className="header__nav">
        <ul>
          <SearchBar />

        </ul>
      </nav>
      {pageType === 'signup' &&(
        <div className="header__auth">
        <Link to="/login">로그인</Link>
      </div>
      )}
      {pageType === 'login' &&(
        <div className="header__auth">
        <Link to="/">로그아웃</Link>
      </div>
      )}
      
    </header>
  );
};

export default Header;
