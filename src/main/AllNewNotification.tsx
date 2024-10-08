import React, { useEffect, useState } from 'react';
import './AllNewNotification.css';
import { getNotificationsList } from '../services/getService';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import { useNavigate } from "react-router-dom";
import Profile from '../main/Profile';
import filledCarrot from '../img/filledCarrot.png';
import mainCharacterImg from '../img/main_character.png';
import spinner from '../img/Spinner.png';
import noPosts from '../img/noPosts.png';
import SSEComponent from './SSEComponent';
import { deleteNotification } from '../services/deleteService';
import previous from '../img/previous.png';
import next from '../img/next.png';
import fastPrevious from '../img/fast_previous.png';
import fastNext from '../img/fast_next.png';

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

const AllNewNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>('');
  const [localNickName, setLocalNickName] = useState<string>('');
  const navigate = useNavigate();
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const localNickname = sessionStorage.getItem("nickname");
    if (localNickname) {
      setLocalNickName(localNickname);
    }
    fetchNotifications();
  }, []);
 
  useEffect(() => {
    fetchNotifications(filterType);
  }, [currentPage,filterType, isBefore]); // isBefore 추가
  
  const fetchNotifications = async (type: string | null = filterType, pageSize: number = 10) => {
    try {
      setLoading(true); 

      const fetchedNotification = await getNotificationsList(type, pageSize, cursor, isBefore,page);
      if (fetchedNotification.result) {
        setNotifications(fetchedNotification.data||[]);
        if(fetchedNotification.total.totalPageCount ===0) setTotalPages(1);
        else setTotalPages(fetchedNotification.total.totalPageCount);

      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if(error.response){
        alert(`알림 조회에 실패했습니다: ${error.response.data.message}`);
        navigate(-1);
      } 

    }finally{
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      if (notificationId) {
        const result = await deleteNotification(notificationId);
        //setCursor('');
        
        fetchNotifications(filterType);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      if (error.response) alert(`알림 삭제에 실패했습니다: ${error.response.data.message}`);
    }
  };
  

  const handleFilterChange = (type: string | null) => {
    setFilterType(type);
    setCurrentPage(1);
    setCursor('');
    setPage(0);

  };
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };
  const goToNotificationPost = (name, location, commentID?, replyID?)=>{
    if(commentID && !replyID) navigate(`/${name}/${location}/${commentID}`);
    else if(commentID && replyID) navigate(`/${name}/${location}/${commentID}/${replyID}`);
    else navigate(`/${name}/${location}`);
  };
  const renderNotificationMessage = (notification: NotificationData) => {
    switch (notification.notification_type) {
      case 'new-follower':
        return (
          <span style={{cursor:'pointer', backgroundColor:'transparent'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>
            님이 당신을 팔로우했습니다.
          </span>
        );
      case 'following-new-board':
        return (
          <div className='noti-all' style={{cursor:'pointer', backgroundColor:'transparent'}} 
          onClick={()=>{goToNotificationPost(notification.trigger_nickname,notification.notification_board)}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>
              {notification.trigger_nickname}</strong>
            님이 새 게시글을 작성했습니다:
             <em className='noti-title'>{truncateText(notification.board_title || '', 20)}</em>
          </div>
        );
      case 'comment-on-board':
        return (
          <div className='noti-all' style={{cursor:'pointer', backgroundColor:'transparent'}} 
          onClick={()=>{goToNotificationPost(notification.board_writer,notification.notification_board, notification.notification_comment)}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>
            님이 게시글 "
            <span style={{fontWeight:'bold', backgroundColor:'transparent'}} className='noti-title'>{truncateText(notification.board_title || '', 20)}</span>"
            에 댓글을 남겼습니다: 
            <em className='noti-title'>{truncateText(notification.comment_content || '', 20)}</em>
          </div>
        );
      case 'reply-to-comment':
        return (
          <div className='noti-all' style={{cursor:'pointer', backgroundColor:'transparent'}} 
          onClick={()=>{goToNotificationPost(notification.board_writer,notification.notification_board,notification.parent_comment_id,notification.notification_comment)}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>
               {truncateText(notification.trigger_nickname || '', 20)}</strong>
            님이 게시글 "
            <span style={{fontWeight:'bold', backgroundColor:'transparent'}} className='noti-title'>{truncateText(notification.board_title || '', 20)}</span>"
            에 쓴 당신의 댓글에 답글을 남겼습니다:
            <em className='noti-title'>{truncateText(notification.comment_content || '', 20)}</em>
          </div>
        );
      case 'broadcast':
        return <span>새로운 공지가 있습니다.</span>;
      case 'board-new-like':
        return (
          <div className='noti-all' onClick={()=>{goToNotificationPost(notification.board_writer,notification.notification_board)}} style={{cursor:'pointer', backgroundColor:'transparent'}}>
            <strong className='notification-name' onClick={()=>{navigate(`/${notification.trigger_nickname}`)}}>{notification.trigger_nickname}</strong>
            님이 당신의 게시글을 좋아합니다:
             <em className='noti-title'>{truncateText(notification.board_title || '', 20)}</em>
          </div>
        );
      default:
        return <span>새로운 알림이 있습니다.</span>;
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
  const goToFirstPage = () =>{
    setPage(Math.abs(currentPage - 1));
    setCursor(notifications[0].notification_id);
    setIsBefore(true);
    setCurrentPage(1);
    //fetchPosts(undefined,null, search, sort);  // 게시글 가져오기 함수 호출
  };
  const goToLastPage = () =>{

    setCursor(notifications[notifications.length - 1].notification_id);
    setPage(totalPages-currentPage);
    setCurrentPage(totalPages);
    setIsBefore(false);
    //fetchPosts(cursor,null,searchTerm,sortOption);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCursor(notifications[0].notification_id);
      setPage(1);
      setIsBefore(true);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCursor(notifications[notifications.length - 1].notification_id);
      setPage(1);
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page:number)=>{
    if(currentPage - page >0){
      setCursor(notifications[0].notification_id);
      setIsBefore(true);
    }else{
      setCursor(notifications[notifications.length - 1].notification_id);
      setIsBefore(false);
    }
    setPage(Math.abs(currentPage - page));
    setCurrentPage(page);
  };
   // renderPages 함수 수정: 현재 페이지를 중심으로 5개의 페이지를 반환
   const renderPages = (currentPage: number, totalPages: number) => {
    let pages = [];
    const maxVisiblePages = 5; // 최대 표시할 페이지 수

    // 현재 페이지를 중심으로 시작 페이지와 끝 페이지를 계산
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
  
    // 끝 페이지가 전체 페이지보다 큰 경우 시작 페이지 조정
    if (endPage === totalPages && endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
  
    // 페이지 목록 생성
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };
  const handleNotification = (isNotified: boolean) => {
    setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
  };
  return (
    <div className="App">
      <Header pageType="otherblog" hasNotifications ={hasNotifications}/>
      <main className="blog-main-container">
 
          <Profile pageType="profileSetting" nicknameParam={localNickName} />
          <section className="main-blog-posts-section">
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
            <hr className="notification-divider" />
            <div className="notification-list border">
              {loading?(
                 <div className="no-posts-message">
                 <div >
                 <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                   <p>로딩중...</p>
                 </div>
               </div>
              ):notifications.length === 0 ?(
                <div className="no-posts-message">
                  <img src={noPosts} alt="No posts" className="no-posts-icon" />
                  <p>알림이 없습니다.</p>
                </div>
              ):(
                <>
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
                </>
              )}
             
            </div>
            <div className="pagination">

              <button className="pagination-btn" onClick={goToFirstPage} disabled={currentPage === 1}>
                <img src={fastPrevious} style={{width:'20px', height:'20px'}}/>
              </button>

              <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                <img src={previous} style={{width:'20px', height:'20px'}}/>
              </button>


               {renderPages(currentPage, totalPages).map(page => (
              <button
                key={page}
                className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
              ))}

              <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                <img src={next} style={{width:'20px', height:'20px'}}/>
              </button>

              <button className="pagination-btn" onClick={goToLastPage} disabled={currentPage === totalPages}>
                <img src={fastNext} style={{width:'20px', height:'20px'}}/>
              </button>

            </div>
          </section>

        <SSEComponent onNotification={handleNotification}/>
      </main>
      <Footer />
    </div>
  );
};

export default AllNewNotification;
