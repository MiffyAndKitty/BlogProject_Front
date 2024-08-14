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
 * 블로그 메인 페이지
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
  const fetchNullPost =()=>{
    setCategoryID(null);
    navigate(`/${nickname}`);
  };

  useEffect(() => {
    const localStorageToken = sessionStorage.getItem('accessToken');
    if(localStorageToken ===null){
      setToken('');
    }else{
      setToken(localStorageToken);
    }

    const fetchCategories = async () => {
      console.log(`
        
        
        
        nicknameParam
        
        
        `,nickname)
      try {
        const fetchedCategories: Categories[] = await getCategories(nickname);
        setCategories(fetchedCategories);
        console.log(fetchedCategories);
        const localNickname = sessionStorage.getItem("nickname");
        if (localNickname) {
          setLocalNickName(localNickname);
        }
        
        
      } catch (err) {
        // console.error(err);
        setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
        setLocalNickName('');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [navigate,nickname]);

  useEffect(()=>{
    console.log(`
        
        
        
      localNickName
      
      
      `,localNickName)
  },[localNickName])
  return (
    <div className="App">
      
      {(localNickName === nickname) && <Header pageType="logout"/>}
      {(localNickName !== nickname) && <Header pageType="otherblog"/>}
      <main className="main-content">
        
        {(!token && <Profile pageType="signup_for_blog" />)}
        {((token && (localNickName === nickname)) &&<Profile pageType="myBlog" nicknameParam={localNickName}/>)}
        {((token && (localNickName !== nickname)) &&<Profile pageType="otherBlog" nicknameParam={nickname}/>)}

        <div className='mouse_hover' onClick={fetchAllPost}>전체보기</div>
        <div className='mouse_hover' onClick={fetchNullPost}>미분류</div>
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
