import './App.css';
import React, { useEffect, useState } from 'react';
import LocalLogin from './login/LocalLogin';
import Dashboard from './main/Dashboard';
import SignUp from'./login/SignUp';
import GoogleSignUp from './login/GoogleSignUp';
import LocalSignUp from'./login/LocalSignup';
import Login from './login/Login';
import FindPassword from './login/FindPassword';
import MainPage from './main/MainPage';
import AuthCallback from './login/AuthCallback';
import MyBlogMainPage from './myblog/MyBlogMainPage';
import WriteNewPost from './myblog/ManagePost/WriteNewPost';
import GetPost from './myblog/ManagePost/GetPost';
import FixPost from './myblog/ManagePost/FixPost';
import CategorySettings from './myblog/CategorySetting';
import PostDetail from './myblog/PostDetail';
import AllPopularPost from './main/AllPopularPost';
import MyProfileSetting from './main/MyProfileSetting';
import AllNewNotification from './main/AllNewNotification';
import NotFound from './main/NotFound';
import DragTest from './main/DragTest';
import Layout from './main/Layout.js';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import DeleteUser from './login/DeleteUser';

function App() {

  return (
    <Router>
    <Routes>
      {/* 없는 페이지(404)를 처리하는 라우트 */}
      <Route path="*" element={<NotFound />} />
      <Route index element={<MainPage></MainPage>}/>
      <Route path={`/login`} element={<Login></Login>}/>
      <Route path={`/auth/callback`} element={<AuthCallback></AuthCallback>}/>
      <Route path={`/locallogin`} element={<LocalLogin></LocalLogin>}/>
      <Route path={`/signup`} element={<SignUp></SignUp>}/>
      <Route path={`/google/signup/:token`} element={<GoogleSignUp></GoogleSignUp>}/>
      <Route path={`/localsignup`} element={<LocalSignUp></LocalSignUp>}/>
      <Route path={`/find-password`} element={<FindPassword></FindPassword>}/>
      <Route path={`/delete-user/:token`} element={<DeleteUser></DeleteUser>}/>
      <Route path={`/dashboard`} element={<Dashboard></Dashboard>} />
      <Route path={`/dashboard/all-post/:tag?/:search?/:sort?`} element={<AllPopularPost></AllPopularPost>} />
      <Route path={`/dashboard/all-new-notification`} element={<AllNewNotification></AllNewNotification>} />
      <Route path={`/:nickname/:postID?/:commentID?/:replyID?`} element={<MyBlogMainPage></MyBlogMainPage>} />
      <Route path={`/writenewpost`} element={<WriteNewPost></WriteNewPost>} />
      <Route path={`/getpost`} element={<GetPost></GetPost>} />
      <Route path={`/fixpost/:postID`} element={<FixPost></FixPost>} />
      <Route path={`/myProfileSetting/`} element={<MyProfileSetting></MyProfileSetting>} />
    </Routes>
    </Router>
  );
}

export default App;
