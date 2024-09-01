import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';
import './SSEComponent.css'; // 스타일링을 위한 CSS 파일

function SSEComponent() {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [localNickName, setLocalNickName] = useState<string>('');

  const newFollower = 'new-follower';
  const writeNewPost = 'following-new-board';
  const newComment = 'comment-on-board';
  const newReply = 'reply-to-comment';
  const broadcast = 'broadcast';
  const newPostLike = 'board-new-like';

  const handleEvent = (eventData) => {
    const data = JSON.parse(eventData);
    const { type, trigger, location } = data;
    console.log(`
      
      
      data
      
      
      `,data )
    let notificationMessage = '';
    let notificationType = '';

    switch (type) {
      case 'new-follower':
        notificationMessage = `${trigger.nickname}님이 당신을 팔로우했습니다.`;
        notificationType = newFollower;
        break;
      case 'following-new-board':
        notificationMessage = ` 새 게시글을 작성했습니다: ${location.boardTitle}`;
        notificationType = writeNewPost;
        break;
      case 'comment-on-board':
        notificationMessage = ` 게시글 "${location.boardTitle}"에 댓글을 남겼습니다: ${location.commentContent}`;
        notificationType = newComment;
        break;
      case 'reply-to-comment':
        notificationMessage = ` 당신의 댓글에 대댓글을 달았습니다: ${location.commentContent}`;
        notificationType = newReply;
        break;
      case 'broadcast':
        notificationMessage = `새로운 공지사항이 있습니다.`;
        notificationType = broadcast;
        break;
      case 'board-new-like':
        notificationMessage = ` 당신의 게시글을 좋아합니다: ${location.boardTitle}`;
        notificationType = newPostLike;
        break;
      default:
        return; // 기본 케이스에서는 아무 작업도 하지 않음;
    }

    setNotification({
      type: notificationType,
      message: notificationMessage,
      boardTitle: location.boardTitle,
      boardId: location.boardId,
      commentId: location.commentId,
      name: trigger.nickname,
      image: trigger.image || '/path/to/default/profile.png' // 기본 이미지 경로를 설정할 수 있습니다.
    });
  };

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
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // 5초 후에 알림 자동 제거

      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className={`notification-SSE ${notification ? 'show' : ''}`}>
      {notification && (
        <div className="notification-content-SSE">
          <div className="notification-header-SSE">
            <img
              src={notification.image}
              alt={`${notification.name}의 프로필`}
              className="profileImg"
            />
          
          {notification.type === newFollower && (
            <span
              style={{ color: 'white', backgroundColor: 'transparent', cursor: 'pointer' }}
              onClick={() => navigate(`/${notification.name}`)}
            >
              <span style={{ color: '#FF6DC6',backgroundColor: 'transparent', fontWeight:'bold'}}>{notification.name}</span>님이 당신을 팔로우했습니다.
            </span>
          )}
          {( notification.type === newPostLike || notification.type === newComment||notification.type === newReply) && (
            <span
              style={{ color: 'white', backgroundColor: 'transparent', cursor: 'pointer' }}
              onClick={() => navigate(`/${localNickName}/${notification.location}`)}
            >
              <span style={{ color: '#FF6DC6' ,backgroundColor: 'transparent', fontWeight:'bold'}}>{notification.name}</span>님이 {notification.message}
            </span>
          )}
          {(notification.type === writeNewPost) && (
            <span
              style={{ color: 'white', backgroundColor: 'transparent', cursor: 'pointer' }}
              onClick={() => navigate(`/${localNickName}/${notification.location}`)}
            >
              <span style={{ color: '#FF6DC6' ,backgroundColor: 'transparent', fontWeight:'bold'}}>{notification.name}</span>님이 {notification.message}
            </span>
          )}

          </div>

          <button className="close-btn-SSE" onClick={() => setNotification(null)}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default SSEComponent;
