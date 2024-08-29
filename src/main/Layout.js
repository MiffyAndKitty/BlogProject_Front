// Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import SSEComponent from './SSEComponent';

const Layout = () => {
  return (
    <>
      <SSEComponent />  {/* 모든 페이지에 알림창 표시 */}
      <Outlet />  {/* 각 페이지의 콘텐츠가 표시될 곳 */}
    </>
  );
};

export default Layout;
