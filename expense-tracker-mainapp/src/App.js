import React, { useState, useEffect, createContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoadingBar from 'react-top-loading-bar';
import './App.css'
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Insights from './components/Insights';
import HomePage from './components/HomePage';
import AddExpense from './components/AddExpense';
import AddCategory from './components/Category';
import ExpensePage from './components/ExpensePage';
import { config } from './components/utils/config';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';

export const GlobalDataContext = createContext();

function App() {
  const INIT_PATH = config.init_path;
  const API_URL = config.api_url + config.init_path;

  const [expenseData, setExpenseData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorySeverity, setCategorySeverity] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [visibleDialogExpense, setVisibleDialogExpense] = useState(false);
  const [dialogActiveIndex, setDialogActiveIndex] = useState(1);
  const [userData, setUserData] = useState({});
  const [loadingBarProgress, setLoadingBarProgress] = useState(0);

  const getUserData = () => {
    fetch(`${API_URL}/get_user/`)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.status) {
            setUserData(result.user_data);
          }
          else {
            setToastMsg({ severity: 'error', summary: 'Error', detail: 'Failed to get user!', life: 3000 });
          }
        },
        (error) => {
          console.error(error);
          setToastMsg({ severity: 'error', summary: 'Error', detail: "Functional error!", life: 3000 });
        }
      );
  }

  // Toast Messages
  const toast = useRef(null);
  useEffect(() => {
    if (toastMsg) {
      toast.current.show(toastMsg);
    }
  }, [toastMsg]);

  // Function to fetch expense data
  const fetchExpenseData = (setLoader = (boolVal) => { }) => {
    setLoader(true);
    fetch(`${API_URL}/get_expense/`)
      .then(res => res.json())
      .then(
        (result) => {
          if (result['status']) {
            setExpenseData(result['expenses']);
          }
          setLoader(false);
        },
        (error) => {
          console.error(error);
          setLoader(false);
        }
      );
  };

  // Function to fetch category data
  const fetchCategoryData = () => {
    fetch(`${API_URL}/get_category/`)
      .then(res => res.json())
      .then(
        (result) => {
          if (result['status']) {
            setCategories(result['category']);
          }
        },
        (error) => {
          console.error(error);
        }
      )
  }

  useEffect(() => {
    getUserData();
    fetchCategoryData();
    fetchExpenseData();
    // eslint-disable-next-line
  }, []);

  // (Re)Calculate severity/color-style for category
  useEffect(() => {
    if (categories.length > 0) {
      const severity = ['primary', 'success', 'info', 'warning', 'danger',]; //'secondary', 'contrast'
      let tempCategorySeverity = categories.reduce((acc, cat, i) => {
        acc[cat] = severity[i % severity.length];
        return acc;
      }, {});
      setCategorySeverity(tempCategorySeverity);
    }
  }, [categories]);

  const contextValue = {
    API_URL,
    INIT_PATH,
    categories,
    setCategories,
    categorySeverity,
    expenseData,
    fetchExpenseData,
    setToastMsg,
    setLoadingBarProgress,
  };

  return (
    <>
      <GlobalDataContext.Provider value={contextValue}>
        <Router>
          <LoadingBar height={3} color='#f11946' progress={loadingBarProgress} />
          <Navbar userData={userData} setDialogActiveIndex={setDialogActiveIndex} setVisibleDialogExpense={setVisibleDialogExpense} />
          <Toast ref={toast} />
          <Dialog
            header='Add Expense & Category'
            headerStyle={{ whiteSpace: 'nowrap' }}
            visible={visibleDialogExpense}
            maximizable
            position='top'
            style={{ width: '50rem' }}
            onHide={() => { if (!visibleDialogExpense) return; setVisibleDialogExpense(false); }}
          >
            <div className='card'>
              <TabView activeIndex={dialogActiveIndex} onTabChange={(e) => setDialogActiveIndex(e.index)}>
                <TabPanel header="Expense" leftIcon="pi pi-receipt me-2" >
                  <div className="m-0">
                    <AddExpense header={false} />
                  </div>
                </TabPanel>
                <TabPanel header="Category" leftIcon="pi pi-tag me-2">
                  <div className="m-0">
                    <AddCategory header={false} listHeight='15.7rem' isDeletable />
                  </div>
                </TabPanel>
              </TabView>
            </div>
          </Dialog>
          <Routes>
            <Route exact path='/' element={<Navigate to={`${INIT_PATH}/home`} />} />
            <Route exact path={INIT_PATH} element={<Navigate to={`${INIT_PATH}/home`} />} />
            <Route exact path={`${INIT_PATH}/home`} element={<HomePage />} />
            <Route exact path={`${INIT_PATH}/expense`} element={<ExpensePage />} />
            <Route exact path={`${INIT_PATH}/insights`} element={<Insights />} />
            <Route exact path={`${INIT_PATH}/profile`} element={<Profile userData={userData} getUserData={getUserData} />} />
          </Routes>
        </Router>
      </GlobalDataContext.Provider>
    </>
  );
}

export default App;
