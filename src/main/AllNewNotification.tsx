import React, { useEffect, useState, useRef } from 'react';
import './AllNewNotification.css';
import { getNotificationsList } from '../services/getService';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import { useNavigate } from "react-router-dom";
import SearchBar from '../structure/SearchBar';
import { deleteNotification } from '../services/deleteService';
import Profile from '../main/Profile';
import filledCarrot from '../img/filledCarrot.png';
import mainCharacterImg from '../img/main_character.png';
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

  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [isBefore, setIsBefore] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null); // 현재 필터 타입
  const [localNickName, setLocalNickName] = useState<string>('');
  const [managementType, setManagementType] = useState<string>('null');
  const navigate = useNavigate();
  const getNotifications = async (pageSize?:number, cursor?:string) => {
    try {
      const fetchedNotification = await getNotificationsList(pageSize,cursor,isBefore);
      if (fetchedNotification.result === true) {
        setNotifications(fetchedNotification.data);
        setFilteredNotifications(fetchedNotification.data); // 처음에는 전체 알림을 보여줌
        setTotalPages(fetchedNotification.total.totalPageCount || 1); // 수정된 부분
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


  const deleteNotifications = async (notificationId: string) => {
    try {
        if (notificationId) {
            const fetchedFollowers = await deleteNotification(notificationId);
            if (fetchedFollowers) {
                // alert('팔로워를 취소했습니다!');
            
                getNotifications(10, cursor);
            } else {
                // alert('팔로워 취소에 실패했습니다! 다시 시도해주세요.');
            }
        }
    } catch (error) {
        console.error('Failed to delete follow:', error);
    }
  };
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
    setCurrentPage(1);
    setCursor('');
    setIsBefore(false);
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
          <span style={{backgroundColor:'#00000000'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 당신을 팔로우했습니다.
          </span>
        );
      case 'following-new-board':
        return (
          <span style={{backgroundColor:'#00000000'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 새 게시글을 작성했습니다: <em>{notification.board_title}</em>
          </span>
        );
      case 'board-new-comment':
        return (
          <span style={{backgroundColor:'#00000000'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 당신의 게시글에 댓글을 남겼습니다: <em>{notification.comment_content}</em>
          </span>
        );
      case 'comment-reply':
        return (
          <span style={{backgroundColor:'#00000000'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 당신의 댓글에 답글을 남겼습니다: <em>{notification.comment_content}</em>
          </span>
        );
      case 'broadcast':
        return <span style={{backgroundColor:'#00000000'}}>새로운 공지가 있습니다.</span>;
      case 'board-new-like':
        return (
          <span style={{backgroundColor:'#00000000'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>님이 당신의 게시글을 좋아합니다.
          </span>
        );
      default:
        return <span style={{backgroundColor:'#00000000'}}>새로운 알림이 있습니다.</span>;
    }
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
  useEffect(() => {
    getNotifications(10,cursor);
  }, [currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCursor(filteredNotifications[0].notification_id);
      setIsBefore(true);
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCursor(filteredNotifications[filteredNotifications.length - 1].notification_id); 
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
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
          <button className={`tab-button ${managementType === 'board-new-like' ? 'active' : ''}`} onClick={() => filterNotifications('board-new-like')}>
            <img style={{width:'15px', height:'auto'}} src={filledCarrot}></img>
          </button>
          <button className={`tab-button ${managementType === 'broadcast' ? 'active' : ''}`} onClick={() => filterNotifications('broadcast')}>공지사항</button>
        </div>

        <div className="notification-list border">
          {filteredNotifications.map((notification, index) => (
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
      </main>
      <Footer />
      </>
  );
};

export default AllNewNotification;
