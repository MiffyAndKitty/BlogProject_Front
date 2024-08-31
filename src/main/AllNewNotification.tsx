import React, { useEffect, useState } from 'react';
import './AllNewNotification.css';
import { getNotificationsList } from '../services/getService';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import { useNavigate } from "react-router-dom";
import Profile from '../main/Profile';
import filledCarrot from '../img/filledCarrot.png';
import mainCharacterImg from '../img/main_character.png';
import SSEComponent from './SSEComponent';
import { deleteNotification } from '../services/deleteService';

interface NotificationData {
  notification_id: string;
  notification_type: string;
  notification_read: number;
  created_at: string;
  notification_trigger: string;
  trigger_nickname: string;
  trigger_email: string;
  trigger_image: string;
  board_title: string | null;
  comment_content: string | null;
  notification_board: string | null;
  notification_comment: string | null;
}

const AllNewNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>('');
  const [localNickName, setLocalNickName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const localNickname = sessionStorage.getItem("nickname");
    if (localNickname) {
      setLocalNickName(localNickname);
    }
    fetchNotifications();
  }, []);
 
  useEffect(() => {
    fetchNotifications(filterType);
  }, [currentPage, filterType, isBefore]); // isBefore 추가
  
  const fetchNotifications = async (type: string | null = filterType, pageSize: number = 10) => {
    try {
      console.log('Fetching notifications with isBefore:', isBefore); // 디버깅 로그
      const fetchedNotification = await getNotificationsList(type, pageSize, cursor, isBefore);
      if (fetchedNotification.result) {
        setNotifications(fetchedNotification.data);
        if(fetchedNotification.total.totalPageCount ===0) setTotalPages(1);
        else setTotalPages(fetchedNotification.total.totalPageCount);
        if (currentPage === 1 || currentPage === totalPages) { // 수정된 부분
          setCursor(fetchedNotification.data[fetchedNotification.data.length - 1].notification_id);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleFilterChange = (type: string | null) => {
    setFilterType(type);
    setCurrentPage(1);
    setCursor('');
    fetchNotifications(type, 10);
  };

  const renderNotificationMessage = (notification: NotificationData) => {
    const navigateToPost = () => navigate(`/${notification.trigger_nickname}/${notification.notification_board}`);
    const navigateToProfile = () => navigate(`/${notification.trigger_nickname}`);

    switch (notification.notification_type) {
      case 'new-follower':
        return <span  style={{cursor:'pointer', backgroundColor:'transparent'}} onClick={navigateToProfile}><strong>{notification.trigger_nickname}</strong>님이 당신을 팔로우했습니다.</span>;
      case 'following-new-board':
        return <span   style={{cursor:'pointer', backgroundColor:'transparent'}} onClick={navigateToPost}><strong>{notification.trigger_nickname}</strong>님이 새 게시글을 작성했습니다: <em>{notification.board_title}</em></span>;
      case 'comment-on-board':
        return <span  style={{cursor:'pointer', backgroundColor:'transparent'}} onClick={navigateToPost}><strong>{notification.trigger_nickname}</strong>님이 게시글 "<strong>{notification.board_title}</strong>"에 댓글을 남겼습니다: <em>{notification.comment_content}</em></span>;
      case 'reply-to-comment':
        return <span  style={{cursor:'pointer', backgroundColor:'transparent'}} onClick={navigateToPost}><strong>{notification.trigger_nickname}</strong>님이 당신의 댓글에 답글을 남겼습니다: <em>{notification.comment_content}</em></span>;
      case 'broadcast':
        return <span style={{cursor:'pointer', backgroundColor:'transparent'}} >새로운 공지가 있습니다.</span>;
      case 'board-new-like':
        return <span  style={{cursor:'pointer', backgroundColor:'transparent'}} onClick={navigateToPost}><strong>{notification.trigger_nickname}</strong>님이 당신의 게시글을 좋아합니다: <em>{notification.board_title}</em></span>;
      default:
        return <span style={{cursor:'pointer', backgroundColor:'transparent'}} >새로운 알림이 있습니다.</span>;
    }
  };

  const formatDate = (dateString: string): string => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - inputDate.getTime();

    if (timeDifference < 60000) {
      return `${Math.floor(timeDifference / 1000)}초 전`;
    } else if (timeDifference < 3600000) {
      return `${Math.floor(timeDifference / 60000)}분 전`;
    } else if (timeDifference < 86400000) {
      return `${Math.floor(timeDifference / 3600000)}시간 전`;
    } else if (timeDifference < 604800000) {
      return `${Math.floor(timeDifference / 86400000)}일 전`;
    } else {
      const formattedDate = inputDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      return formattedDate;
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {

      setCursor(notifications[0].notification_id);
      setCurrentPage(prevPage => prevPage - 1);
      setIsBefore(true);
      console.log(`
        
        
        
        handlePreviousPage
        setCursor
        
        
        
        
        
        
        
        `,notifications[0].notification_id)
    
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
      setIsBefore(false);
      console.log(`
        
        
        
        handleNextPage
        setCursor
        
        
      
        
        
        
        
        `,notifications[notifications.length - 1].notification_id)
      setCursor(notifications[notifications.length - 1].notification_id);
    }
  };

  return (
    <>
      <Header pageType="otherblog" />
      <main>
        <div className="main-container">
          <Profile pageType="profileSetting" nicknameParam={localNickName} />
          <div className="container">
            <h2>새소식</h2>
            <div className="filter-buttons">
              <button className={`tab-button ${filterType === null ? 'active' : ''}`} onClick={() => handleFilterChange(null)}>전체 보기</button>
              <button className={`tab-button ${filterType === 'new-follower' ? 'active' : ''}`} onClick={() => handleFilterChange('new-follower')}>새 팔로워</button>
              <button className={`tab-button ${filterType === 'following-new-board' ? 'active' : ''}`} onClick={() => handleFilterChange('following-new-board')}>새 게시글</button>
              <button className={`tab-button ${filterType === 'comment-on-board' ? 'active' : ''}`} onClick={() => handleFilterChange('comment-on-board')}>새 댓글</button>
              <button className={`tab-button ${filterType === 'reply-to-comment' ? 'active' : ''}`} onClick={() => handleFilterChange('reply-to-comment')}>답글</button>
              <button className={`tab-button ${filterType === 'board-new-like' ? 'active' : ''}`} onClick={() => handleFilterChange('board-new-like')}>
                <img style={{ width: '15px', height: 'auto' }} src={filledCarrot} alt="like" />
              </button>
              <button className={`tab-button ${filterType === 'broadcast' ? 'active' : ''}`} onClick={() => handleFilterChange('broadcast')}>공지사항</button>
            </div>
            <div className="notification-list border">
              {notifications.map((notification) => (
                <div key={notification.notification_id} className="notification-item">
                  <div className="notification-content">
                    <img
                      src={notification.trigger_image || mainCharacterImg}
                      alt={`${notification.trigger_nickname} profile`}
                      className="notification-trigger-image"
                    />
                    <div className="notification-details">
                      {renderNotificationMessage(notification)}
                      <span className="notification-time">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="delete-notification-button"
                    onClick={() => handleDeleteNotification(notification.notification_id)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>이전</button>
              <span className="pagination-info">{currentPage} / {totalPages}</span>
              <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>다음</button>
            </div>
          </div>
        </div>
        <SSEComponent />
      </main>
      <Footer />
    </>
  );
};

export default AllNewNotification;
