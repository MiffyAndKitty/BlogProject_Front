import React, { useEffect, useState, useRef } from 'react';
import './TempPostList.css';
import { getTempPostList } from '../../services/getService';

import { useNavigate } from "react-router-dom";
import { deleteTempPost } from '../../services/deleteService';
import mainCharacterImg from '../../img/main_character.png';
import spinner from '../../img/Spinner.png';
import noPosts from '../../img/noPosts.png';

interface TempPostListProps {
  onClose: () => void;
  buttonRef: React.RefObject<HTMLDivElement>; // 버튼 위치 참조
  onGetDraftId: any;
  onSendTotalCount:any;
}


const TempPostList: React.FC<TempPostListProps> = ({ onClose, buttonRef ,onGetDraftId, onSendTotalCount}) => {
  const [modalStyle, setModalStyle] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [tempPosts, setTempPosts] = useState([]);
  const [localNickName, setLocalNickName] = useState<string>('');
  const [tempPostsTotalCount,setTempPostsTotalCount] = useState(0);
  const [deleteTempPostId,setDeleteTempPostId] = useState('');
  const navigate = useNavigate();
 
  useEffect(()=>{
    if(deleteTempPostId){
      const userConfirmed = window.confirm(`
        정말 삭제하시겠습니까?
        `);

    if (userConfirmed) {
        // 사용자가 확인을 눌렀을 때 실행할 코드
        deleteTempPosts(deleteTempPostId)
        setDeleteTempPostId('');

        
    }
  }
  },[deleteTempPostId])

  const getTempPosts = async () => {
    try {
      setLoading(true); 
      const fetchedTempPostList = await getTempPostList();
      console.log(`
        
        
        
        
        fetchedTempPostList
        
        
        
        
        `,fetchedTempPostList)
      if (fetchedTempPostList) {
        // 최대 5개의 알림만 저장
        setTempPosts(fetchedTempPostList.data.data.list);
        setTempPostsTotalCount(fetchedTempPostList.data.data.totalCount);
        onSendTotalCount(fetchedTempPostList.data.data.totalCount);
      }
    } catch (error) {
      if(error.response && error.response.status!==404) alert(`임시 저장 게시글 목록을 불러오는 중에 오류가 발생했습니다: ${error.response.data.message}`);
      console.error('임시 저장 게시글 목록을 불러오는 중에 오류가 발생했습니다:', error);
    }finally{
      setLoading(false);
    }
  };

  const deleteTempPosts = async (tempPostID: string) => {
    try {
        if (tempPostID) {
            const fetchedDeleteTempPost = await deleteTempPost(tempPostID);
            if (fetchedDeleteTempPost) {
                // alert('팔로워를 취소했습니다!');
                getTempPosts();
            }
        }
    } catch (error) {
      getTempPosts();
      if(error.response) alert(`임시저장된 게시글을 삭제하는 중에 오류가 발생했습니다: ${error.response.data.message}`);
        console.error('임시저장된 게시글을 삭제하는 중에 오류가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    getTempPosts();
    try{
        const localNickname = sessionStorage.getItem("nickname");
        if (localNickname) {
          setLocalNickName(localNickname);
        }
    }catch(err){
       
        setLocalNickName('');
    }
    getTempPosts();
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
    setTempPosts((prevNotifications) =>
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
    // const adjustedCurrentDate = new Date(currentDate.getTime() + 9 * 60 * 60 * 1000);
  
    // 두 날짜의 차이를 밀리초로 계산
    const timeDifference = currentDate.getTime() - inputDate.getTime();
  
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
  const handleClickedContent = (id:string)=>{
    const userConfirmed = window.confirm(`
     해당 글을 불러오면 작성 중인 글이 사라집니다.
     불러오시겠습니까?
      `);

  if (userConfirmed) {
      onGetDraftId(id);
      onClose();
  } 
    
  };
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };
  return (
    <div className="modal-overlay-tempsave" onClick={onClose}>
      <div
        className="modal-content-tempsave"
        // style={{ position: 'absolute', ...modalStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="modal-header-tempsave">

        <div className='title-all'>
          <h3>임시저장<span style={{ marginLeft: '10px', color: '#FF88D7', backgroundColor:'transparent' }}>{tempPostsTotalCount}</span></h3>
        </div>
        <span className="modal-close-tempsave" onClick={onClose}>
          &times;
        </span>
      </div>
        <hr className="tempPost-divider" />
        <div className="tempPost-list">
          {
            loading?(
                <div className="no-posts-message" style={{backgroundColor:'transparent'}}>
                 <div >
                 <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                   <p>로딩중...</p>
                 </div>
               </div>
            ):tempPosts === null ?(
                <div className="no-posts-message" style={{backgroundColor:'transparent'}}>
                  <img src={noPosts} alt="No posts" className="no-posts-icon" />
                  <p>임시저장된 게시글이 없습니다.</p>
                </div>
            ):(
              <>
               {tempPosts.map((tempPost, index) => (
            <div key={tempPost._id} className="tempPost-item" > 
              <div className="tempPost-content" style={{cursor:'pointer'}} onClick={()=>{handleClickedContent(tempPost._id)}}>
               
                <div className="tempPost-details">
                 {/**임시저장 게시글 목록 불러오기 */}

                <div className='tempPost-title-content'>
                    <span className="tempPost-time">
                        {formatDate(tempPost.updatedAt)}
                    </span>
                    <span className='tempPost-title'>{truncateText(tempPost.title,5)}</span>
                    <p className='tempPost-contents'>{truncateText(tempPost.content, 100)}</p> {/* 텍스트 잘라서 표시 */}
                </div>
                 

                 

                 

                </div>
              </div>
              <button
                className="delete-tempPost-button"
                 onClick={()=>{setDeleteTempPostId(tempPost._id)}}  
              >
                &times;
              </button>
              {/* {index < tempPosts.length - 1 && (
                <hr className="tempPost-divider" />
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

export default TempPostList;
