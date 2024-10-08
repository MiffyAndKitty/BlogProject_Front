// src/myblog/ManagePost/PostDetail.tsx
import React, { useEffect, useState,useRef, useLayoutEffect } from 'react';
import { Link,useParams, useLocation,useNavigate } from 'react-router-dom';
import * as TYPES from '../types/index';
import { getComments, getPost,getCommentReplies } from '../services/getService';
import { addLike, deleteLike, newComment,addCommentLike } from '../services/postService';
import {deleteCommentLike,deleteComment} from '../services/deleteService';
import {fixComment} from '../services/putService';
import filledCarrot from '../img/filledCarrot.png';
import emptyCarrot from '../img/emptyCarrot.png';
import spaceBar from '../img/spaceBar.png';
import mainCharacterImg from '../img/main_character.png';
import emptyDisLikeComment from '../img/empty_dislike_comment.png';
import emptyLikeComment from '../img/empty_like_comment.png';
import filledDisLikeComment from '../img/filled_dislike_comment.png';
import notConfirm from '../img/not_confirm.png';
import filledLikeComment from '../img/filled_like_comment.png';
import spinner from '../img/Spinner.png';
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
  likes: number;
  dislikes: number;
  children: [] | null;
  isDislike:boolean;
  isLike:boolean;
  isWriter:boolean; 
  reply_count:number

}
interface DetailPostsProps {
  isDeleteUser?:boolean
}
const PostDetail: React.FC<DetailPostsProps> = ({isDeleteUser}) => {
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const { postID, nickname, commentID,replyID } = useParams();
  const [post, setPost] = useState<TYPES.getPostDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({}); // 각 글의 좋아요 상태 관리
  const [likedCommment, setLikedComment] = useState<{ [key: string]: boolean }>({}); // 각 글의 좋아요 상태 관리
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [image, setImage] = useState<string>(mainCharacterImg);
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [sortOption, setSortOption] = useState(''); // 정렬 옵션 상태 추가
  const [sortName, setSortName] = useState('작성순'); // 정렬 이름 상태 추가
  const [isWriteComment, setIsWriteComment] = useState(false);

  const firstCommentRef = useRef<HTMLDivElement | null>(null);
  const lastCommentRef = useRef<HTMLDivElement | null>(null); // 마지막 댓글 참조를 위한 Ref 생성
  const commentRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const replyRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isCommentScrolled, setIsCommentScrolled] = useState(false); // 스크롤 완료 여부를 추적하는 상태
  const [isReplyScrolled, setIsReplyScrolled] = useState(false); // 스크롤 완료 여부를 추적하는 상태

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null); // 수정 중인 댓글 ID 상태
  const [editingCommentContent, setEditingCommentContent] = useState<string>(''); // 수정 중인 댓글 내용 상태
  const [totalComments, setTotalComment] = useState<number>(0);
  const [replies, setReplies] = useState<{ [key: string]: CommentData[] }>({}); // 각 댓글의 답글 상태 관리
  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>({}); // 답글이 열려 있는지 여부 상태 관리
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({}); // 각 댓글의 답글 입력 상태 관리
   // 각 댓글의 ref를 설정하는 함수
   const setCommentRef = (commentId: string, ref: HTMLDivElement | null, isLast: boolean) => {
    commentRef.current[commentId] = ref; // 각 댓글의 ref 저장
    if (isLast) {
      lastCommentRef.current = ref; // 마지막 댓글일 경우 lastCommentRef 설정
    }

      if (commentID && commentRef.current[commentID] && !isCommentScrolled) {
        // commentID에 해당하는 댓글이 존재하면 스크롤
        commentRef.current[commentID]?.scrollIntoView({ behavior: 'smooth' });
        setIsCommentScrolled(true);
      }
  };
  // 각 댓글의 ref를 설정하는 함수
  const setReplyRef = (commentId: string, ref: HTMLDivElement | null, isLast: boolean) => {
    replyRef.current[commentId] = ref; // 각 댓글의 ref 저장

      if (replyID && replyRef.current[replyID] && !isReplyScrolled) {
        // commentID에 해당하는 댓글이 존재하면 스크롤
        replyRef.current[replyID]?.scrollIntoView({ behavior: 'smooth' });
        setIsReplyScrolled(true);
      }
  };
  // 첫 번째 댓글로 스크롤하는 함수
  const scrollToFirstComment = () => {
    if (firstCommentRef.current) {
      firstCommentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleSortChange = (option) => {
    setSortOption(option);


  };
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => setIsImageLoaded(true);
      img.onerror = () => setIsImageLoaded(false);
    } else {
      setIsImageLoaded(false);
    }
  }, [image]);
  const writeComment = async()=>{
    try{
      let newData : TYPES.commentData= {
          boardId: postID,
          parentCommentId: null,
          commentContent: comment
      }
      
      const result = await newComment(newData);
     
      if(result){
        
        setComment(''); // 댓글 등록 후 입력 창 초기화
        // 댓글을 등록한 후 1페이지로 돌아가서 댓글 목록을 다시 불러옵니다.
        setCursor(''); // Cursor를 초기화하여 첫 페이지를 가져오도록 함
        setCurrentPage(1); // 페이지를 첫 페이지로 설정
        fetchComments(sortOption, 10,''); // 첫 페이지의 댓글 목록 불러오기
       //alert('댓글 추가에 성공했습니다!');
       
       setTotalComment(totalComments+1);
       setIsWriteComment(true);
       //lastCommentRef.current.scrollIntoView({ behavior: 'smooth' });
      }
     
    
    }catch(err){
       // 상태 코드에 따른 에러 메시지 처리
       if(err.response) alert(`댓글 추가 중에 오류가 발생했습니다: ${err.response.data.message}`); 
    }
    
  };
  useEffect(()=>{
    if(isWriteComment === true){
      
      setIsWriteComment(false);
    } 
  },[isWriteComment]);

  useEffect(() => {
    if (comments.length === 0) return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting ) {
          setCursor(comments[comments.length - 1].comment_id);
        }
      },
      { threshold: 0.5 }
    );
  
    const mutationObserver = new MutationObserver(() => {
      if (lastCommentRef.current) {
        observer.observe(lastCommentRef.current);
      }
    });
  
    if (lastCommentRef.current) {
      observer.observe(lastCommentRef.current);
    }
  
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  
    return () => {
      if (lastCommentRef.current) {
        observer.unobserve(lastCommentRef.current);
      }
      mutationObserver.disconnect();
    };
  }, [comments, isLoading, currentPage, totalPages]);
  
  
  
  
  useEffect(() => {
    if (cursor !== '') {
      fetchComments(sortOption, 10, cursor); // cursor 변경 시 fetchComments 호출
    }
  }, [cursor]);

  useEffect(() => {
    setCursor('');
    setComments([]);
    fetchComments(sortOption, 10, ''); // cursor 변경 시 fetchComments 호출
  }, [ sortOption]);


  const fetchComments = async (sort?: string, pageSize: number = 10, cursor?: string) => {
    if (isLoading) return; // 로딩 중이면 추가 요청 방지

    setIsLoading(true);
    try {

      const fetchedComments = await getComments(postID, sort, pageSize, cursor);
     
      if (cursor) {
        // cursor가 있는 경우에는 기존 댓글에 추가
        setComments(prevComments => [...prevComments, ...fetchedComments.data]); 
      } else {
        // cursor가 없는 경우, 새로 불러온 댓글로 덮어쓰기
        setComments(fetchedComments.data);
      }
      setTotalPages(fetchedComments.total.totalPageCount || 1);
      setCurrentPage(prevPage => prevPage + 1); // 페이지 증가
      
    } catch (error) {
      console.error('Failed to load comments:', error);
      if(error.response) alert(`댓글 조회 중에 오류가 발생했습니다: ${error.response.data.message}`); 
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

 const fetchReplies = async (commentId: string) => {
    try {
      const fetchedReplies = await getCommentReplies(commentId); // 특정 댓글의 답글을 가져옴
      setReplies(prevReplies => ({ ...prevReplies, [commentId]: fetchedReplies.data }));
    } catch (error) {
      if(error.response) alert(`답글 조회 중에 오류가 발생했습니다: ${error.response.data.message}`); 
      console.error('Failed to load replies:', error);
    }
  };
  // const cleanHTMLContent=(html: string): string =>{

  //   console.log(`
      
      
  //     cleanHTMLContent
      

  //     `,html)
  //     // DOMParser를 사용해 HTML 파싱
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(html, 'text/html');
      
  //   // 제거할 불필요한 태그 목록
  //   const tagsToRemove = ['style', 'script', 'iframe', 'object'];
  //   tagsToRemove.forEach(tag => {
  //     const elements = doc.getElementsByTagName(tag);
  //     while (elements[0]) {
  //       elements[0].parentNode?.removeChild(elements[0]);
  //     }
  //   });
  
  //   // 모든 태그에서 인라인 스타일 제거
  //   const allElements = doc.body.getElementsByTagName('*');
  //   for (let i = 0; i < allElements.length; i++) {
  //     allElements[i].removeAttribute('style'); // 인라인 스타일 제거
  //   }
  
  //   // 불필요한 클래스 제거 (필요에 따라 더 추가 가능)
  //   const classesToRemove = ['ql-font-monospace', 'ql-align-center'];
  //   for (let className of classesToRemove) {
  //     const elements = doc.getElementsByClassName(className);
  //     while (elements[0]) {
  //       elements[0].classList.remove(className);
  //     }
  //   }
  
  //   // 정리된 HTML을 다시 문자열로 변환해서 반환
  //   return doc.body.innerHTML;
  // }
  const handleReplyClick = async (commentId: string) => {
    if (openReplies[commentId]) {
      // 이미 열려 있는 경우 닫기
      setOpenReplies(prevOpenReplies => ({ ...prevOpenReplies, [commentId]: false }));
    } else {
      // 열려 있지 않은 경우 답글 가져오기
      if (!replies[commentId]) {
        await fetchReplies(commentId);
      }
      setOpenReplies(prevOpenReplies => ({ ...prevOpenReplies, [commentId]: true }));
    }
  };

  const handleReplyInputChange = (commentId: string, value: string) => {
      // 문자열의 바이트 길이 계산 함수
     const getByteLength = (str: string) => {
      let byteLength = 0;
      for (let i = 0; i < str.length; i++) {
          byteLength += str.charCodeAt(i) > 0x007f ? 3 : 1; // 한글 3바이트, 영문 1바이트
      }
      return byteLength;
    };

    if (getByteLength(value) <= 600) {
      setReplyInputs(prevState => ({
        ...prevState,
        [commentId]: value,
      }));
    } else {
      alert('답글은 최대 한글200자/영문600자까지만 작성할 수 있습니다.');
    }


   
  };

  const submitReply = async (commentId: string) => {
  try {
    const newReply: TYPES.commentData = {
      boardId: postID,
      parentCommentId: commentId,
      commentContent: replyInputs[commentId],
    };
    
    const result = await newComment(newReply);
    
    if (result) {
      //alert('답글 추가에 성공했습니다!');
      setReplyInputs(prevState => ({
        ...prevState,
        [commentId]: '', // 답글 입력 후 초기화
      }));
      await fetchReplies(commentId); // 답글 목록 갱신
      // 댓글의 reply_count를 증가시키기 위해 comments 상태 업데이트
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.comment_id === commentId
            ? { ...comment, reply_count: comment.reply_count + 1 } // reply_count 증가
            : comment
        )
      );
    }
  } catch (error) {
    if(error.response) alert(`답글 추가 중에 오류가 발생했습니다: ${error.response.data.message}`); 
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
  /**
   * isLike 가 true 면 좋아요, false 면 싫어요
   * @param isComment 
   * @param commentId 
   * @param isLike 
   * @param liked 
   * @param parentCommentId 
   */
  const handleCommentLike = async (isComment: boolean, commentId: string, isLike: boolean, liked: boolean, parentCommentId?: string) => {
    try {
      if (isComment) {
        // 일반 댓글에 대한 좋아요/싫어요 처리
        setComments(prevComments =>
          prevComments.map(comment => {
            if (comment.comment_id === commentId) {
              if (isLike) {
                // 좋아요를 눌렀을 때, 싫어요는 자동으로 해제
                return {
                  ...comment,
                  isLike: !liked,
                  likes: liked ? comment.likes - 1 : comment.likes + 1,
                  isDislike: false, // 싫어요 해제
                  dislikes: comment.isDislike ? comment.dislikes - 1 : comment.dislikes // 싫어요 수 감소
                };
              } else {
                // 싫어요를 눌렀을 때, 좋아요는 자동으로 해제
                return {
                  ...comment,
                  isDislike: !liked,
                  dislikes: liked ? comment.dislikes - 1 : comment.dislikes + 1,
                  isLike: false, // 좋아요 해제
                  likes: comment.isLike ? comment.likes - 1 : comment.likes // 좋아요 수 감소
                };
              }
            }
            return comment;
          })
        );
      } else if (parentCommentId) {
        // 답글(대댓글)에 대한 좋아요/싫어요 처리
        setReplies(prevReplies => ({
          ...prevReplies,
          [parentCommentId]: prevReplies[parentCommentId].map(reply => {
            if (reply.comment_id === commentId) {
              if (isLike) {
                // 좋아요를 눌렀을 때, 싫어요는 자동으로 해제
                return {
                  ...reply,
                  isLike: !liked,
                  likes: liked ? reply.likes - 1 : reply.likes + 1,
                  isDislike: false, // 싫어요 해제
                  dislikes: reply.isDislike ? reply.dislikes - 1 : reply.dislikes // 싫어요 수 감소
                };
              } else {
                // 싫어요를 눌렀을 때, 좋아요는 자동으로 해제
                return {
                  ...reply,
                  isDislike: !liked,
                  dislikes: liked ? reply.dislikes - 1 : reply.dislikes + 1,
                  isLike: false, // 좋아요 해제
                  likes: reply.isLike ? reply.likes - 1 : reply.likes // 좋아요 수 감소
                };
              }
            }
            return reply;
          })
        }));
      }
  
      // 서버에 좋아요/싫어요 요청 보내기
      if (liked) {
        await deleteCommentLike(commentId);
      } else {
        await addCommentLike({ commentId: commentId, isLike: isLike });
      }
    } catch (error) {
      console.error("Failed to update like/dislike", error);
      if(error.response) alert(`좋아요/싫어요  오류가 발생했습니다: ${error.response.data.message}`); 
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
      setTotalComment(fetchedPost.data.board_comment);
    } catch (err) {
      if(err.response) alert(`게시물 내용을 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
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
     // 댓글을 등록한 후 1페이지로 돌아가서 댓글 목록을 다시 불러옵니다.
     setCursor(''); // Cursor를 초기화하여 첫 페이지를 가져오도록 함
     setCurrentPage(1); // 페이지를 첫 페이지로 설정
     fetchComments(sortOption, 10,''); // 첫 페이지의 댓글 목록 불러오기
    fetchPostDetail();

    if(replyID){
      handleReplyClick(commentID)
    }

  }, [postID]);



  const editPost = (postID: string)=>{
    if (isWriter === true) navigate(`/fixpost/${postID}`);
    else alert('수정권한이 없습니다!');
  };

  const goToBlog = (nickname:string)=>{
 
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
      if(err.response) alert(`글을 삭제하는 중에 오류가 발생했습니다: ${err.response.message}`);

    } finally {
      setLoading(false);
    }
  };
  const confirmDelete = () => {
    if (selectedPostId) {
      // 실제 삭제 로직을 여기에 추가
      removePost(selectedPostId);

    }
    setIsModalOpen(false);
    setSelectedPostId(null);
  };
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    // 문자열의 바이트 길이 계산 함수
    const getByteLength = (str: string) => {
      let byteLength = 0;
      for (let i = 0; i < str.length; i++) {
          byteLength += str.charCodeAt(i) > 0x007f ? 3 : 1; // 한글 3바이트, 영문 1바이트
      }
      return byteLength;
   };
    if (getByteLength(inputValue) <= 600) {
      setComment(inputValue); // 댓글 입력 값 상태 업데이트
    } else {
      alert('댓글은 최대 한글200자/영문600자까지만 작성할 수 있습니다.');
    }
  };
  const handleDeleteComment = (commentId: string) => {
    setSelectedCommentId(commentId);
    setIsCommentModalOpen(true); // 삭제 확인 모달 열기
  };
  const confirmDeleteComment = async (isComment: boolean, parentCommentId?: string) => {
    if (selectedCommentId) {
      try {
        await deleteComment(selectedCommentId);
  
        if (isComment) {
          // 일반 댓글 삭제
          setComments(prevComments => prevComments.filter(comment => comment.comment_id !== selectedCommentId));
        } else if (parentCommentId) {
          // 답글 삭제
          setReplies(prevReplies => ({
            ...prevReplies,
            [parentCommentId]: prevReplies[parentCommentId].filter(reply => reply.comment_id !== selectedCommentId)
          }));
        }
      } catch (err) {
        if(err.response) alert(`댓글 삭제 중에 오류가 발생했습니다: ${err.response.data.message}`); 
        console.error('댓글 삭제 중 오류 발생:', err);
      } finally {
        setIsCommentModalOpen(false);
        setSelectedCommentId(null);
      }
    }
  };
  
  const handleEditComment = (commentId: string, commentContent: string) => {
    setEditingCommentId(commentId); // 수정할 댓글 ID 설정
    setEditingCommentContent(commentContent); // 수정할 댓글 내용을 설정
  };
  const handleSaveCommentEdit = async (isComment:boolean, parentCommentId?:string) => {
    if (editingCommentId) {
      try {
        const formData = {
          commentId: editingCommentId,
          commentContent:editingCommentContent
        }

        const result = await fixComment(formData); // 댓글 수정 API 호출
        if (result) {
          if(isComment){
            setComments(prevComments =>
              prevComments.map(comment =>
                comment.comment_id === editingCommentId
                  ? { ...comment, comment_content: editingCommentContent } // 수정된 내용 반영
                  : comment
              )
            );
          }else{
            
             setReplies(prevReplies => ({
              ...prevReplies,
              [parentCommentId]: prevReplies[parentCommentId].map(reply =>
                reply.comment_id === editingCommentId
                  ? { ...reply, comment_content: editingCommentContent } // 수정된 답글 내용 반영
                  : reply
              )
            }));
          }
         
          setEditingCommentId(null); // 수정 완료 후 상태 초기화
          setEditingCommentContent(''); // 수정 완료 후 상태 초기화
        }
      } catch (err) {
        if(err.response) alert(`댓글 수정 중에 오류가 발생했습니다: ${err.response.data.message}`); 
        console.error('댓글 수정 중 오류 발생:', err.response.message);
      }
    }
  };
  
  const handleCancelCommentEdit = () => {
    setEditingCommentId(null); // 수정 취소 시 상태 초기화
    setEditingCommentContent(''); // 수정 취소 시 상태 초기화
  };

  // if (loading) {
  //   return <div>로딩 중...</div>;
  // }

  // if (error) {
  //   return <div>{error}</div>;
  // }

  // if (!post) {
  //   return <div>게시물을 찾을 수 없습니다.</div>;
  // }
  const renderComments = (commentsList: CommentData[], parentCommentId?: string) => {
    return commentsList.map((comment, index) => (
      <div key={comment.comment_id} 
      className="comment-item" 
      ref={(el) => setCommentRef(comment.comment_id, el, index === commentsList.length - 1 && !parentCommentId)}
      >
        <div className="comment-header" >
          <img className='heart-no-spin' src={comment.user_image || mainCharacterImg} alt="User Profile" onClick={()=>{navigate(`/${comment.user_nickname}`)}}/>
          <div className='comment-item-content'>
            <span className="comment-item-author" onClick={()=>{navigate(`/${comment.user_nickname}`)}}>{comment.user_nickname}</span>
            
            {editingCommentId === comment.comment_id ? (
              // 댓글 수정 모드일 때
              <textarea
              className="comment-input"
              value={editingCommentContent}
              onChange={(e) => setEditingCommentContent(e.target.value)} // 수정 내용 업데이트
            />
            ) : (
              // 기본 댓글 내용 표시
              <div className="comment-content">{comment.comment_content}</div>
            )}
            
            <div className='flexRow'>
              <span className="comment-date">{formatDate(comment.created_at)}</span>
              <span onClick={() => handleReplyClick(comment.comment_id)} className="comment-commentBtn">답글[{comment.reply_count}]</span>
              
              {/** 댓글 좋아요/싫어요 버튼 */}
              {token && (
                <div className='comment-like-btns'>
                  <button onClick={() => handleCommentLike(true, comment.comment_id, true, comment.isLike)} className={`comment-like-button ${comment.isLike ? 'liked' : ''}`}>
                    <img style={{ width: '30px', height: '30px' }} src={comment.isLike ? filledLikeComment : emptyLikeComment} alt="like" />
                    <span>:</span>{comment.likes}
                  </button>
                  <button onClick={() => handleCommentLike(true, comment.comment_id, false, comment.isDislike)} className={`comment-like-button ${comment.isDislike ? 'liked' : ''}`}>
                    <img style={{ width: '30px', height: '30px' }} src={comment.isDislike ? filledDisLikeComment : emptyDisLikeComment} alt="dislike" />
                    <span>:</span>{comment.dislikes}
                  </button>
                </div>
              )}
               {!token && (
                <div className='comment-like-btns'>
                  <button onClick={() => alert('로그인 후 이용해주세요!')} className={`comment-like-button ${comment.isLike ? 'liked' : ''}`}>
                    <img style={{ width: '30px', height: '30px' }} src={comment.isLike ? filledLikeComment : emptyLikeComment} alt="like" />
                    <span>:</span>{comment.likes}
                  </button>
                  <button onClick={() => alert('로그인 후 이용해주세요!')} className={`comment-like-button ${comment.isDislike ? 'liked' : ''}`}>
                    <img style={{ width: '30px', height: '30px' }} src={comment.isDislike ? filledDisLikeComment : emptyDisLikeComment} alt="dislike" />
                    <span>:</span>{comment.dislikes}
                  </button>
                </div>
              )}
            </div>

             {/** 댓글 수정/삭제 버튼 */}
          {comment.isWriter && token && (
            <div className='reply-edit-delete-mobile'> 
              {editingCommentId === comment.comment_id ? (
                <>
                  <button onClick={()=>{handleSaveCommentEdit(true)}} className="like-button">저장</button>
                  <button onClick={handleCancelCommentEdit} className="like-button">취소</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditComment(comment.comment_id, comment.comment_content)} className="like-button">수정</button>
                  <button onClick={() => handleDeleteComment(comment.comment_id)} className="like-button">삭제</button>
                </>
              )}
              <ConfirmModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                onConfirm={()=>{confirmDeleteComment(true)}}
                message="이 댓글을 삭제하시겠습니까?"
              />
            </div>
          )}
          </div>
          
           {/** 댓글 수정/삭제 버튼 */}
           {comment.isWriter && token && (
            <div className='reply-edit-delete'> 
              {editingCommentId === comment.comment_id ? (
                <>
                  <button onClick={()=>{handleSaveCommentEdit(true)}} className="like-button">저장</button>
                  <button onClick={handleCancelCommentEdit} className="like-button">취소</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditComment(comment.comment_id, comment.comment_content)} className="like-button">수정</button>
                  <button onClick={() => handleDeleteComment(comment.comment_id)} className="like-button">삭제</button>
                </>
              )}
              <ConfirmModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                onConfirm={()=>{confirmDeleteComment(true)}}
                message="이 댓글을 삭제하시겠습니까?"
              />
            </div>
          )}
          
        </div>
         
        {/* 답글 입력창 및 답글 목록 */}
        {openReplies[comment.comment_id] && (
          <div className="reply-section">
            <div className='comment-profile'>
              <img alt="Profile" className="heart-no-spin" src={profileImage}></img>
              <div className="textarea-container2">
                {token &&(
                  <textarea
                  className="comment-input"
                  placeholder="답글을 입력하세요..."
                  value={replyInputs[comment.comment_id] || ''} // textarea의 value를 상태로 관리
                  onChange={(e) => handleReplyInputChange(comment.comment_id, e.target.value)}
                />
                )}
                
                {!token &&(
                             <div className="no-login-comment">
                             <span className="no-login-comments-icon">🔒</span>
                             <p><Link to="/login">로그인</Link> 후 이용해주세요!</p>
                           </div>
                 )}
                <button className="comment-submit-button"  onClick={() => submitReply(comment.comment_id)}>답글 등록</button>
              </div>
            </div>
  
            <div className="reply-list">
              {replies[comment.comment_id] && replies[comment.comment_id].length > 0 && (
                renderReplies(replies[comment.comment_id], comment.comment_id) // 재귀적으로 답글 렌더링
              ) }
            </div>
          </div>
        )}
      </div>
    ));
  };
  
  const renderReplies = (commentsList: CommentData[], parentCommentId?: string) => {
    return commentsList.map((comment, index) => (
      <div key={comment.comment_id} 
      className="comment-item2" 
      ref={(el) => setReplyRef(comment.comment_id, el, index === commentsList.length - 1 && !parentCommentId)}
      >
        <div className="comment-header2">
          <img className='spaceBar' src={spaceBar} alt="User Profile" onClick={()=>{navigate(`/${comment.user_nickname}`)}}/>
          <img className='heart2' src={comment.user_image || mainCharacterImg} alt="User Profile" onClick={()=>{navigate(`/${comment.user_nickname}`)}}/>
          <div className='comment-item-content'>
            <span className="comment-item-author">{comment.user_nickname}</span>
            {editingCommentId === comment.comment_id ? (
              // 답글 수정 모드일 때
              <textarea
              className="comment-input"
              value={editingCommentContent}
              onChange={(e) => setEditingCommentContent(e.target.value)} // 수정 내용 업데이트
            />
            ) : (
              // 기본 답글 내용 표시
              <div className="comment-content2">{comment.comment_content}</div>
            )}
            
            <div className='flexRow-reply'>
              <span className="comment-date">{formatDate(comment.created_at)}</span>
              
              {/** 답글 좋아요/싫어요 버튼 */}
              {token && (
                <div className='comment-like-btns'>
                  <button 
                    onClick={() => handleCommentLike(false, comment.comment_id, true, comment.isLike, parentCommentId)} 
                    className={`comment-like-button ${comment.isLike ? 'liked' : ''}`}
                  >
                    <img style={{ width: '30px', height: '30px' }} src={comment.isLike ? filledLikeComment : emptyLikeComment} alt="like" />
                    <span>:</span>{comment.likes}
                  </button>
                  <button 
                    onClick={() => handleCommentLike(false, comment.comment_id, false, comment.isDislike, parentCommentId)} 
                    className={`comment-like-button ${comment.isDislike ? 'liked' : ''}`}
                  >
                    <img style={{ width: '30px', height: '30px' }} src={comment.isDislike ? filledDisLikeComment : emptyDisLikeComment} alt="dislike" />
                    <span>:</span>{comment.dislikes}
                  </button>
                </div>
              )}

              {!token && (
               <div className='comment-like-btns'>
                  <button 
                    onClick={() => alert('로그인 후 이용해주세요!')} 
                    className={`comment-like-button ${comment.isLike ? 'liked' : ''}`}
                  >
                    <img style={{ width: '30px', height: '30px' }} src={comment.isLike ? filledLikeComment : emptyLikeComment} alt="like" />
                    <span>:</span>{comment.likes}
                  </button>
                  <button 
                    onClick={() => alert('로그인 후 이용해주세요!')} 
                    className={`comment-like-button ${comment.isDislike ? 'liked' : ''}`}
                  >
                    <img style={{ width: '30px', height: '30px' }} src={comment.isDislike ? filledDisLikeComment : emptyDisLikeComment} alt="dislike" />
                    <span>:</span>{comment.dislikes}
                  </button>
                </div>
              )}
            </div>
          </div>
          
           {/** 답글 수정/삭제 버튼 -웹화면*/}
           {comment.isWriter && token && (
            <div className='reply-edit-delete'>
              {editingCommentId === comment.comment_id ? (
                <>
                  <button onClick={()=>{handleSaveCommentEdit(false,parentCommentId)}} className="like-button2">저장</button>
                  <button onClick={handleCancelCommentEdit} className="like-button2">취소</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditComment(comment.comment_id, comment.comment_content)} className="like-button2">수정</button>
                  <button onClick={() => handleDeleteComment(comment.comment_id)} className="like-button2">삭제</button>
                </>
              )}
              <ConfirmModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                onConfirm={()=>{confirmDeleteComment(false, parentCommentId)}}
                message="이 댓글을 삭제하시겠습니까?"
              />
            </div>
          )}
        </div>
          {/** 답글 수정/삭제 버튼 -모바일화면*/}
          {comment.isWriter && token && (
            <div className='reply-edit-delete-mobile'> 
              {editingCommentId === comment.comment_id ? (
                <>
                  <button onClick={()=>{handleSaveCommentEdit(false,parentCommentId)}} className="like-button2">저장</button>
                  <button onClick={handleCancelCommentEdit} className="like-button2">취소</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditComment(comment.comment_id, comment.comment_content)} className="like-button2">수정</button>
                  <button onClick={() => handleDeleteComment(comment.comment_id)} className="like-button2">삭제</button>
                </>
              )}
              <ConfirmModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                onConfirm={()=>{confirmDeleteComment(false, parentCommentId)}}
                message="이 댓글을 삭제하시겠습니까?"
              />
            </div>
          )}
      </div>
    ));
  };
  
  const goToTagPost=(tag:string) =>{
    navigate(`/dashboard/all-post/${tag}`);
  };
  
  const profileImage = isImageLoaded ? image : mainCharacterImg;
  return (
    <>
              {!isDeleteUser && (
                <h2 style={{cursor:'pointer'}} onClick={()=>{navigate(`/${nickname}`)}}>{nickname}의 블로그</h2>
              )}
             {isDeleteUser && (
                <div style={{display:'flex', justifyContent:'center', textAlign:'center', alignItems:'center'}}>
                  <h2 style={{cursor:'pointer'}} >탈퇴한 사용자입니다 </h2>
                  <img src={notConfirm} style={{width:'30px', height:'30px',}} />
                </div>
              )}
                <hr className="notification-divider" />
       
     
              <div style={{ marginTop: '20px' }} className="postdetail-detail">
                {loading ?  (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px', color: '#555' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                    </div>
                    <span>로딩 중...</span>
                  </div>
                ) : error ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px', color: 'red', border: '1px solid red', borderRadius: '5px', backgroundColor: '#ffe6e6' }}>
                    {error}
                  </div>
                ) : !post ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px', color: '#555', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                    게시물을 찾을 수 없습니다.
                  </div>
                ) : (
                  <>
                    <h2>{post.board_title}</h2>

                    <div className="postdetail-meta">

                      {isDeleteUser?(
                        <span
                        className="postdetail-author"
                        style={{ cursor: 'pointer' }}
                      >
                        작성자: {post.user_nickname}
                      </span>

                      ):(
                        <span
                        onClick={() => goToBlog(post.user_nickname)}
                        className="postdetail-author"
                        style={{ cursor: 'pointer' }}
                      >
                        작성자: {post.user_nickname}
                      </span>

                      )}

                      
                      <div className='postdetail-meta-meta'>
                        <span className="postdetail-date">작성날짜: {formatDate(post.created_at)}</span>
                        <span className="postdetail-date">수정날짜: {formatDate(post.updated_at)}</span>

                        <div>
                        <span className="postdetail-likes">
                          <img style={{ width: '15px', height: '15px' }} src={filledCarrot} alt="likes" /> : {post.board_like}
                        </span>
                        <span className="postdetail-comments">조회수: {post.board_view}</span>
                        <span className="postdetail-comments">댓글: {post.board_comment}</span>
                        </div>
                       
                      </div>

                    </div>
                    
                    <div className="separator"></div> {/* 구분선 추가 */}
                    <div className='postdetail-content' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.board_content) }} />
                  </>
                )}
              </div>
              {post && !error && (
                <>
                  <div className="tags">
                    {tags.map((tag) => (
                      <span key={tag} className="tag" onClick={()=>{goToTagPost(tag)}}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="button-group">
                    {token && !isDeleteUser&&(
                      <button onClick={handleLike} className={`like-button ${liked[postID] ? 'liked' : ''}`}>
                        {liked[postID] ? (
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
                    {!token && !isDeleteUser&&(
                      <button onClick={()=>{alert('로그인 후 이용해주세요!')}} className={`like-button ${liked[postID] ? 'liked' : ''}`}>
                        {liked[postID] ? (
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
                    {token && isWriter && !isDeleteUser&&(
                      <>
                        <button
                          onClick={() => editPost(post.board_id)}
                          className={`like-button ${liked[postID] ? 'liked' : ''}`}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deletePostDetail(post.board_id)}
                          className={`like-button ${liked[postID] ? 'liked' : ''}`}
                        >
                          삭제
                        </button>
                        <ConfirmModal
                          isOpen={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                          onConfirm={confirmDelete}
                          message="이 게시물을 삭제하시겠습니까?"
                        />
                      </>
                    )}
                  </div>
                  {!isDeleteUser&&(
                    <div ref={firstCommentRef} className="comment-section">
                    <div className="titleSort">
                      <h3>
                        댓글 <span style={{ marginLeft: '10px', color: '#FF88D7', backgroundColor:'transparent' }}>{totalComments}</span>
                      </h3>
                      <div style={{ marginLeft: '30px' }}>
                        <span
                          onClick={() => {
                            handleSortChange('');
                          }}
                          className={sortOption === '' ? 'toggle-sort-comment click' : 'toggle-sort-comment'}
                        >
                          등록순
                        </span>
                        <span
                          onClick={() => {
                            handleSortChange('like');
                          }}
                          className={sortOption === 'like' ? 'toggle-sort-comment click' : 'toggle-sort-comment'}
                        >
                          인기순
                        </span>
                      </div>
                    </div>
  
                    <div className="comment-profile">
                      <img alt="Profile" className="heart-no-spin" src={profileImage}></img>
                      <div className="textarea-container">
                        {token &&(
                             <textarea
                             className="comment-input"
                             placeholder="댓글을 입력하세요..."
                             value={comment} // textarea의 value를 상태로 관리
                             onChange={handleCommentChange} // 댓글 입력 시 상태 업데이트
                            />
                        )}
                       {!token &&(
                             <div className="no-login-comment">
                             <span className="no-login-comments-icon">🔒</span>
                             <p><Link to="/login">로그인</Link> 후 이용해주세요!</p>
                           </div>
                        )}
                        <button className="comment-submit-button" onClick={writeComment}>
                          댓글 등록
                        </button>
                      </div>
                    </div>
  
                    <div className="comment-list">
                      {isLoading ? (
                        <div>댓글을 불러오는 중...</div>
                      ) : comments.length > 0 ? (
                        renderComments(comments) 
                      ) : (
                        <div className="no-comments">
                          <span className="no-comments-icon">💬</span>
                          <p>아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
                        </div>
                      )}
                    </div>
  
                    <div className="scroll-to-top-container">
                      <button onClick={scrollToFirstComment} className="scroll-to-top-button">
                        첫 댓글로 이동
                      </button>
                    </div>
                  </div>
                  )}
                  
                </>
              )}
        
     
    </>
  );
  
  
};

export default PostDetail;
