import './App.css';
import React, { useEffect, useState } from 'react';
import LocalLogin from './login/LocalLogin';
import Dashboard from './main/Dashboard';
import SignUp from'./login/SignUp';
import GoogleSignUp from './login/GoogleSignUp';
import LocalSignUp from'./login/LocalSignup';
import Login from './login/Login';
import FindLoginID from './login/FindLoginID';
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
import DragTest from './main/DragTest';
import Layout from './main/Layout.js';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

function App() {

  return (
    <Router>
    <Routes>
      <Route index element={<MainPage></MainPage>}/>
      <Route path={`/login`} element={<Login></Login>}/>
      <Route path={`/auth/callback`} element={<AuthCallback></AuthCallback>}/>
      <Route path={`/locallogin`} element={<LocalLogin></LocalLogin>}/>
      <Route path={`/signup`} element={<SignUp></SignUp>}/>
      <Route path={`/google/signup/:nickname`} element={<GoogleSignUp></GoogleSignUp>}/>
      <Route path={`/localsignup`} element={<LocalSignUp></LocalSignUp>}/>
      <Route path={`/findID`} element={<FindLoginID></FindLoginID>}/>
      <Route path={`/dashboard/:nickname`} element={<Dashboard></Dashboard>} />
      <Route path={`/dashboard/all-post/:tag?`} element={<AllPopularPost></AllPopularPost>} />
      <Route path={`/dashboard/all-new-notification`} element={<AllNewNotification></AllNewNotification>} />
      <Route path={`/:nickname/:postID?/:commentID?/:replyID?`} element={<MyBlogMainPage></MyBlogMainPage>} />
      <Route path={`/writenewpost/:nickname`} element={<WriteNewPost></WriteNewPost>} />
      <Route path={`/getpost/:nickname`} element={<GetPost></GetPost>} />
      <Route path={`/fixpost/:nickname`} element={<FixPost></FixPost>} />
      <Route path={`/categorySetting/:nickname`} element={<CategorySettings></CategorySettings>} />
      <Route path={`/myProfileSetting/:nickname`} element={<MyProfileSetting></MyProfileSetting>} />
    </Routes>
    </Router>
  );
}

export default App;
