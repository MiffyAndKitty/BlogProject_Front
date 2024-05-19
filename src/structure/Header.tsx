import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import mainCharacterImg from '../img/main_character.png';

const Header = () => {
  return (
    <header className="header">
      <div className="header__logo">
      <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
      </div>
      <nav className="header__nav">
        <ul>
          <li><Link to="/">홈</Link></li>
          <li><Link to="/about">소개</Link></li>
          <li><Link to="/contact">연락처</Link></li>
        </ul>
      </nav>
      <div className="header__auth">
        <Link to="/login">로그인</Link>
      </div>
    </header>
  );
};

export default Header;
