import './App.css';
import React from 'react';
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
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

function App() {
  return (
    <Router>
    <Routes>
      <Route path={`/`} element={<MainPage></MainPage>}/>
      <Route path={`/login`} element={<Login></Login>}/>
      <Route path={`/auth/callback`} element={<AuthCallback></AuthCallback>}/>
      <Route path={`/locallogin`} element={<LocalLogin></LocalLogin>}/>
      <Route path={`/signup`} element={<SignUp></SignUp>}/>
      <Route path={`/google/signup`} element={<GoogleSignUp></GoogleSignUp>}/>
      <Route path={`/localsignup`} element={<LocalSignUp></LocalSignUp>}/>
      <Route path={`/findID`} element={<FindLoginID></FindLoginID>}/>
      <Route path={`/dashboard`} element={<Dashboard></Dashboard>} />
      <Route path={`/blogmain`} element={<MyBlogMainPage></MyBlogMainPage>} />
      <Route path={`/writenewpost`} element={<WriteNewPost></WriteNewPost>} />
      <Route path={`/getpost`} element={<GetPost></GetPost>} />
      <Route path={`/fixpost`} element={<FixPost></FixPost>} />
      <Route path={`/categorySetting`} element={<CategorySettings></CategorySettings>} />
    </Routes>
    </Router>
  );
}

export default App;
