import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/Login';
import Signup from "./components/Signup";
import ForgotPassword from './components/ForgotPassword';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';


function App() {
  const API_URL = window._env_.REACT_APP_API_URL || process.env.REACT_APP_API_URL;
  return (
    <>
      <Router>
        <Routes>
          <Route exact path='/' element={<Navigate to='/login' />}></Route>
          <Route exact path="/login" element={<Login API_URL={API_URL} />}></Route>
          <Route exact path="/signup" element={<Signup API_URL={API_URL} />}></Route>
          <Route exact path="/reset-password" element={<ForgotPassword API_URL={API_URL} />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
// npx serve -s build