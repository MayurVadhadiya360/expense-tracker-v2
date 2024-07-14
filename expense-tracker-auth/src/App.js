import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/Login';
import Signup from "./components/Signup";
import ForgotPassword from './components/ForgotPassword';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';
import LoadingBar from 'react-top-loading-bar';
import { Toast } from 'primereact/toast';

function App() {
  const API_URL = window._env_.REACT_APP_API_URL || process.env.REACT_APP_API_URL;
  const [loadingBarProgress, setLoadingBarProgress] = useState(0);

  const toast = useRef(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (toastMsg) {
      toast.current.show(toastMsg);
      setToastMsg(null);
    }
  }, [toastMsg]);

  return (
    <>
      <Router>
        <LoadingBar height={3} color='#f11946' progress={loadingBarProgress} />
        <Toast ref={toast} />
        <Routes>

          <Route exact path='/'
            element={<Navigate to='/login' />}
          />

          <Route exact path="/login"
            element={<Login API_URL={API_URL} setToastMsg={setToastMsg} setLoadingBarProgress={setLoadingBarProgress} />}
          />

          <Route exact path="/signup"
            element={<Signup API_URL={API_URL} setToastMsg={setToastMsg} setLoadingBarProgress={setLoadingBarProgress} />}
          />

          <Route exact path="/reset-password"
            element={<ForgotPassword API_URL={API_URL} setToastMsg={setToastMsg} setLoadingBarProgress={setLoadingBarProgress} />}
          />

        </Routes>
      </Router>
    </>
  );
}

export default App;
// npx serve -s build