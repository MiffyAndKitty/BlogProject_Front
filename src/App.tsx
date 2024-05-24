import './App.css';
import Login from './login/Login';
import Dashboard from './Dashboard';
import SignUp from'./login/Signup';
import FindLoginID from './login/FindLoginID';
import MainPage from './main/MainPage';
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
      <Route path={`/signup`} element={<SignUp></SignUp>}/>
      <Route path={`/findID`} element={<FindLoginID></FindLoginID>}/>
      <Route path="/dashboard" element={<Dashboard></Dashboard>} />
    </Routes>
    </Router>
  );
}

export default App;
