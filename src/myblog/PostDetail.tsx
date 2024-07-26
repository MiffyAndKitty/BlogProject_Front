// src/myblog/ManagePost/PostDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import * as TYPES from '../types/index';
import { getPost } from '../services/getService';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from '../main/Profile';
import DOMPurify from 'dompurify';
import './PostDetail.css';




const PostDetail: React.FC = () => {
  const { postID, nickname } = useParams();
  const [post, setPost] = useState<TYPES.getPostDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    let [datePart, timePart] = dateString.split('T');
    let [year, month, day] = datePart.split('-');
    let [hours, minutes, seconds] = timePart.replace('Z', '').split(':');
  
    // 초에서 소수점 제거
    seconds = seconds.split('.')[0];
  
    // 시간을 숫자로 변환
    let hourInt = parseInt(hours);
    let ampm = hourInt >= 12 ? '오후' : '오전';
  
    // 12시간제로 변환
    hourInt = hourInt % 12;
    hourInt = hourInt ? hourInt : 12; // 0이면 12로 설정
  
    const strHours = hourInt.toString().padStart(2, '0');
  
    return `${year}.${month}.${day} ${ampm} ${strHours}:${minutes}:${seconds}`;
  };
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const fetchedPost = await getPost(postID);
        setPost(fetchedPost.data);
      } catch (err) {
        setError('게시물을 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postID]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!post) {
    return <div>게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <>

      <section className="MainPosts-section">
        <main>
          <div className="main-container">
            <div className="container">
            <div className="postdetail-detail">
            <h1>{post.board_title}</h1>
              
              <div className="postdetail-meta">
              <span className="postdetail-author">작성자: {post.user_nickname}</span>
                <span className="postdetail-date">작성날짜: {formatDate(post.created_at)}</span>
                <span className="postdetail-date">수정날짜: {formatDate(post.updated_at)}</span>
                
                <div>
                  <span className="postdetail-likes">🥕 : {post.board_like}</span>
                  <span className="postdetail-comments">조회수: {post.board_view}</span>
                  <span className="postdetail-comments">댓글: {post.board_comment}</span>
                </div>
              </div>
              <div className="separator"></div> {/* 구분선 추가 */}
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.board_content) }} />
            </div>
            </div>
            </div>
        </main>
      </section>
    </>
  );
};

export default PostDetail;
