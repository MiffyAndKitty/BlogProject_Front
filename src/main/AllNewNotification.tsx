import React, { useEffect, useState, useRef } from 'react';
import './Notification.css';
import { getNotificationsList } from '../services/getService';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import SearchBar from '../structure/SearchBar';
import Profile from '../main/Profile';
interface FollowModalProps {

}

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
}

const AllNewNotification: React.FC<FollowModalProps> = () => {
  const [modalStyle, setModalStyle] = useState({});
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null); // 현재 필터 타입
  const [localNickName, setLocalNickName] = useState<string>('');
  const [managementType, setManagementType] = useState<string>('null');

  const getNotifications = async () => {
    try {
      const fetchedNotification = await getNotificationsList();
      if (fetchedNotification.result === true) {
        setNotifications(fetchedNotification.data);
        setFilteredNotifications(fetchedNotification.data); // 처음에는 전체 알림을 보여줌
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    getNotifications();
    try{
        const localNickname = sessionStorage.getItem("nickname");
        if (localNickname) {
          setLocalNickName(localNickname);
        }
    }catch(err){
       
        setLocalNickName('');
    }
  }, []);



  const handleDelete = (index: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
    setFilteredNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  const filterNotifications = (type: string | null) => {
    setFilterType(type);
   
    if (type === null) {
      setManagementType('null');
      setFilteredNotifications(notifications); // 전체 보기
    } else {
        setManagementType(type);
      setFilteredNotifications(notifications.filter(notification => notification.notification_type === type));
    }
  };

  const renderNotificationMessage = (notification: NotificationData) => {
    switch (notification.notification_type) {
      case 'new-follower':
        return (
          <span>
            <strong>{notification.trigger_nickname}</strong>님이 당신을 팔로우했습니다.
          </span>
        );
      case 'following-new-board':
        return (
          <span>
            <strong>{notification.trigger_nickname}</strong>님이 새 게시글을 작성했습니다: <em>{notification.board_title}</em>
          </span>
        );
      case 'board-new-comment':
        return (
          <span>
            <strong>{notification.trigger_nickname}</strong>님이 당신의 게시글에 댓글을 남겼습니다: <em>{notification.comment_content}</em>
          </span>
        );
      case 'comment-reply':
        return (
          <span>
            <strong>{notification.trigger_nickname}</strong>님이 당신의 댓글에 답글을 남겼습니다: <em>{notification.comment_content}</em>
          </span>
        );
      case 'broadcast':
        return <span>새로운 공지가 있습니다.</span>;
      case 'board-new-like':
        return (
          <span>
            <strong>{notification.trigger_nickname}</strong>님이 당신의 게시글을 좋아합니다.
          </span>
        );
      default:
        return <span>새로운 알림이 있습니다.</span>;
    }
  };

  return (
    <>
    <Header pageType="otherblog" />
    <main>
      <div className="main-container">

     <Profile pageType="login" nicknameParam={localNickName}/>
        <div className="container">

        <h2>새소식</h2>

        {/* 필터 버튼 */}
        <div className="filter-buttons">
          <button className={`tab-button ${managementType === 'null' ? 'active' : ''}`} onClick={() => filterNotifications(null)}>전체 보기</button>
          <button className={`tab-button ${managementType === 'new-follower' ? 'active' : ''}`} onClick={() => filterNotifications('new-follower')}>새 팔로워</button>
          <button className={`tab-button ${managementType ==='following-new-board' ? 'active' : ''}`} onClick={() => filterNotifications('following-new-board')}>새 게시글</button>
          <button className={`tab-button ${managementType === 'board-new-comment' ? 'active' : ''}`} onClick={() => filterNotifications('board-new-comment')}>새 댓글</button>
          <button className={`tab-button ${managementType === 'comment-reply' ? 'active' : ''}`} onClick={() => filterNotifications('comment-reply')}>답글</button>
          <button className={`tab-button ${managementType === 'board-new-like' ? 'active' : ''}`} onClick={() => filterNotifications('board-new-like')}>좋아요</button>
          <button className={`tab-button ${managementType === 'broadcast' ? 'active' : ''}`} onClick={() => filterNotifications('broadcast')}>공지사항</button>
        </div>

        <div className="notification-list">
          {filteredNotifications.map((notification, index) => (
            <div key={notification.notification_id} className="notification-item">
              <div className="notification-content">
                <img
                  src={notification.trigger_image}
                  alt={`${notification.trigger_nickname} profile`}
                  className="notification-trigger-image"
                />
                <div className="notification-details">
                  {renderNotificationMessage(notification)}
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                className="delete-notification-button"
                onClick={() => handleDelete(index)}
              >
                &times;
              </button>
            </div>
          ))}
          </div>
        </div>
        </div>
      </main>
      <Footer />
      </>
  );
};

export default AllNewNotification;
