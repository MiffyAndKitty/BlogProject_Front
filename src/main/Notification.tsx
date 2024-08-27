import React, { useEffect, useState, useRef } from 'react';
import './Notification.css';
import { getNotificationsList } from '../services/getService';
import { useNavigate } from "react-router-dom";
import { deleteNotification } from '../services/deleteService';
import mainCharacterImg from '../img/main_character.png';
interface FollowModalProps {
  onClose: () => void;
  buttonRef: React.RefObject<HTMLDivElement>; // 버튼 위치 참조
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

const Notification: React.FC<FollowModalProps> = ({ onClose, buttonRef }) => {
  const [modalStyle, setModalStyle] = useState({});
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const navigate = useNavigate();
  const getNotifications = async () => {
    try {
      const fetchedNotification = await getNotificationsList();
      if (fetchedNotification.result === true) {
        // 최대 5개의 알림만 저장
        setNotifications(fetchedNotification.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const deleteNotifications = async (notificationId: string) => {
    try {
        if (notificationId) {
            const fetchedFollowers = await deleteNotification(notificationId);
            if (fetchedFollowers) {
                // alert('팔로워를 취소했습니다!');
            
                getNotifications();
            } else {
                // alert('팔로워 취소에 실패했습니다! 다시 시도해주세요.');
            }
        }
    } catch (error) {
        console.error('Failed to delete follow:', error);
    }
  };

  const renderNotificationMessage = (notification: NotificationData) => {
    switch (notification.notification_type) {
      case 'new-follower':
        return (
          <span >
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 당신을 팔로우했습니다.
          </span>
        );
      case 'following-new-board':
        return (
          <span >
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 새 게시글을 작성했습니다: <em>{notification.board_title}</em>
          </span>
        );
      case 'board-new-comment':
        return (
          <span>ㄱ
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 당신의 게시글에 댓글을 남겼습니다: <em>{notification.comment_content}</em>
          </span>
        );
      case 'comment-reply':
        return (
          <span>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}> {notification.trigger_nickname}</strong>님이 당신의 댓글에 답글을 남겼습니다: <em>{notification.comment_content}</em>
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
  const goToAllNewNotification = () =>{
      navigate('/dashboard/all-new-notification');
  };

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalStyle({
        top: rect.bottom + window.scrollY, // 버튼 아래에 위치
        left: rect.left + window.scrollX - 600, // 버튼의 좌측 정렬
      });
    }
  }, [buttonRef]);

  const handleDelete = (index: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );

  };
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
  return (
    <div className="modal-overlay-notification" onClick={onClose}>
      <div
        className="modal-content-notification"
        style={{ position: 'absolute', ...modalStyle }} // 위치 스타일 적용
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="modal-header-notification">
        <h3 >새소식</h3>
        <span className="allLook" onClick={goToAllNewNotification}>전체보기</span>
        <span className="modal-close-notification" onClick={onClose}>
          &times;
        </span>
      </div>
        <hr className="notification-divider" />
        <div className="notification-list">
          {notifications.map((notification, index) => (
            <div key={notification.notification_id} className="notification-item">
              <div className="notification-content">
                <img
                  src={notification.trigger_image? notification.trigger_image : mainCharacterImg}
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
                onClick={() => deleteNotifications(notification.notification_id)}
              >
                &times;
              </button>
              {/* {index < notifications.length - 1 && (
                <hr className="notification-divider" />
              )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
