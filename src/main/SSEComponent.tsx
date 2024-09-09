import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';
import './SSEComponent.css'; // 스타일링을 위한 CSS 파일
import mainCharacterImg from '../img/main_character.png';

function SSEComponent({ onNotification }) {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [localNickName, setLocalNickName] = useState<string>('');
  const [image, setImage] = useState<string>(mainCharacterImg);
  const newFollower = 'new-follower';
  const writeNewPost = 'following-new-board';
  const newComment = 'comment-on-board';
  const newReply = 'reply-to-comment';
  const broadcast = 'broadcast';
  const newPostLike = 'board-new-like';

  const handleEvent = (eventData) => {
    const data = JSON.parse(eventData);
    const { type, trigger, location = null } = data;
  
    console.log(`data:`, data);
  
    let notificationMessage = '';
    let notificationType = '';
  
    switch (type) {
      case 'new-follower':
        notificationType = newFollower;
        break;
      case 'following-new-board':
        notificationType = writeNewPost;
        break;
      case 'comment-on-board':
        notificationType = newComment;
        break;
      case 'reply-to-comment':
        notificationType = newReply;
        break;
      case 'broadcast':

        notificationType = broadcast;
        break;
      case 'board-new-like':
        notificationType = newPostLike;
        break;
      default:
        return; // 기본 케이스에서는 아무 작업도 하지 않음
    }
  
    setNotification({
      type: notificationType,
      message: notificationMessage,
      boardTitle: location ? location.boardTitle : null,
      boardId: location ? location.boardId : null,
      commentId: location ? location.commentId : null,
      commentContent: location? location.commentContent : null,
      parentCommentId: location ? location.parentCommentId : null,
      boardWriterNickname:location ? location.boardWriterNickname : null,
      name: trigger.nickname,
      image: trigger.image || mainCharacterImg, // 기본 이미지 경로를 설정할 수 있습니다.
    });
  
    // 알림이 발생했음을 상위 컴포넌트에 알림
    if (onNotification) {
      onNotification(true);
    }
  };
  
  useEffect(() => {
    if (notification) {
      onNotification(true); // 알림이 발생하면 true로 설정
      console.log('SSEComponent notified Dashboard.');
    }
  }, [notification]);
  useEffect(() => {
    try {
      const localNickname = sessionStorage.getItem("nickname");
      if (localNickname) {
        setLocalNickName(localNickname);
      }
    } catch (err) {
      setLocalNickName('');
    }

    const EventSource = EventSourcePolyfill || NativeEventSource;
    const eventSource = new EventSource('https://mk-blogservice.site/api/notifications/stream', {
      headers: {
        Authorization: sessionStorage.getItem('accessToken'),
      },
      withCredentials: true,
    });

    eventSource.onmessage = function (event) {
      try {
        handleEvent(event.data);
      } catch (err) {
        console.error('Error parsing event data:', err);
      }
    };

    eventSource.onerror = function (err) {
      console.error('EventSource failed:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (notification) {
      setImage(notification.image || mainCharacterImg)
      console.log(`
        
        
        notification.image 
        
        
        
        
        `,notification.image )
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // 5초 후에 알림 자동 제거

      return () => clearTimeout(timer);
      
    }
    
  }, [notification]);

  const goToNotificationPost = (name, location, commentID?, replyID?)=>{
    if(commentID && !replyID) navigate(`/${name}/${location}/${commentID}`);
    else if(commentID && replyID) navigate(`/${name}/${location}/${commentID}/${replyID}`);
    else navigate(`/${name}/${location}`);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className={`notification-SSE ${notification ? 'show' : ''}`}>
      {notification && (
        <div className="notification-content-SSE">
          <div className="notification-header-SSE">
            <img
              src={image || mainCharacterImg}
              className="profileImg"
            />
          
          {notification.type === newFollower && ( //새 팔로워
            <span
              className='notification-content-message'
              onClick={() => navigate(`/${notification.name}`)}
            >
              <span className='notification-name'>{notification.name}</span>님이 당신을 팔로우했습니다.
            </span>
          )}
          {( notification.type === newPostLike ) && ( //새 게시글 좋아요
            <span
              className='notification-content-message'
              onClick={()=>{goToNotificationPost(localNickName,notification.boardId)}}
            >
              <span className='notification-name'>{notification.name}</span>님이 당신의 게시글을 좋아합니다:
             <em className='notification-name'>{truncateText(notification.boardTitle || '', 20)}</em>
            </span>
          )}
           {( notification.type === newComment) && ( //내 글에 새 댓글
            <span
              className='notification-content-message'
              onClick={()=>{goToNotificationPost(notification.name,notification.boardId, notification.commentId)}}
            >
              <span className='notification-name'>{notification.name}</span>님이 게시글 "
            <span className='notification-name'>{truncateText(notification.boardTitle || '', 20)}</span>"
            에 댓글을 남겼습니다: 
            <em className='notification-name'>{truncateText(notification.commentContent || '', 20)}</em>
            </span>
          )}
           {( notification.type === newReply) && (// 내 댓글에 새 답글
            <span
              className='notification-content-message'
              onClick={()=>{goToNotificationPost(notification.boardWriterNickname,notification.boardId,notification.parentCommentId, notification.commentId)}}>
           
              <span className='notification-name'>{notification.name}</span>님이 "
            <span style={{fontWeight:'bold', backgroundColor:'transparent'}} className='noti-title'>{truncateText(notification.boardTitle || '', 20)}</span>"
            에 댓글을 남겼습니다: 
            <em className='notification-name'>{truncateText(notification.commentContent || '', 20)}</em>
            </span>
          )}
          {(notification.type === writeNewPost) && ( //내 이웃이 새로 쓴 글
            <span
              className='notification-content-message'
              onClick={()=>{goToNotificationPost(notification.name,notification.boardId)}}
            >
              <span className='notification-name'>{notification.name}</span>님이 새 게시글을 작성했습니다:
              <em className='notification-name'>{truncateText(notification.boardTitle || '', 20)}</em>
            </span>
          )}

          </div>

          <button className="close-btn-SSE" onClick={() =>{setNotification(null); } }>
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default SSEComponent;
