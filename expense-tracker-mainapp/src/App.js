import React, { useState, useEffect, createContext, useRef } from 'react';
import './App.css'
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Insights from './components/Insights';
import HomePage from './components/HomePage';
import AddExpense from './components/AddExpense';
import AddCategory from './components/Category';
import ExpensePage from './components/ExpensePage';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';

export const GlobalDataContext = createContext();

function App() {
  const API_URL = window._env_.REACT_APP_API_URL || process.env.REACT_APP_API_URL;
  const [expenseData, setExpenseData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorySeverity, setCategorySeverity] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [visibleDialogExpense, setVisibleDialogExpense] = useState(false);
  const [dialogActiveIndex, setDialogActiveIndex] = useState(1);

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
          console.log(result);
          if (result['status']) {
            setExpenseData(result['expenses']);
          }
          setLoader(false);
        },
        (error) => {
          console.log(error);
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
          console.log(result);
          if (result['status']) {
            setCategories(result['category']);
          }
        },
        (error) => {
          console.log(error);
        }
      )
  }

  useEffect(() => {
    fetchCategoryData();
    fetchExpenseData();
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
    categories,
    setCategories,
    fetchCategoryData,
    categorySeverity,
    expenseData,
    fetchExpenseData,
    setToastMsg,
    setVisibleDialogExpense,
    setDialogActiveIndex,
  };

  return (
    <>
      <GlobalDataContext.Provider value={contextValue}>
        <Router>
          <Navbar />
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
            <Route exact path='/' element={<Navigate to='/home' />}></Route>
            <Route exact path='/home' element={<HomePage />}></Route>
            <Route exact path='/expense' element={<ExpensePage />}></Route>
            <Route exact path='/insights' element={<Insights />}></Route>
          </Routes>
        </Router>
      </GlobalDataContext.Provider>
    </>
  );
}

export default App;
