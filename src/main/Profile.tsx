import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import mainCharacterImg from '../img/main_character.png';
import { getLogoutAuth ,getMyProfile} from '../services/getService';  // 추가된 부분
import { followUser } from '../services/postService';
import  nonFriend from '../img/nonFriend.png'
import  friend from '../img/friend.png'
import './Profile.css';
import   Follow from '../myblog/Follow';
import   Follower from '../myblog/Follower';
import Cursor from 'quill/blots/cursor';
import { deleteFollow } from '../services/deleteService';

const firebaseConfig = {
  apiKey: "AIzaSyCfoepTZGKKL7SubUSCy81pHHag-vDSWmY",
  authDomain: "mk-blog-e88c8.firebaseapp.com",
  projectId: "mk-blog-e88c8",
  storageBucket: "mk-blog-e88c8.appspot.com",
  messagingSenderId: "329301984688",
  appId: "1:329301984688:web:f7e2819bdd730419a64275",
  measurementId: "G-KGMPV32SSK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth 참조 가져오기
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

interface ProfileProps {
  pageType: 'login' | 'signup' | 'myBlog' | 'otherBlog' | 'signup_for_blog' | 'profileSetting' |'postManage';
  userImg?:string,
  userMessage?: string,
  areYouFollowing?:boolean,
  nicknameParam?:string | null,
  

}

const Profile: React.FC<ProfileProps> = ({ pageType,nicknameParam,userImg, userMessage, areYouFollowing, }) => {

  const navigate = useNavigate();
  const [user, setUser] = useState<string>("");
  const [error, setError] = useState(null);
  const [nickname, setNickname] = useState<string>();
  const [image, setImage] = useState<string | null>(null);
  const [otherImage, setOtherImage] = useState<string | null>(null);
  const [otherMessage, setOtherMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [followImg, setFollowImg] = useState<string>(nonFriend);
  const [isFollow, setIsFollow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenFollower, setIsModalOpenFollower] = useState(false);
  const goToSignUp = () => {
    navigate(`/signup`);
  };

  const goToLogin = () => {
    navigate(`/login`);
  };

  const goToLogout = async () => {
    try {
      await getLogoutAuth();  // 로그아웃 API 호출
      sessionStorage.removeItem('accessToken');  
      sessionStorage.removeItem('nickname');  
      sessionStorage.removeItem('image');  
      sessionStorage.removeItem('email'); 
      sessionStorage.removeItem('other_email');  
      sessionStorage.removeItem('message');  
      sessionStorage.removeItem('areYouFollowing');
      sessionStorage.removeItem('areYouFollowed');
      navigate(`/`);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const goToFollow = () =>{
    if(!isFollow) followUsers();
    else deleteFollowers();
  };

  const followUsers = async()=>{
    try{
      const email = sessionStorage.getItem('other_email');
      const result = await followUser({email:email});
      if(result) {
        alert('팔로우 추가에 성공했습니다!');
        setFollowImg(friend);
        setIsFollow(true);
      };
    }catch(err){
      alert('팔로우 추가에 실패했습니다! 다시 시도해주세요.');
    }
    
  };
  const deleteFollowers = async () => {
        
    try{
      const email = sessionStorage.getItem('other_email');
        if (email) {
            const fetchedFollowers = await deleteFollow(email);
            if(fetchedFollowers){
                alert('팔로우를 취소했습니다!');
                setFollowImg(nonFriend);
                setIsFollow(false);
            } 
            else alert('팔로우 취소에 실패했습니다! 다시 시도해주세요.');
        }
    }catch{
        
    }
   
  };
  const goToFindID = () => {
    navigate(`/findID`);
  };

  /**
   * 새 글 작성하기로 이동하기 위한 메서드
   */
  const goToWritePost = () => {
    navigate(`/writenewpost/${nickname}`);
  };

  const goToFollower = ()=>{
    navigate(`/follower/${nickname}`);
  };
  // const goToFollowManage = ()=>{
  //   navigate(`/follow/${nickname}`);
  // };
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const openModalFollower = () => {
    setIsModalOpenFollower(true);
  };
  const closeModalFollower = () => {
    setIsModalOpenFollower(false);
  };
  /**
   * 내 블로그로 가기로 이동하기 위한 메서드
   */
  const goToMyBlog = () => {
    navigate(`/${nickname}`);
  };

  const goToManagePosts = ()=>{
    navigate(`/getpost/${nickname}`);
  };
  const goToProfileSetting = ()=>{
    navigate(`/myProfileSetting/${user}`);
  };
//   const fetchMyProfile = async () => {
//     try {
      
//         const sessionStorageEmail = sessionStorage.getItem('other_email');
//         // if (sessionStorageEmail === null) {
//         //     alert(`잘못된 접근입니다!`);
//         //     navigate('/');
//         // }
//         const fetchedProfile = await getMyProfile(sessionStorageEmail);
//         setOtherImage(fetchedProfile.data.user_image);
//         setOtherMessage(fetchedProfile.data.user_message);

//         sessionStorage.setItem('areYouFollowing', fetchedProfile.data.areYouFollowing);
//         sessionStorage.setItem('areYouFollowed', fetchedProfile.data.areYouFollowed);
        
//     } catch (err) {
//         console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
//     }
// };
  useEffect(()=>{
    try {

      const storedNickname = sessionStorage.getItem('nickname');
      setImage(sessionStorage.getItem('image'));
      
      const storedMessage = sessionStorage.getItem('message');
      if (storedMessage && storedMessage !== 'null' && storedMessage !== '') {
        setMessage(storedMessage);
        console.log(`typeof message`, typeof storedMessage, storedMessage);
      } else {
        setMessage('상태메시지가 없습니다.');
      }

      if (storedNickname) {
        setNickname(storedNickname);
      }
      
    } catch (err) {
      console.log(err);
    }
    setUser(sessionStorage.getItem("nickname"));
    //fetchMyProfile();

    /**
     * 다른 사람 블로그일때
     */
    if(areYouFollowing===true) {
      setFollowImg(friend);
      setIsFollow(true);
    }

    if(userImg){
      setOtherImage(userImg);
    }

    if(userMessage){
      setOtherMessage(userMessage);
    }

     // ESC 키를 눌렀을 때 모달 닫기
     const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
        closeModalFollower();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
    
  },[]);

  return (
    <section className={
      `profile-section ${pageType === 'myBlog' ? 'myBlog' 
      : (pageType==='otherBlog'?'otherBlog'
      :(pageType==='signup_for_blog'?'signup_for_blog'
      :(pageType==='profileSetting'?'profileSetting'
      :(pageType==='postManage'?'postManage':''))))}`}>
      
      {pageType === 'signup' && (
        <>
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile_dash" />
          <button className="login-button" onClick={goToLogin} style={{cursor:'pointer'}}>로그인</button>
          <div className="logins_profile">
            <button onClick={goToFindID} style={{cursor:'pointer'}}>아이디 찾기</button>
            <span>|</span>
            <button style={{cursor:'pointer'}}>비밀번호 찾기</button>
            <span>|</span>
            <button onClick={goToSignUp} style={{cursor:'pointer'}}>회원가입</button>
          </div>
        </>
      )}
       {pageType === 'signup_for_blog' && (
        <>
        <div className="profile-container">
        <img src={otherImage|| mainCharacterImg} alt="Main Character" className="mainCharacter_profile_login" />
        
        <div className="profile-details">
        <span className="username"> {nicknameParam}님의 블로그</span>
              <hr />
              <span className="status-message">{otherMessage}</span>
            </div>
        </div>

        <div className="logins_profile" style={{marginTop:'100px'}}>
        <button onClick={openModal}  style={{cursor:'pointer'}}>팔로우</button>
        {isModalOpen && <Follow onClose={closeModal} />}
          <span>|</span>
          <button onClick={openModalFollower}  style={{cursor:'pointer'}} >팔로워</button>
          {isModalOpenFollower && <Follower onClose={closeModalFollower} />}
        </div>
      </>
      )}
      {pageType === 'login' && (
        <>
          <div className="profile-container">
            <img 
              src={image || mainCharacterImg} 
              alt="Main Character" 
              className="mainCharacter_profile_login" 
              onError={(e) => { e.currentTarget.src = mainCharacterImg; }}
            />
            <div className="profile-details">
              <span className="username" onClick={goToProfileSetting} style={{cursor:'pointer'}}>{user}</span>
              <hr />
              <span className="status-message">{message}</span>
            </div>
          </div>
          
          <div className="login-buttons-container">
            <button className="login-button_profile" onClick={goToMyBlog}>내 블로그 가기</button>
            <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          </div>
          <div className="logins_profile">
            <button onClick={openModal}  style={{cursor:'pointer'}}>팔로우</button>
            {isModalOpen && <Follow onClose={closeModal} />}
            <span>|</span>
            <button onClick={openModalFollower}  style={{cursor:'pointer'}} >팔로워</button>
            {isModalOpenFollower && <Follower onClose={closeModalFollower} />}
            <span>|</span>
            <button onClick={()=>{navigate(`/dashboard/all-new-notification`)}} style={{cursor:'pointer'}}>새소식</button>
            <span>|</span>
            <button onClick={goToLogout} style={{cursor:'pointer'}}>로그아웃 </button>
          </div>
        </>
      )}
      {pageType === 'myBlog' && (
        <>
         <div className="profile-container">
          <img 
            src={image || mainCharacterImg} 
            alt="Main Character" 
            className="mainCharacter_profile_login" 
            onError={(e) => { e.currentTarget.src = mainCharacterImg; }}
          />

            <div className="profile-details">
              <span className="username" onClick={goToProfileSetting} style={{cursor:'pointer'}}>{user}</span>
              <hr />
              <span className="status-message">{message}</span>
            </div>
          </div>
        
        <div className="login-buttons-container">
          <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          <button className="login-button_profile" onClick={goToManagePosts}>글 관리</button>
        </div>
        <div className="logins_profile">
        <button onClick={openModal}  style={{cursor:'pointer'}}>팔로우</button>
        {isModalOpen && <Follow onClose={closeModal} />}
          <span>|</span>
          <button onClick={openModalFollower}  style={{cursor:'pointer'}} >팔로워</button>
          {isModalOpenFollower && <Follower onClose={closeModalFollower} />}
          <span>|</span>
          <button  onClick={()=>{navigate(`/dashboard/all-new-notification`)}} style={{cursor:'pointer'}}>새소식</button>
          <span>|</span>
          <button onClick={goToLogout}>로그아웃 </button>
        </div>
      </>
      )}
      {pageType === 'postManage' && (
        <>
         <div className="profile-container">
          <img 
            src={image || mainCharacterImg} 
            alt="Main Character" 
            className="mainCharacter_profile_login" 
            onError={(e) => { e.currentTarget.src = mainCharacterImg; }}
          />

            <div className="profile-details">
              <span className="username" onClick={goToProfileSetting} style={{cursor:'pointer'}}>{user}</span>
              <hr />
              <span className="status-message">{message}</span>
            </div>
          </div>
        
        <div className="login-buttons-container">
          <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          <button className="login-button_profile" onClick={goToMyBlog}>내 블로그 가기</button>
        </div>
        <div className="logins_profile">
        <button onClick={openModal}  style={{cursor:'pointer'}}>팔로우</button>
        {isModalOpen && <Follow onClose={closeModal} />}
          <span>|</span>
          <button onClick={openModalFollower}  style={{cursor:'pointer'}} >팔로워</button>
          {isModalOpenFollower && <Follower onClose={closeModalFollower} />}
          <span>|</span>
          <button  onClick={()=>{navigate(`/dashboard/all-new-notification`)}} style={{cursor:'pointer'}}>새소식</button>
          <span>|</span>
          <button onClick={goToLogout}>로그아웃 </button>
        </div>
      </>
      )}
    {pageType === 'profileSetting' && (
        <>
         <div className="profile-container">
          <img 
            src={image || mainCharacterImg} 
            alt="Main Character" 
            className="mainCharacter_profile_login" 
            onError={(e) => { e.currentTarget.src = mainCharacterImg; }}
          />

            <div className="profile-details">
              <span className="username" onClick={goToProfileSetting} style={{cursor:'pointer'}}>{user}</span>
              <hr />
              <span className="status-message">{message}</span>
            </div>
          </div>
        
        <div className="login-buttons-container">
          <button className="login-button_profile" onClick={goToWritePost}>글 작성하기</button>
          <button className="login-button_profile" onClick={goToMyBlog}>내 블로그 가기</button>
        </div>
        <div className="logins_profile">
        <button onClick={openModal}  style={{cursor:'pointer'}}>팔로우</button>
        {isModalOpen && <Follow onClose={closeModal} />}
          <span>|</span>
          <button onClick={openModalFollower}  style={{cursor:'pointer'}} >팔로워</button>
          {isModalOpenFollower && <Follower onClose={closeModalFollower} />}
          <span>|</span>
          <button  onClick={()=>{navigate(`/dashboard/all-new-notification`)}} style={{cursor:'pointer'}}>새소식</button>
          <span>|</span>
          <button onClick={goToLogout}>로그아웃 </button>
        </div>
      </>
      )}
      {pageType === 'otherBlog' && (
        <>
        <div className="profile-container">
        <img src={otherImage|| mainCharacterImg} alt="Main Character" className="mainCharacter_profile_login" />
        
        <div className="profile-details">
        <span className="username"> {nicknameParam}님의 블로그</span>
              <hr />
              <span className="status-message">{otherMessage}</span>
            </div>
        </div>

        <div className="login-buttons-container">
          <div style={{backgroundColor:'#FFE6FA', borderRadius:'30px', }}>
            <img src={followImg} style={{width:'60px', height:'auto', cursor:'pointer'}} onClick={goToFollow} title="친구 맺기" ></img>
            </div>
        </div>

        <div className="logins_profile">
        <button onClick={openModal}  style={{cursor:'pointer'}}>팔로우</button>
        {isModalOpen && <Follow onClose={closeModal} isOthers={true} />}
          <span>|</span>
          <button onClick={openModalFollower}  style={{cursor:'pointer'}} >팔로워</button>
          {isModalOpenFollower && <Follower onClose={closeModalFollower}  isOthers={true}/>}
        </div>
      </>
      )}
      {error && <div className="error">{error}</div>}
    </section>
  );
};

export default Profile;
