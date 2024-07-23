import React, { useState, useEffect } from 'react';
import './MainPosts.css';
import * as TYPES from '../types/index';
import mainCharacterImg from '../img/main_character.png';
import { getPosts,getCategories } from '../services/getService';
import DOMPurify from 'dompurify'; // XSS 방지를 위해 DOMPurify 사용
import { useNavigate } from "react-router-dom";
interface MainPostsProps {
  categoryID : string
}
const MainPosts: React.FC<MainPostsProps>  = ({categoryID} ) => {
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categories, setCategories] = useState<TYPES.categories[]>();
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [isBefore, setIsBefore] = useState<boolean>(false);

  const navigate = useNavigate();

  const fixPost = (postID: string) => {
    if(isWriter === true) navigate("/fixpost", { state: { postID } });
    else alert("수정권한이 없습니다!");
    
  };

  /**
   * 날짜 문자열을 원하는 형식으로 변환하는 함수
   * @param dateString - ISO 형식의 날짜 문자열
   * @returns 변환된 날짜 문자열
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
  
    const year = date.getFullYear().toString().slice(2); // 마지막 두 자리를 사용
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월을 2자리로 변환
    const day = date.getDate().toString().padStart(2, '0'); // 일을 2자리로 변환
  
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 분을 2자리로 변환
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 초를 2자리로 변환
  
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0을 12로 변환
    const strHours = hours.toString().padStart(2, '0');
  
    return `${year}.${month}.${day} ${ampm} ${strHours}:${minutes}:${seconds}`;
  };
    // 주어진 카테고리 ID를 찾기 위한 재귀 함수
   const findCategoryById = (categories: TYPES.categories[], categoryId: string) => {

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
  // 불필요한 태그 제거 함수
  const removeUnwantedTags = (html: string): string => {
    const cleanHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    const div = document.createElement('div');
    div.innerHTML = cleanHtml;
    return div.textContent || div.innerText || '';
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
      console.log(`
        ====fetchedPosts====
        `,fetchedPosts.data.data);
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content: removeUnwantedTags(post.board_content), // 목록에서만 제거된 내용을 표시
      }));
      setPosts(postsWithCleanContent);
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

    /**
   * 내 블로그로 가기로 이동하기 위한 메서드
   */
    const goToMyBlog = () => {
      navigate(`/blogmain`);
    };
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
   
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect (()=>{
    fetchPosts(undefined,  categoryID);
  },[categoryID]);

  useEffect(() => {
    fetchPosts(cursor); // 현재 페이지에 해당하는 게시물 불러오기
  }, [currentPage]);

  return (
    <>
    <section className="MainPosts-section">
    <main>
      <div className="main-container">
        <div className="container">
          {!loading && !error && posts.length > 0 && (
            <div className="post-list">
              {posts.map(post => (
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

                </div>
              ))}
            </div>
          )}
          <div className="pagination">
            <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>이전</button>
            <span className="pagination-info">{currentPage} / {totalPages}</span>
            <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>다음</button>
          </div>
        </div>
      </div>
    </main>
    </section>
  </>
  
  );
};

export default MainPosts;
