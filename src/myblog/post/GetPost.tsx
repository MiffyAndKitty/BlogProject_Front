import React, { useState, useEffect } from 'react';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './GetPost.css';
import * as TYPES from '../../types/index';
import { getPosts } from '../../services/getService';
import { useNavigate } from "react-router-dom";

const GetPost: React.FC = () => {
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
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
        console.log(`nickname`,nickname)
        const fetchedPosts = await getPosts(nickname);
        console.log(`fetchedPosts.data.isWriter `, fetchedPosts.data.isWriter)
        console.log(`fetchedPosts.data`,fetchedPosts.data)
        setIsWriter(fetchedPosts.data.isWriter);
        console.log(`isWriter`, isWriter)
        console.log(`fetchedPosts`,fetchedPosts.data.data)
        setPosts(fetchedPosts.data.data);
      } catch (err) {
        setError('게시물을 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Header pageType="logout" />
      <main>
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
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GetPost;
