import React, { useState,useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Header.css';
import mainCharacterImg from '../img/main_character.png';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';
import no_notification from '../img/no_notification.png';
import has_notification from '../img/has_notification.png';
import Notification from '../main/Notification';
interface ProfileProps {
  pageType: 'profileSetting'|'signup'|'logout' | 'otherblog';
}
const Header: React.FC<ProfileProps> = ({pageType}) => {
  const notificationButtonRef = useRef<HTMLDivElement>(null); // 알림 버튼 참조
  const [nickname, setNickname] = useState<string>();
  const [message, setMessage] = useState<string>('');
  const [image, setImage] = useState<string>(mainCharacterImg);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [openNotification, setOpenNotification]  = useState<boolean>(false);
  
  const closeModal = () => {
    setOpenNotification(false);
  };

  useEffect(() => {
    try {
      const localStorageToken = sessionStorage.getItem('accessToken');
      if (localStorageToken === null) {
        setToken('');
      } else {
        setToken(localStorageToken);
      }
      const storedNickname = sessionStorage.getItem('nickname');
      
      if (storedNickname) {
        setNickname(storedNickname);
        setMessage(sessionStorage.getItem('message'));
        setImage(sessionStorage.getItem('image')?sessionStorage.getItem('image') :  mainCharacterImg);
        
      }
    } catch (err) {
      console.log(err);

      // ESC 키를 눌렀을 때 모달 닫기
     const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
       
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
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
      
      {/* {!token &&(
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
      )} */}
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
      {token &&pageType === 'logout' &&(
        <>
          <div className="header__logo">
            <Link to={`/dashboard/${nickname}`}>
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>

        
          <div className="header__auth">
          <div 
          ref={notificationButtonRef}
          onClick={()=>setOpenNotification(true)}>

            {openNotification && notificationButtonRef.current && (
              <Notification onClose={closeModal} buttonRef={notificationButtonRef} />
            )}
            <img src={no_notification}  style={{width:'20px', height:'auto', marginRight:'20px'}}/>
          </div>
            {profileImage && <UserProfile profileType={'logout'} profileImage={profileImage}></UserProfile>}
          </div>
        </>
       
      )}

      {token &&pageType === 'profileSetting' &&(
        <>
          <div className="header__logo">
          <Link to={`/dashboard/${nickname}`}>
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>
          
          <div className="header__auth">
          <div 
          ref={notificationButtonRef}
          onClick={()=>setOpenNotification(true)}>

            {openNotification && notificationButtonRef.current && (
              <Notification onClose={closeModal} buttonRef={notificationButtonRef} />
            )}
            <img src={no_notification}  style={{width:'20px', height:'auto', marginRight:'20px'}}/>
          </div>
          {profileImage && <UserProfile profileType={'logout'} profileImage={profileImage}></UserProfile>}
          </div>
        </>
       
      )}

      {token &&pageType === 'otherblog' &&(
        <>
          <div className="header__logo">
          <Link to={`/dashboard/${nickname}`}>
              <img src={mainCharacterImg} alt="Main Character" className="header__logo-img" />
            </Link>
          </div>

          <div className="header__auth">
          <div 
          ref={notificationButtonRef}
          onClick={()=>setOpenNotification(true)}>

            {openNotification && notificationButtonRef.current && (
              <Notification onClose={closeModal} buttonRef={notificationButtonRef} />
            )}
            <img src={no_notification}  style={{width:'20px', height:'auto', marginRight:'20px'}}/>
          </div>
          {profileImage && <UserProfile profileType={'otherblog'} profileImage={profileImage}></UserProfile>}
          </div>
        </>
       
      )}
    </header>
  );
};

export default Header;
