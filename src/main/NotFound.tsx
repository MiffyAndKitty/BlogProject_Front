// NotFound.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css'; // 스타일을 위한 css 파일 (선택)

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/'); // 홈으로 이동
  };

  return (
    <div className="not-found-container">
      <h1>404 - 페이지를 찾을 수 없습니다.</h1>
      <p>요청하신 페이지는 존재하지 않거나 삭제되었습니다.</p>
      <button onClick={goHome} className="go-home-button">홈으로 돌아가기</button>
    </div>
  );
};

export default NotFound;
