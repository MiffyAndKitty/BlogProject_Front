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
import { getCategories, getMyProfile } from '../services/getService';

/**
 * 블로그 메인 페이지
 * @returns 
 */
const MyBlogMainPage: React.FC = () => {
  const navigate = useNavigate();
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

  const fetchMyProfile = async () => {
    setProfileLoading(true); // 프로필 로딩 시작
    try {
      const sessionStorageEmail = sessionStorage.getItem('other_email');
      const fetchedProfile = await getMyProfile(sessionStorageEmail);
      setOtherImage(fetchedProfile.data.user_image);
      setOtherMessage(fetchedProfile.data.user_message);
      setAreYouFollowing(fetchedProfile.data.areYouFollowing);
    } catch (err) {
      console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setProfileLoading(false); // 프로필 로딩 끝
    }
  };

  useEffect(() => {
    const localStorageToken = sessionStorage.getItem('accessToken');
    if (localStorageToken === null) {
      setToken('');
    } else {
      setToken(localStorageToken);
    }

    const fetchCategories = async () => {
      try {
        fetchMyProfile();
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

  return (
    <div className="App">
      {loading ? (
        <div>로딩 중...</div> // 전체 페이지 로딩 상태 시 표시될 내용
      ) : (
        <>
          {(localNickName === nickname) && <Header pageType="logout" />}
          {(localNickName !== nickname) && <Header pageType="otherblog" />}
          <main className="main-content">
            {(!token && <Profile pageType="signup_for_blog" nicknameParam={nickname} userImg={otherImage} userMessage={otherMessage} areYouFollowing={areYouFollowing}/>)}
            {(token && localNickName === nickname && <Profile pageType="myBlog" nicknameParam={localNickName} />)}
            {(token && localNickName !== nickname && !profileLoading && (
              <Profile pageType="otherBlog" nicknameParam={nickname} userImg={otherImage} userMessage={otherMessage} areYouFollowing={areYouFollowing} />
            ))}
            {profileLoading && <div>프로필 로딩 중...</div>} {/* 프로필 로딩 상태 시 표시될 내용 */}


            <div className='categories'>
              <div className='mouse_hover' onClick={fetchAllPost}>전체보기 {'  ('+ totalCategories+')'}</div> 
              <div className='mouse_hover' onClick={fetchNullPost} style={{fontSize:'15px'}}>미분류{'  ('+ noCategories+')'}</div>
              <CategoryListForMain categories={categories} onCategoryClick={onCategoryClick}></CategoryListForMain>
            </div>
            

            {postID ? (
              <PostDetail />
            ) : (
              <MainPosts nicknameParam={nickname} categoryID={categoryID} onPostClick={onPostClick} />
            )}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default MyBlogMainPage;
