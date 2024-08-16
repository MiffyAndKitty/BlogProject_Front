// ConfirmModal.tsx
import React from 'react';
import './FollowDeleteModal.css';

type FollowDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
};

const FollowDeleteModal: React.FC<FollowDeleteModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fd-modal-overlay">
      <div className="fd-modal-content">
        <p>{message}</p>
        <div className="fd-modal-buttons">
          <button style={{cursor:'pointer', color:'#ff4da6'}} onClick={onConfirm}>삭제</button>
          <button style={{cursor:'pointer'}} onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default FollowDeleteModal;
