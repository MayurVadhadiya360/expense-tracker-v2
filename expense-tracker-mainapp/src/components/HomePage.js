import React from 'react';
import AddExpense from './AddExpense';
import AddCategory from './Category';
import RecentExpenses from './RecentExpenses';
import { InsightDateTypeTotalAmount } from './Insights';


export default function HomePage(props) {

    return (
        <>
            <div className='w-100 m-0 mt-2 my-1' >
                <div className='card  p-2 m-1' >
                    <InsightDateTypeTotalAmount daysCount={15} chartHeight='20rem' titleHeader='Expense of Last 15 Days' />
                </div>

            </div>

            <div className='row w-100 m-0'>

                <div className='col-md my-1 mx-1 container' style={{ width: '35rem', height: '42rem', padding: 0 }}>
                    <div className='card container p-2'>
                        <AddExpense />
                    </div>
                    <div className='card container mt-2 pb-2'>
                        <AddCategory />
                    </div>
                </div>

                <div className='col-md my-1 container' style={{ width: '55rem', height: '42rem', }}>
                    <div className='card container p-2'>
                        <RecentExpenses />
                    </div>
                </div>
            </div>

        </>
    )

}

