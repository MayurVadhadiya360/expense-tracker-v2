import React, { useState, useContext } from 'react';
import { GlobalDataContext } from '../App';
import { amountBodyTemplate } from './utils/templates';
import { Tag } from 'primereact/tag';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';


function RecentExpenses(props) {
    const { categorySeverity, expenseData, fetchExpenseData } = useContext(GlobalDataContext);
    const [dataTableLoading, setDataTableLoading] = useState(false);

    const handleRefreshRecentExpense = (e) => {
        const refreshIcon = e.target;
        refreshIcon.classList.add('pi-spin');
        fetchExpenseData(setDataTableLoading);
        setTimeout(() => {
            refreshIcon.classList.remove('pi-spin');
        }, 1000);
    }

    const categoryBodyTemplate = (expense) => {
        return <Tag value={expense.category} severity={categorySeverity[expense.category]} style={{ whiteSpace: 'nowrap', }}></Tag>;
    };

    return (
        <>
            {console.log('- recent expense')}
            <div>
                <div className='d-flex justify-content-center align-items-center header-p' >
                    <h3 >Recents</h3>
                    <i className="pi pi-sync ms-2" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={handleRefreshRecentExpense} />
                </div>
                <hr className='m-0' />

                <div className='card mt-2 p-1'>
                    <DataTable
                        value={expenseData.slice(0, 100)}
                        loading={dataTableLoading}
                        loadingIcon={<ProgressSpinner style={{ width: '50px', height: '50px' }} />}
                        scrollable
                        scrollHeight={`36.2rem`}
                        stripedRows
                        tableStyle={{ minWidth: `40rem`, }}
                    >
                        <Column
                            field="description"
                            header="Description"
                            sortable
                        />
                        <Column
                            field="date"
                            header="Date"
                            style={{ minWidth: '12ch' }}
                            sortable
                        />
                        <Column
                            field='category'
                            header="Category"
                            body={categoryBodyTemplate}
                            align={'center'}
                            sortable
                        />
                        <Column
                            field="amount"
                            header="Amount"
                            body={amountBodyTemplate}
                            sortable
                        />
                    </DataTable>
                </div>
            </div>
        </>
    );

}
export default RecentExpenses;