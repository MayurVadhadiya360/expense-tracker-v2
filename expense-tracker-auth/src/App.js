import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/Login';
import Signup from "./components/Signup";
import ForgotPassword from './components/ForgotPassword';
import { config } from './components/utils/config';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';
import LoadingBar from 'react-top-loading-bar';
import { Toast } from 'primereact/toast';

function App() {
  const INIT_PATH = config.init_path;
  const API_URL = config.api_url + config.init_path;

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
            element={<Navigate to={`${INIT_PATH}/login`} />}
          />

          <Route exact path={INIT_PATH}
            element={<Navigate to={`${INIT_PATH}/login`} />}
          />

          <Route exact path={`${INIT_PATH}/login`}
            element={
              <Login
                API_URL={API_URL}
                INIT_PATH={INIT_PATH}
                setToastMsg={setToastMsg}
                setLoadingBarProgress={setLoadingBarProgress}
              />
            }
          />

          <Route exact path={`${INIT_PATH}/signup`}
            element={
              <Signup
                API_URL={API_URL}
                INIT_PATH={INIT_PATH}
                setToastMsg={setToastMsg}
                setLoadingBarProgress={setLoadingBarProgress}
              />
            }
          />

          <Route exact path={`${INIT_PATH}/reset-password`}
            element={
              <ForgotPassword
                API_URL={API_URL}
                INIT_PATH={INIT_PATH}
                setToastMsg={setToastMsg}
                setLoadingBarProgress={setLoadingBarProgress}
              />
            }
          />

        </Routes>
      </Router>
    </>
  );
}

export default App;