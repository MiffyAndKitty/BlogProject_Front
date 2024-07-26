import React, { useEffect, useState } from 'react';
import { useNavigate , useParams} from 'react-router-dom';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from '../main/Profile';
import MainPosts from '../myblog/MainPosts'
import './MyBlogMainPage.css';
import CategoryList from './CategoryList';
import { categories as Categories } from '../types/index';
import { getCategories  } from '../services/getService';
import CategoryListForMain from './CategoryListForMain';
import PostDetail from './PostDetail';

/**
 * 로그인 후의 메인페이지
 * @returns 
 */
const MyBlogMainPage: React.FC = () => {
  const navigate = useNavigate();
  let { nickname, postID } = useParams<{ nickname: string; postID?: string }>();
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryID, setCategoryID] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPostID, setCurrentPostID] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [localNickName, setLocalNickName] = useState<string>('');

  const onPostClick = (postID: string) => {
    setCurrentPostID(postID);
  };

  const onCategoryClick = (categoryId: string) =>{
    console.log('Clicked category ID:', categoryId);
    setCategoryID(categoryId);
    navigate(`/${nickname}`);

  };

  const fetchAllPost =()=>{
    setCategoryID('');
    navigate(`/${nickname}`);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setToken(token)
    // if (!token) {
    //   navigate('/');
    // }

    const fetchCategories = async () => {
      console.log(`
        
        
        
        nicknameParam
        
        
        `,nickname)
      try {
        const nickname = localStorage.getItem("nickname");
        if (!nickname) {
          throw new Error("Nickname not found in localStorage");
        }
        setLocalNickName(nickname);
        
        const fetchedCategories: Categories[] = await getCategories(nickname);
        setCategories(fetchedCategories);
        console.log(fetchedCategories);
      } catch (err) {
        console.error(err);
        setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [navigate]);

  useEffect(()=>{
    console.log(`
        
        
        
      localNickName
      
      
      `,localNickName)
  },[localNickName])
  return (
    <div className="App">
      <Header pageType="logout"/>
      <main className="main-content">
        
        {(!token && <Profile pageType="signup" />)}
        {((token && (localNickName === nickname)) &&<Profile pageType="myBlog" nicknameParam={localNickName}/>)}
        {((token && (localNickName !== nickname)) &&<Profile pageType="otherBlog" nicknameParam={nickname}/>)}

        <div onClick={fetchAllPost}>전체보기</div>
        <CategoryListForMain categories={categories} onCategoryClick={onCategoryClick}></CategoryListForMain>
        {  postID? (
        <PostDetail/>
      ) : (
        <MainPosts nicknameParam = {nickname} categoryID={categoryID} onPostClick={onPostClick} />
      )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBlogMainPage;
