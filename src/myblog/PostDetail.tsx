// src/myblog/ManagePost/PostDetail.tsx
import React, { useEffect, useState,useRef } from 'react';
import { Link,useParams, useLocation,useNavigate } from 'react-router-dom';
import * as TYPES from '../types/index';
import { getComments, getPost } from '../services/getService';
import { addLike, deleteLike, newComment } from '../services/postService';
import filledCarrot from '../img/filledCarrot.png';
import emptyCarrot from '../img/emptyCarrot.png';
import mainCharacterImg from '../img/main_character.png';
import DOMPurify from 'dompurify';
import './PostDetail.css';
import ConfirmModal from './ConfirmModal'; 
import { deletePost } from '../services/deleteService';
interface CommentData {
  comment_id: string;
  comment_content: string;
  user_id: number;
  user_email: string;
  user_nickname: string;
  user_image: string;
  created_at: string;
  level: string;
  children: [] | null;
}
const PostDetail: React.FC = () => {
  const [isBefore, setIsBefore] = useState<boolean>(false);
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
  const [image, setImage] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [sortOption, setSortOption] = useState(''); // 정렬 옵션 상태 추가
  const [sortName, setSortName] = useState('작성순'); // 정렬 이름 상태 추가
  const firstCommentRef = useRef<HTMLDivElement | null>(null);

  // 첫 번째 댓글로 스크롤하는 함수
  const scrollToFirstComment = () => {
    if (firstCommentRef.current) {
      firstCommentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleSortChange = (option, name) => {
    setSortOption(option);
    setSortName(name);
    console.log(option)
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCursor(comments[0].comment_id);
      setIsBefore(true);
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCursor(comments[comments.length - 1].comment_id); 
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
    }
  };
  const writeComment = async()=>{
    try{
      let newData : TYPES.commentData= {
          boardId: postID,
          parentCommentId: null,
          commentContent: comment
      }
      const result = await newComment(newData);
      if(result) {
        alert('댓글 추가에 성공했습니다!');
        setComment(''); // 댓글 등록 후 입력 창 초기화
        fetchComments();
      }else {
        // 상태 코드에 따른 에러 메시지 처리
        if (result.status === 400) {
          alert('잘못된 요청입니다. 입력한 내용을 다시 확인해주세요.');
        } else if (result.status === 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert(`댓글 추가에 실패했습니다! 오류 메시지: ${result.message}`);
        }
      }
    }catch(err){
      alert('댓글 추가에 실패했습니다! 다시 시도해주세요.');
    }
    
  };

  useEffect(() => {
    fetchComments(sortOption,10,cursor);
  }, [currentPage]);

  const fetchComments = async(sort?:string,pageSize?:number,cursor?:string )=>{
    setIsLoading(true);
    try {
      
      const fetchedFollowers = await getComments(postID,sort,pageSize,cursor, isBefore);
      setComments(fetchedFollowers.data);
      setTotalPages(fetchedFollowers.total.totalPageCount|| 1);
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setIsLoading(false);
    }
  };

   /**
   * 날짜 문자열을 원하는 형식으로 변환하는 함수
   * @param dateString - ISO 형식의 날짜 문자열
   * @returns 변환된 날짜 문자열
   */
   const formatDate = (dateString: string): string => {
    const inputDate = new Date(dateString); // 입력된 ISO 형식의 날짜를 Date 객체로 변환
    const currentDate = new Date(); // 현재 시간을 Date 객체로 가져오기
    const adjustedCurrentDate = new Date(currentDate.getTime() + 9 * 60 * 60 * 1000);
  
    // 두 날짜의 차이를 밀리초로 계산
    const timeDifference = adjustedCurrentDate.getTime() - inputDate.getTime();
  
    // 밀리초를 시간, 일, 주 단위로 변환
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = 1000 * 60;
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInDay = millisecondsInHour * 24;
    const millisecondsInWeek = millisecondsInDay * 7;
  
  
    if (timeDifference < millisecondsInMinute) {
      // 1분 미만인 경우 (N초 전으로 표시)
      const secondsDifference = Math.floor(timeDifference / millisecondsInSecond);
      return `${secondsDifference}초 전`;
    }
    else if (timeDifference < millisecondsInHour) {
      // 1시간 미만인 경우 (N분 전으로 표시)
      const minutesDifference = Math.floor(timeDifference / millisecondsInMinute);
      return `${minutesDifference}분 전`;
    } 
    else if (timeDifference < millisecondsInDay) {
      // 하루가 지나지 않은 경우 (N시간 전으로 표시)
      const hoursDifference = Math.floor(timeDifference / millisecondsInHour);
      return `${hoursDifference}시간 전`;
    } else if (timeDifference < millisecondsInWeek) {
      // 하루에서 일주일 사이인 경우 (N일 전으로 표시)
      const daysDifference = Math.floor(timeDifference / millisecondsInDay);
      return `${daysDifference}일 전`;
    } else {
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
    }
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
    setImage(sessionStorage.getItem('image')?sessionStorage.getItem('image') :  mainCharacterImg);
    fetchComments();
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
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value); // 댓글 입력 값 상태 업데이트
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
            <div style={{marginTop:'70px'}} className="postdetail-detail">
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
            <div  ref= {firstCommentRef} className="comment-section">

              <h3>댓글</h3>
                      
              <div className='comment-profile'>
                <img alt="Profile" className="heart" src={image}></img>
                <div className="textarea-container">
                  <textarea
                    className="comment-input"
                    placeholder="댓글을 입력하세요..."
                    value={comment} // textarea의 value를 상태로 관리
                    onChange={handleCommentChange} // 댓글 입력 시 상태 업데이트
                  />
                  <button className="comment-submit-button" onClick={writeComment}>댓글 등록</button>
                </div>
              </div>
                      
              <div className="comment-list">

                {isLoading ? (
                  <div>댓글을 불러오는 중...</div>
                ) : (
                  comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div key={comment.comment_id} className="comment-item"  >
                        <div className="comment-header">
                          <img className='heart' src={comment.user_image || mainCharacterImg} alt="User Profile"  />
                          <div className='comment-item-content'>
                            <span className="comment-item-author">{comment.user_nickname}</span>
                            <div className="comment-content">{comment.comment_content}</div>
                            <span className="comment-date">{formatDate(comment.created_at)}</span>
                          </div>
                         
                          
                        </div>
                       
                      </div>
                    ))
                  ) : (
                    <div className="no-comments">
                    <span className="no-comments-icon">💬</span>
                    <p>아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
                  </div>
                  )
                )}

             

              </div>

              <div className="scroll-to-top-container">
                  <button onClick={scrollToFirstComment} className="scroll-to-top-button">
                    첫 댓글로 이동
                  </button>
              </div>

              </div>

            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default PostDetail;
