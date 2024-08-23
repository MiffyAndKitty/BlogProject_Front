import React, { useEffect, useState, useRef } from 'react';
import './Notification.css';

interface FollowModalProps {
  onClose: () => void;
  buttonRef: React.RefObject<HTMLDivElement>; // 버튼 위치 참조
}

const Notification: React.FC<FollowModalProps> = ({ onClose, buttonRef }) => {
  const [modalStyle, setModalStyle] = useState({});
  const [notifications, setNotifications] = useState<string[]>([
    "새 소식 1",
    "새 소식 2",
    "새 소식 3",
    "새 소식 4",
    "새 소식 5"
  ]);

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalStyle({
        top: rect.bottom + window.scrollY,  // 버튼 아래에 위치
        left: rect.left + window.scrollX - 600,  // 버튼의 좌측 정렬
      });
    }
  }, [buttonRef]);

  const handleDelete = (index: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="modal-overlay-notification" onClick={onClose}>
      <div
        className="modal-content-notification"
        style={{ position: 'absolute', ...modalStyle }} // 위치 스타일 적용
        onClick={(e) => e.stopPropagation()}
      >
        <span className="modal-close-notification" onClick={onClose}>&times;</span>
        <h3>새소식</h3>
        <hr className="notification-divider" />
        <div className="notification-list">
          {notifications.map((notification, index) => (
            <div key={index} className="notification-item">
              <span>{notification}</span>
              <button
                className="delete-notification-button"
                onClick={() => handleDelete(index)}
              >
                &times;
              </button>
              {index < notifications.length - 1 && (
                <hr className="notification-divider" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
