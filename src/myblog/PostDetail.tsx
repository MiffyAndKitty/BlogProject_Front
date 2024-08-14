// src/myblog/ManagePost/PostDetail.tsx
import React, { useEffect, useState } from 'react';
import { Link,useParams, useLocation,useNavigate } from 'react-router-dom';
import * as TYPES from '../types/index';
import { getPost } from '../services/getService';
import { addLike, deleteLike } from '../services/postService';
import filledCarrot from '../img/filledCarrot.png';
import emptyCarrot from '../img/emptyCarrot.png';
import DOMPurify from 'dompurify';
import './PostDetail.css';
import ConfirmModal from './ConfirmModal'; 
import { deletePost } from '../services/deleteService';

const PostDetail: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const { postID, nickname } = useParams();
  const [post, setPost] = useState<TYPES.getPostDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({}); // 각 글의 좋아요 상태 관리
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');

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
  const handleLike = async () => {
    if (liked[postID]) {
      await deleteLike({ boardId: postID });
      setLiked(prevState => ({ ...prevState, [postID]: false }));
      setPost(prevPost => prevPost ? { ...prevPost, board_like: prevPost.board_like - 1 } : null);
    } else {
      await addLike({ boardId: postID });
      setLiked(prevState => ({ ...prevState, [postID]: true }));
      setPost(prevPost => prevPost ? { ...prevPost, board_like: prevPost.board_like + 1 } : null);
    }
  };
  const fetchPostDetail = async () => {
    try {
      const fetchedPost = await getPost(postID);
      setLiked(prevState => ({ ...prevState, [postID]: fetchedPost.data.isLike}));
      setPost(fetchedPost.data);
      setEmail(fetchedPost.data.user_email);
      setIsWriter(fetchedPost.data.isWriter);
      setTags(fetchedPost.data.tags);
    } catch (err) {
      setError('게시물을 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if(token){
      setToken(token);
    }
    

    fetchPostDetail();
  }, [postID]);

  const editPost = (postID: string)=>{
    if (isWriter === true) navigate(`/fixpost/${nickname}`, { state: { postID } });
    else alert('수정권한이 없습니다!');
  };

  const goToBlog = (nickname:string)=>{
    sessionStorage.setItem('other_email',email);
    navigate(`/${nickname}`);
  };

  const deletePostDetail = (postId: string)=>{
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };
  const removePost = async (postId: string) => {
    try {

      await deletePost(postId);
      navigate(`/${nickname}`);
    } catch (err) {
      console.error(err);
      alert('글을 삭제하는 중에 오류가 발생했습니다.');

    } finally {
      setLoading(false);
    }
  };
  const confirmDelete = () => {
    if (selectedPostId) {
      // 실제 삭제 로직을 여기에 추가
      removePost(selectedPostId);
      console.log(`Post ${selectedPostId} deleted`);
    }
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

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
                <span onClick={() => goToBlog(post.user_nickname)} className="postdetail-author" style={{cursor:'pointer'}}>작성자: {post.user_nickname}</span>
                <span className="postdetail-date">작성날짜: {formatDate(post.created_at)}</span>
                <span className="postdetail-date">수정날짜: {formatDate(post.updated_at)}</span>
                
                <div>
                  <span className="postdetail-likes"><img style={{width:'15px', height:'15px'}} src={filledCarrot}></img> : {post.board_like}</span>
                  <span className="postdetail-comments">조회수: {post.board_view}</span>
                  <span className="postdetail-comments">댓글: {post.board_comment}</span>
                </div>
              </div>
              <div className="separator"></div> {/* 구분선 추가 */}
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.board_content) }} />
              
            </div>
            <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
            <div className="button-group">
            {token &&(
              <button onClick={handleLike} className={`like-button ${liked[postID] ? 'liked' : ''}`}>
              {(liked[postID]) ? (
                <>
                  <img style={{ width: '15px', height: '15px' }} src={filledCarrot} alt="liked carrot" />
                  <span>:</span>
                  {post.board_like}
                </>
              ) : (
                <>
                  <img style={{ width: '15px', height: '15px' }} src={emptyCarrot} alt="empty carrot" />
                  <span>:</span>
                  {post.board_like}
                </>
              )}
            </button>
            )}
            {token && isWriter&&(
              <>
              <button onClick={() => editPost(post.board_id)} className={`like-button ${liked[postID] ? 'liked' : ''}`}>수정</button>
              <button  onClick={() => deletePostDetail(post.board_id)} className={`like-button ${liked[postID] ? 'liked' : ''}`}>삭제</button>
              <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                message="이 게시물을 삭제하시겠습니까?"
              />
              </>
            )}
            </div>
            </div>
            </div>
        </main>
      </section>
    </>
  );
};

export default PostDetail;
