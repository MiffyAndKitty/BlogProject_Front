import React, { useState, useEffect } from 'react';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './GetPost.css';
import * as TYPES from '../../types/index';
import mainCharacterImg from '../../img/main_character.png';
import { getPosts,getCategories } from '../../services/getService';
import { useNavigate } from 'react-router-dom';
import CategorySettings from '../CategorySetting';

const GetPost: React.FC = () => {
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [categories, setCategories] = useState<TYPES.categories[]>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const[ managementType, setManagementType] = useState<'post'| 'category'>('post');

  const navigate = useNavigate();

  const fixPost = (postID: string) => {
    if (isWriter === true) navigate('/fixpost', { state: { postID } });
    else alert('수정권한이 없습니다!');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours.toString().padStart(2, '0');

    return `${year}.${month}.${day} ${ampm} ${strHours}:${minutes}:${seconds}`;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCursor(posts[0].board_id);
      setIsBefore(true);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCursor(posts[posts.length - 1].board_id);
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
    }
  };
   // 주어진 카테고리 ID를 찾기 위한 재귀 함수
   const findCategoryById = (categories: TYPES.categories[], categoryId: string) => {
    console.log(`
      
      
      
      findCategoryById 
      categories
      
      
      
      `,categories)
    for (const category of categories) {
      if (category.category_id === categoryId) {
        return category.category_name ;
      }
      if (category.subcategories) {
        const foundCategory = findCategoryById(category.subcategories, categoryId);
        if (foundCategory) {
          return foundCategory;
        }
      }
    }
    return '';
  };

  /**
   * 새 글 작성하기로 이동하기 위한 메서드
   */
   const goToWritePost = () => {
    navigate(`/writenewpost`);
  };
  const goToMyBlog = () => {
    navigate(`/blogmain`);
  };

  const goToPostManagement = () => {
    setManagementType ( 'post');
  };

  const goToCategoryManagement = () => {
    setManagementType ( 'category');
  };
  /**
   * 게시글 불러오기
   */
  const fetchPosts = async (cursor?: string, categoryID?: string) => {
    try {
      const nickname=localStorage.getItem('nickname');
      setNickname(nickname);
      const fetchedPosts = await getPosts(nickname,cursor,isBefore,categoryID);
      setIsWriter(fetchedPosts.data.isWriter);
      console.log(`fetchedPosts`,fetchedPosts.data.data);
      setPosts(fetchedPosts.data.data);
      setTotalPages(fetchedPosts.data.total.totalPageCount); // 전체 페이지 수 설정
      const fetchedCategories: TYPES.categories[] = await getCategories(nickname);
      setCategories(fetchedCategories);
      //setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length-1].board_id);
      if (currentPage === 1) {
        setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length - 1].board_id);
      } else if (currentPage === totalPages) {
        setCursor(fetchedPosts.data.data[0].board_id);
      }
    } catch (err) {
      setError('게시물을 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    // const fetchPosts = async () => {
    //   try {
    //     const nickname = localStorage.getItem('nickname');
    //     setNickname(nickname);
    //     console.log(`nickname`, nickname);
    //     const fetchedPosts = await getPosts(nickname);
    //     setIsWriter(fetchedPosts.data.isWriter);
    //     console.log(`fetchedPosts`, fetchedPosts.data.data);
    //     const fetchedCategories: TYPES.categories[] = await getCategories(nickname);
    //     setPosts(fetchedPosts.data.data);
    //     setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length - 1].board_id);
    //     setCategories(fetchedCategories);
        

    //   } catch (err) {
    //     setError('게시물을 불러오는 중에 오류가 발생했습니다.');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchPosts();
  }, []);

  useEffect(() => {
    // const fetchPosts = async (cursor: string) => {
    //   try {
    //     const nickname = localStorage.getItem('nickname');
    //     setNickname(nickname);
    //     const fetchedPosts = await getPosts(nickname, cursor, isBefore);
    //     setIsWriter(fetchedPosts.data.isWriter);
    //     setPosts(fetchedPosts.data.data);
    //     setTotalPages(fetchedPosts.data.total.totalPageCount);
    //     if (currentPage === 1) {
    //       setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length - 1].board_id);
    //     } else if (currentPage === totalPages) {
    //       setCursor(fetchedPosts.data.data[0].board_id);
    //     }
    //   } catch (err) {
    //     setError('게시물을 불러오는 중에 오류가 발생했습니다.');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchPosts(cursor);
  }, [currentPage]);

  return (
    <>
      <Header pageType="logout" />
      <main>
        <div className="main-container">
          <div className="profile_post_manage">
            <div>
              <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile" />
              <button className="login-button_profile" onClick={goToMyBlog}>
                내 블로그 가기
              </button>
            </div>
            <div className="manage-buttons">
            <button className="manage-button" onClick={goToWritePost}>
                글 작성
              </button>
              <span>  |</span>
              <button className="manage-button" onClick={goToPostManagement}>
                글 관리
              </button>
              <span>  |</span>
              <button className="manage-button" onClick={goToCategoryManagement}>
                카테고리 관리
              </button>
            </div>
          </div>
          <div className="container">
            {
              managementType === 'post' &&(
                <>
                <h1 className="title_manage">글 관리</h1>
                {!loading && !error && posts.length > 0 && (
                  <div className="post-list">
                    {posts.map((post) => (
                      <div className="post-card" key={post.board_id}>
                        <div className="post-header">
                          <h2 className="post-title">{post.board_title}</h2>
                          
                          <div className="post-meta">
                          <span className="post-category">{ findCategoryById(categories,post.category_id)}</span>
                            <span className="post-date">{formatDate(post.created_at)}</span>
                            <span className="post-stats">
                              <span className="post-likes">🥕 : {post.board_like}</span>
                              <span className="post-comments">댓글: {post.board_comment}</span>
                            </span>
                          </div>
                        </div>
                        <div className="post-content">{post.board_content}</div>
                        <div className="post-actions">
                          <button className="edit-btn" onClick={() => fixPost(post.board_id)}>
                            수정
                          </button>
                          <button className="delete-btn">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pagination">
                  <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    이전
                  </button>
                  <span className="pagination-info">
                    {currentPage} / {totalPages}
                  </span>
                  <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    다음
                  </button>
                </div>
                </>
              )
            }

            {
              managementType === 'category' &&(
                <>
                <h1 className="title_manage">카테고리 관리</h1>
                <CategorySettings></CategorySettings>
                </>
              )
            }
          
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GetPost;
