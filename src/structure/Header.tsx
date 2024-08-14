import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Header.css';
import mainCharacterImg from '../img/main_character.png';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';


interface ProfileProps {
  pageType: 'profileSetting'|'signup'|'logout' ;
}
const Header: React.FC<ProfileProps> = ({pageType}) => {
  const [nickname, setNickname] = useState<string>();
  const [message, setMessage] = useState<string>('');
  const [image, setImage] = useState<string>(mainCharacterImg);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedNickname = sessionStorage.getItem('nickname');
      
      if (storedNickname) {
        setNickname(storedNickname);
        setMessage(sessionStorage.getItem('message'));
        setImage(sessionStorage.getItem('image')?sessionStorage.getItem('image') :  mainCharacterImg);
        
      }
    } catch (err) {
      console.log(err);
    }
  }, []);
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => setIsImageLoaded(true);
      img.onerror = () => setIsImageLoaded(false);
    } else {
      setIsImageLoaded(false);
    }
  }, [image]);
  
  const profileImage = isImageLoaded ? image : mainCharacterImg;
  return (
    <header className="header">
      

      {pageType === 'logout' &&(
        <>
          <div className="header__logo">
            <Link to={`/dashboard/${nickname}`}>
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>

          <div className="header__auth">
            {profileImage && <UserProfile profileType={'logout'} profileImage={profileImage}></UserProfile>}
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
            <UserProfile profileType={'signup'} profileImage={mainCharacterImg}></UserProfile>
          </div>
        </>
       
      )}
      {pageType === 'profileSetting' &&(
        <>
          <div className="header__logo">
          <Link to={`/dashboard/${nickname}`}>
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>

          <div className="header__auth">
          {profileImage && <UserProfile profileType={'logout'} profileImage={profileImage}></UserProfile>}
          </div>
        </>
       
      )}
    </header>
  );
};

export default Header;
