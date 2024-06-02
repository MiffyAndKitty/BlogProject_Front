import './App.css';
import React from 'react';
import LocalLogin from './login/LocalLogin';
import Dashboard from './main/Dashboard';
import SignUp from'./login/Signup';
import Login from './login/Login';
import FindLoginID from './login/FindLoginID';
import MainPage from './main/MainPage';
import AuthCallback from './login/AuthCallback';
import MyBlogMainPage from './myblog/MyBlogMainPage';
import WriteNewPost from './myblog/WriteNewPost';
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
      <Route path={`/findID`} element={<FindLoginID></FindLoginID>}/>
      <Route path={`/dashboard`} element={<Dashboard></Dashboard>} />
      <Route path={`/blogmain`} element={<MyBlogMainPage></MyBlogMainPage>} />
      <Route path={`/writenewpost`} element={<WriteNewPost></WriteNewPost>} />
    </Routes>
    </Router>
  );
}

export default App;
