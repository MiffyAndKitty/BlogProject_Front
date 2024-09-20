import React, { useState, useEffect } from 'react';
import './TempSaveNoti.css'; // 스타일링을 위한 CSS 파일


function TempSaveNoti({openModal}) {
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    setNotification(openModal);
    console.log(`
        
        
        
        
        TempSaveNoti
        
        
        
        
        
        
        
        `,openModal,notification)
  }, [openModal]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(false);
      }, 3000); // 3초 후에 알림 자동 제거
      return () => clearTimeout(timer);     
    }
    
  }, [notification]);


  return (
    <div className={`notification-SSE ${notification ? 'show' : ''}`}>
      {notification && (
        <div className="notification-content-SSE">
          <div className="notification-header-SSE">

          <span
              className='notification-content-message'
            >
              작성 중인 글이 저장되었습니다.
            </span>

          </div>

          <button className="close-btn-SSE" onClick={() =>{setNotification(false); } }>
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default TempSaveNoti;
