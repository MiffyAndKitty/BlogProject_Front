import React, { useEffect, useState, useRef } from 'react';
import './Notification.css';
import { getNotificationsList } from '../services/getService';
import { useNavigate } from "react-router-dom";
import { deleteNotification } from '../services/deleteService';
import mainCharacterImg from '../img/main_character.png';
import spinner from '../img/Spinner.png';
import noPosts from '../img/noPosts.png';

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
  notification_board:string | null;
  notification_comment:string | null;
  board_writer:string| null,
  parent_comment_id: string | null,


}

const Notification: React.FC<FollowModalProps> = ({ onClose, buttonRef }) => {
  const [modalStyle, setModalStyle] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [localNickName, setLocalNickName] = useState<string>('');
  const navigate = useNavigate();
  const getNotifications = async () => {
    try {
      setLoading(true); 
      const fetchedNotification = await getNotificationsList();
      if (fetchedNotification.result === true) {
        // 최대 5개의 알림만 저장
        setNotifications(fetchedNotification.data.slice(0, 5));
      }
    } catch (error) {
      alert(`알림을 불러오는 중에 오류가 발생했습니다: ${error.response.data.message}`);
      console.error('Error fetching notifications:', error);
    }finally{
      setLoading(false);
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
        alert(`알림을 삭제하는 중에 오류가 발생했습니다: ${error.response.data.message}`);
        console.error('Failed to delete follow:', error);
    }
  };

  const renderNotificationMessage = (notification: NotificationData) => {
    switch (notification.notification_type) {
      case 'new-follower':
        return (
          <span style={{cursor:'pointer'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>
            님이 당신을 팔로우했습니다.
          </span>
        );
      case 'following-new-board':
        return (
          <div className='noti-all' style={{cursor:'pointer'}} 
          onClick={()=>{goToNotificationPost(notification.trigger_nickname,notification.notification_board)}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>
              {notification.trigger_nickname}</strong>
            님이 새 게시글을 작성했습니다:
             <em className='noti-title'>{truncateText(notification.board_title || '', 20)}</em>
          </div>
        );
      case 'comment-on-board':
        return (
          <div className='noti-all' style={{cursor:'pointer'}} 
          onClick={()=>{goToNotificationPost(notification.board_writer,notification.notification_board, notification.notification_comment)}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>
            님이 게시글 "
            <span style={{fontWeight:'bold'}} className='noti-title'>{truncateText(notification.board_title || '', 20)}</span>"
            에 댓글을 남겼습니다: 
            <em className='noti-title'>{truncateText(notification.comment_content || '', 20)}</em>
          </div>
        );
      case 'reply-to-comment':
        return (
          <div className='noti-all' style={{cursor:'pointer'}} 
          onClick={()=>{goToNotificationPost(notification.board_writer,notification.notification_board,notification.parent_comment_id,notification.notification_comment)}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>
               {truncateText(notification.trigger_nickname || '', 20)}</strong>
            님이 게시글 "
            <span style={{fontWeight:'bold'}} className='noti-title'>{truncateText(notification.board_title || '', 20)}</span>"
            에 쓴 당신의 댓글에 답글을 남겼습니다:
            <em className='noti-title'>{truncateText(notification.comment_content || '', 20)}</em>
          </div>
        );
      case 'broadcast':
        return <span>새로운 공지가 있습니다.</span>;
      case 'board-new-like':
        return (
          <div className='noti-all' onClick={()=>{goToNotificationPost(notification.board_writer,notification.notification_board)}} style={{cursor:'pointer'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>
            님이 당신의 게시글을 좋아합니다:
             <em className='noti-title'>{truncateText(notification.board_title || '', 20)}</em>
          </div>
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
    try{
        const localNickname = sessionStorage.getItem("nickname");
        if (localNickname) {
          setLocalNickName(localNickname);
        }
    }catch(err){
       
        setLocalNickName('');
    }
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

  const goToNotificationPost = (name, location, commentID?, replyID?)=>{
    if(commentID && !replyID) navigate(`/${name}/${location}/${commentID}`);
    else if(commentID && replyID) navigate(`/${name}/${location}/${commentID}/${replyID}`);
    else navigate(`/${name}/${location}`);
    onClose();
  }
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
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };
  return (
    <div className="modal-overlay-notification" onClick={onClose}>
      <div
        className="modal-content-notification"
        // style={{ position: 'absolute', ...modalStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="modal-header-notification">

        <div className='title-all'>
          <h3>새소식</h3>
          <span className="allLook" onClick={goToAllNewNotification}>전체보기</span>
        </div>
        <span className="modal-close-notification" onClick={onClose}>
          &times;
        </span>
      </div>
        <hr className="notification-divider" />
        <div className="notification-list">
          {
            loading?(
                <div className="no-posts-message" style={{backgroundColor:'transparent'}}>
                 <div >
                 <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                   <p>로딩중...</p>
                 </div>
               </div>
            ):notifications.length === 0 ?(
                <div className="no-posts-message" style={{backgroundColor:'transparent'}}>
                  <img src={noPosts} alt="No posts" className="no-posts-icon" />
                  <p>알림이 없습니다.</p>
                </div>
            ):(
              <>
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
          </>
            )
          }
         
        </div>
      </div>
    </div>
  );
};

export default Notification;
