import React, { useState, useEffect } from 'react';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './GetPost.css';
import * as TYPES from '../../types/index';
import mainCharacterImg from '../../img/main_character.png';
import { getPosts } from '../../services/getService';
import { useNavigate } from "react-router-dom";

const GetPost: React.FC = () => {
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
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
    const fetchPosts = async () => {
      try {
        const nickname=localStorage.getItem('nickname');
        setNickname(nickname);
        console.log(`nickname`,nickname);
        const fetchedPosts = await getPosts(nickname);
        setIsWriter(fetchedPosts.data.isWriter);
        console.log(`fetchedPosts`,fetchedPosts.data.data);
        setPosts(fetchedPosts.data.data);
        setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length-1].board_id);
      } catch (err) {
        setError('게시물을 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchPosts = async (cursor: string) => {
      try {
        const nickname = localStorage.getItem('nickname');
        setNickname(nickname);
        const fetchedPosts = await getPosts(nickname, cursor,isBefore); // 페이지 정보를 전달
        setIsWriter(fetchedPosts.data.isWriter);
        setPosts(fetchedPosts.data.data);
        setTotalPages(fetchedPosts.data.total.totalPageCount); // 전체 페이지 수 설정
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
  
    fetchPosts(cursor); // 현재 페이지에 해당하는 게시물 불러오기
  }, [currentPage]);

  return (
    <>
    <Header pageType="logout" />
    <main>
      <div className="main-container">
        <div className="profile_post_manage">
          <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_profile" />
          <button className="login-button_profile" onClick={goToMyBlog}>내 블로그 가기</button>
        </div>
        <div className="container">
          <h1 className="title">블로그 게시글</h1>
          {!loading && !error && posts.length > 0 && (
            <div className="post-list">
              {posts.map(post => (
                <div className="post-card" key={post.board_id}>
                  <div className="post-header">
                    <h2 className="post-title">{post.board_title}</h2>
                    <div className="post-meta">
                      <span className="post-date">{formatDate(post.created_at)}</span>
                      <span className="post-stats">
                        <span className="post-likes">🥕 : {post.board_like}</span>
                        <span className="post-comments">댓글: {post.comment_count}</span>
                      </span>
                    </div>
                  </div>
                  <div className="post-content">{post.board_content}</div>
                  <div className="post-actions">
                    <button className="edit-btn" onClick={() => fixPost(post.board_id)}>수정</button>
                    <button className="delete-btn">삭제</button>
                  </div>
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
    <Footer />
  </>
  
  );
};

export default GetPost;
