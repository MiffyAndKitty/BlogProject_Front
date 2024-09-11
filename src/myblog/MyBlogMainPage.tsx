import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from '../main/Profile';
import MainPosts from '../myblog/MainPosts';
import './MyBlogMainPage.css';
import CategoryListForMain from './CategoryListForMain';
import PostDetail from './PostDetail';
import { categories as Categories } from '../types/index';
import { getCategories, getMyProfile,getProfiles } from '../services/getService';
import SSEComponent from '../main/SSEComponent';
import spinner from '../img/Spinner.png';
/**
 * 블로그 메인 페이지
 * @returns 
 */
const MyBlogMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  let { nickname, postID } = useParams<{ nickname: string; postID?: string }>();
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryID, setCategoryID] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // 전체 페이지 로딩 상태
  const [profileLoading, setProfileLoading] = useState<boolean>(true); // 프로필 로딩 상태
  const [currentPostID, setCurrentPostID] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [localNickName, setLocalNickName] = useState<string>('');
  const [otherImage, setOtherImage] = useState<string | null>(null);
  const [otherMessage, setOtherMessage] = useState<string | null>(null);
  const [areYouFollowing, setAreYouFollowing] = useState<boolean>(false);
  const [totalCategories,setTotalCategories] = useState<number>();
  const [noCategories,setNoCategories] = useState<number>();
  const [otherEmail, setOtherEmail] = useState<string>('');
  const onPostClick = (postID: string) => {
    setCurrentPostID(postID);
  };

  const onCategoryClick = (categoryId: string) => {
    console.log('Clicked category ID:', categoryId);
    setCategoryID(categoryId);
    navigate(`/${nickname}`);
  };

  const fetchAllPost = () => {
    setCategoryID('');
    navigate(`/${nickname}`);
  };

  const fetchNullPost = () => {
    setCategoryID('default');
    navigate(`/${nickname}`);
  };

  const fetchProfile = async () => {
    setProfileLoading(true); // 프로필 로딩 시작
    try {
      const fetchedProfile = await getProfiles(nickname);
      setOtherEmail(fetchedProfile.data.user_email);
      setOtherImage(fetchedProfile.data.user_image);
      setOtherMessage(fetchedProfile.data.user_message);
      setAreYouFollowing(fetchedProfile.data.areYouFollowing);
    } catch (err) {
      console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
      navigate(`/dashboard/${localNickName}`);
    } finally {
      setProfileLoading(false); // 프로필 로딩 끝
    }
  };
  const fetchDetailProfile = async () => {
    setProfileLoading(true); // 프로필 로딩 시작
    try {
      const fetchedProfile = await getMyProfile(otherEmail);
      // setOtherImage(fetchedProfile.data.user_image);
      // setOtherMessage(fetchedProfile.data.user_message);
      setAreYouFollowing(fetchedProfile.data.areYouFollowing);
    } catch (err) {
      console.log('상세 개인정보를 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setProfileLoading(false); // 프로필 로딩 끝
    }
  };
  useEffect(()=>{
    if(otherEmail !== '') fetchDetailProfile();
  },[otherEmail])
  useEffect(() => {
    const localStorageToken = sessionStorage.getItem('accessToken');
    if (localStorageToken === null) {
      setToken('');
    } else {
      setToken(localStorageToken);
    }

    const fetchCategories = async () => {
      try {
        fetchProfile();
        
        const fetchedCategories:any = await getCategories(nickname);
        setCategories(fetchedCategories.hierarchicalCategory);
        setTotalCategories(fetchedCategories.totalPostCount);
        setNoCategories(fetchedCategories.uncategorizedCount);
        const localNickname = sessionStorage.getItem("nickname");
        if (localNickname) {
          setLocalNickName(localNickname);
        }
      } catch (err) {
        setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
        setLocalNickName('');
      } finally {
        setLoading(false); // 페이지 로딩 끝
      }
    };

    fetchCategories();
  
  }, [navigate, nickname]);
  const handleNotification = (isNotified: boolean) => {
    setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
  };
  return (
    <div className="App">

      {loading ? (
       <></>
      ) : (
        <>
          {(localNickName === nickname) && <Header pageType="myBlog" hasNotifications ={hasNotifications}/>}
          {(localNickName !== nickname) && <Header pageType="otherblog" hasNotifications ={hasNotifications}/>}

          <main>
            

           
            
            {/* Main Posts or Post Detail */}
            
              {postID ? ( //Post Detail
                <>
                <div className="blog-main-detail-container">
                  {/* Profile */}
                  {(!token && (
                    <Profile 
                      pageType="signup_for_blog" 
                      nicknameParam={nickname} 
                      userImg={otherImage} 
                      userMessage={otherMessage} 
                      areYouFollowing={areYouFollowing} 
                      otherEmail = {otherEmail}
                      isDetailPost = {true}
                    >
                    </Profile>
                  ))}

                  {(token && localNickName === nickname && (
                    <Profile 
                    pageType="myBlog" 
                    nicknameParam={localNickName}  
                    isDetailPost = {true}>
                    </Profile>
                  ))}

                  {(token && localNickName !== nickname && !profileLoading && (
                    <Profile pageType="otherBlog" 
                      nicknameParam={nickname}
                      userImg={otherImage}
                      userMessage={otherMessage} 
                      areYouFollowing={areYouFollowing}
                      otherEmail = {otherEmail}
                      isDetailPost = {true}
                      >
                    </Profile>
                  ))}

                  {profileLoading && <div>프로필 로딩 중...</div>}
                
                  {/* category */}
                  <section className='detailPost-category-section'>
                  <div className='categories'>
                    <div className='mouse_hover' onClick={fetchAllPost}>전체보기 {'  ('+ totalCategories+')'}</div> 
                    <div className='mouse_hover' onClick={fetchNullPost} style={{fontSize:'15px', marginTop:'10px', marginBottom:'10px'}}>미분류{'  ('+ noCategories+')'}</div>
                    <CategoryListForMain categories={categories} onCategoryClick={onCategoryClick}></CategoryListForMain>
                  </div>
                  </section>

                  <section className='main-blog-detail-posts-section'>
                  <PostDetail />
                  </section>
                  </div>
                </>
              ) : (//Main Post
                <>
                <div className="blog-main-container">
                  {/* Profile */}
                  {(!token && (
                    <Profile 
                      pageType="signup_for_blog" 
                      nicknameParam={nickname} 
                      userImg={otherImage} 
                      userMessage={otherMessage} 
                      areYouFollowing={areYouFollowing} 
                      otherEmail = {otherEmail}
                    >
                    </Profile>
                  ))}

                  {(token && localNickName === nickname && (
                    <Profile pageType="myBlog" nicknameParam={localNickName}>
                    </Profile>
                  ))}

                  {(token && localNickName !== nickname && !profileLoading && (
                    <Profile pageType="otherBlog" 
                      nicknameParam={nickname}
                      userImg={otherImage}
                      userMessage={otherMessage} 
                      areYouFollowing={areYouFollowing}
                      otherEmail = {otherEmail}>
                    </Profile>
                  ))}

                  {profileLoading && <div>프로필 로딩 중...</div>}
                
                  {/* category */}
                  <section className='category-section'>
                  <div className='categories'>
                    <div className='mouse_hover' onClick={fetchAllPost}>전체보기 {'  ('+ totalCategories+')'}</div> 
                    <div className='mouse_hover' onClick={fetchNullPost} style={{fontSize:'15px', marginTop:'10px', marginBottom:'10px'}}>미분류{'  ('+ noCategories+')'}</div>
                    <CategoryListForMain categories={categories} onCategoryClick={onCategoryClick}></CategoryListForMain>
                  </div>
                  </section>

                  <section className='main-blog-posts-section'>
                    <MainPosts nicknameParam={nickname} categoryID={categoryID} onPostClick={onPostClick} />
                  </section>
                  </div>
                </>
               
              )}
              <SSEComponent onNotification={handleNotification}></SSEComponent>
            
          
          </main>

         
        </>
      )}

  <Footer />
    </div>
  );
};

export default MyBlogMainPage;
