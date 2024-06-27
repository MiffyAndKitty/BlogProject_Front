import React, { useState, useEffect } from 'react';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './GetPost.css';
import { newPost } from '../../types';
import { getPosts } from '../../services/getService';

const GetPost: React.FC = () => {
  const [posts, setPosts] = useState<newPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
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
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="post-list">
            {posts.map(post => (
              <div className="post-card" key={post.title}>
                <div className="post-header">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-meta">
                    <span className="post-date">24.05.25 오후 8:54</span>
                    <span className="post-stats">
                      <span className="post-likes">🥕 : 5</span>
                      <span className="post-comments">댓글: 7</span>
                    </span>
                  </div>
                </div>
                <div className="post-content">{post.content}</div>
                <div className="post-actions">
                  <button className="edit-btn">수정</button>
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
