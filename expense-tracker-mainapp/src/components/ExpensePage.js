import React, { useState, useContext, useEffect, useRef } from 'react'
import { GlobalDataContext } from '../App';
import { amountBodyTemplate, typeBodyTemplate } from './utils/templates';
import { formatDate, exportPdf, exportExcel } from './utils/helperfunctions';
import { dateEditor, amountEditor, textEditor, typeEditor } from './utils/templates';
import { typeFilterTemplate, dateFilterTemplate, amountFilterTemplate } from './utils/templates';
import { Tag } from 'primereact/tag';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FilterMatchMode, FilterService } from 'primereact/api';


FilterService.register('date_match', (value, filter) => {
    if (!filter) return true;
    if (!value) return false;

    const filterDate = new Date(filter);
    const valueDate = new Date(value);

    // Reset time for comparison
    filterDate.setHours(0, 0, 0, 0);
    valueDate.setHours(0, 0, 0, 0);

    return filterDate.getTime() === valueDate.getTime();
});

FilterService.register('date_range', (value, filter) => {
    if (!filter) return true;
    if (!value) return false;
    const [date1, date2] = filter;

    const filterDate1 = new Date(date1);
    const filterDate2 = new Date(date2);
    const valueDate = new Date(value);

    // Reset time for comparison
    filterDate1.setHours(0, 0, 0, 0);
    filterDate2.setHours(0, 0, 0, 0);
    valueDate.setHours(0, 0, 0, 0);

    return valueDate.getTime() >= filterDate1.getTime() && valueDate.getTime() <= filterDate2.getTime();
});

FilterService.register('amount_range', (value, filter) => {
    const [lower, upper] = filter ?? [null, null];
    if (lower === null && upper === null) return true;
    if (lower !== null && upper === null) return lower <= value;
    if (lower === null && upper !== null) return value <= upper;
    return lower <= value && value <= upper;
});

function ExpensePage(props) {
    const { API_URL, categories, categorySeverity, expenseData, fetchExpenseData, setToastMsg, setVisibleDialogExpense } = useContext(GlobalDataContext);

    // DataTable Reference for exporting data
    const dt = useRef(null);

    const [dataTableLoading, setDataTableLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState(null);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            description: { value: null, matchMode: FilterMatchMode.CONTAINS },
            category: { value: null, matchMode: FilterMatchMode.IN },
            amount: { value: null, matchMode: FilterMatchMode.EQUALS },
            type: { value: null, matchMode: FilterMatchMode.EQUALS },
            date: { value: null, matchMode: 'date_match' },
        });

        setGlobalFilterValue('');
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    // Templates
    // Category template
    const categoryValueTemplate = (option) => {
        return <Tag value={option} severity={categorySeverity[option]} style={{ whiteSpace: 'nowrap' }} />;
    };

    // Template for selected category in multiselect
    const selectedCategoryTemplate = (option, props) => {
        if (option) {
            return categoryValueTemplate(option);
        }
        return <span>{props.placeholder}</span>;
    };

    // Template for category in datatable
    const CategoryBodyTemplate = (expense) => {
        return categoryValueTemplate(expense.category);
    };

    // Template for category multiselect in filter
    const FilterCategoryElement = (options) => {
        return (
            <MultiSelect
                value={options.value}
                options={categories}
                itemTemplate={categoryValueTemplate}
                onChange={(e) => options.filterApplyCallback(e.value)}
                placeholder="Select categories"
                className="p-column-filter"
                display='chip'
                style={{ minWidth: '14rem', maxWidth: '20rem' }}
            />
        );
    };

    // Template for delete button
    const deleteTemplate = (expense) => {
        return <i className='pi pi-trash' style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDelete(expense._id)}></i>
    }

    // Editors : Imprted from Templates
    const categoryEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                onChange={(e) => options.editorCallback(e.value)}
                valueTemplate={selectedCategoryTemplate}
                itemTemplate={categoryValueTemplate}
                options={categories}
                optionLabel="name"
                placeholder="Select Category"
                filter
                style={{ width: '100%' }}
            />
        );
    };

    // Exporting data
    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };

    const onExportPdf = () => {
        exportPdf(expenseData);
    }

    const onExportExcel = () => {
        exportExcel(expenseData);
    }

    // Edit 
    const onRowEditComplete = (e) => {
        let { newData, index } = e;
        newData['date'] = formatDate(newData['date']);
        setDataTableLoading(true);
        fetch(`${API_URL}/update_expense/`, {
            method: 'POST',
            headers: {
                'accept': 'application.json',
                'content-type': 'application/json',
            },
            body: JSON.stringify(newData),
            cache: 'default',
        }).then(res => res.json())
            .then(
                (result) => {
                    if (result.status) {
                        setToastMsg({ severity: 'success', summary: 'Confirmed', detail: result.msg, life: 3000 });
                        fetchExpenseData(setDataTableLoading);
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Error', detail: result.msg, life: 3000 });
                    }
                    setDataTableLoading(false);
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Invalid', detail: "Functional error!", life: 3000 });
                }
            )
    };

    // Delete
    const handleDelete = (expenseId) => {
        fetch(`${API_URL}/delete_expense/`, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
            },
            body: JSON.stringify({ id: expenseId }),
        }).then(res => res.json())
            .then(
                (result) => {
                    if (result.status) {
                        setToastMsg({ severity: 'success', summary: 'Deleted', detail: result.msg, life: 3000 });
                        fetchExpenseData(setDataTableLoading);
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Error', detail: result.msg, life: 3000 });
                    }
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: "Functional error!", life: 3000 });
                }
            );
    };

    useEffect(() => {
        initFilters();
    }, [])

    const renderHeader = () => {
        const tooltipOptionsExport = { position: 'bottom', mouseTrack: true, mouseTrackTop: 20, showDelay: 200 };
        return (
            <div>
                <div className="row d-flex justify-content-between">
                    <div className="col-md-auto d-flex align-items-center justify-content-center">
                        <Button
                            type='button'
                            onClick={() => setVisibleDialogExpense(true)}
                            icon="pi pi-plus"
                            className='m-1 circle-custom'
                            tooltip='Add Expense or Category'
                        />

                        <Divider layout="vertical" />

                        <Button
                            type="button"
                            onClick={() => exportCSV(false)}
                            severity='info'
                            icon="pi pi-file"
                            className='m-1 circle-custom'
                            tooltip='Export as CSV'
                            tooltipOptions={tooltipOptionsExport}
                        />

                        <Button
                            type="button"
                            onClick={onExportExcel}
                            severity="success"
                            icon="pi pi-file-excel"
                            className='m-1 circle-custom'
                            tooltip='Export as Excel'
                            tooltipOptions={tooltipOptionsExport}
                        />

                        <Button
                            type="button"
                            onClick={onExportPdf}
                            severity="warning"
                            icon="pi pi-file-pdf"
                            className='m-1 circle-custom'
                            tooltip='Export as PDF'
                            tooltipOptions={tooltipOptionsExport}
                        />
                    </div>
                    <div className='col-md-auto d-flex p-inputgroup'>
                        <Button
                            icon="pi pi-search"
                            className="p-button-warning"
                            style={{ borderRadius: '0.5rem 0 0 0.5rem' }}
                            disabled
                        />

                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Keyword Search"
                        />

                        <Button
                            type="button"
                            label="Clear"
                            onClick={initFilters}
                            icon="pi pi-filter-slash"
                            style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                            outlined
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Tooltip target={'.expense-type'} />
            <div className='card m-2 p-1' >
                <DataTable
                    value={expenseData}
                    rowHover
                    stripedRows
                    tableStyle={{ minWidth: `40rem`, }}
                    paginator rows={10} rowsPerPageOptions={[10, 25, 50, 100]} pageLinkSize={5}
                    sortMode='multiple'
                    editMode='row'
                    onRowEditComplete={onRowEditComplete}
                    filters={filters} globalFilterFields={['description', 'date', 'category', 'amount']} filterDisplay='menu'
                    emptyMessage="No Expense found."
                    header={renderHeader}
                    loading={dataTableLoading}
                    loadingIcon={<ProgressSpinner style={{ width: '50px', height: '50px' }} />}
                    ref={dt}
                    columnResizeMode="expand" resizableColumns
                >
                    <Column
                        field="description" header="Description"
                        editor={(options) => textEditor(options)}
                        sortable
                        filter filterPlaceholder='Search By Description'
                    />

                    <Column
                        field='category' header="Category"
                        body={CategoryBodyTemplate}
                        editor={(options) => categoryEditor(options)}
                        sortable
                        filter
                        filterElement={FilterCategoryElement}
                        filterMatchModeOptions={[{ label: 'IN', value: 'in' }, { label: 'NOT IN', value: 'notIn' }]}
                    />

                    <Column
                        field="amount" header="Amount"
                        body={amountBodyTemplate}
                        editor={(options) => amountEditor(options)}
                        sortable
                        filter
                        filterElement={amountFilterTemplate}
                        filterMatchModeOptions={[{ label: 'Contains', value: 'contains' }, { label: 'Equals', value: 'equals' }, { label: 'Range', value: 'amount_range' }]}
                    />

                    <Column
                        field='type' header="Type"
                        body={typeBodyTemplate}
                        editor={typeEditor}
                        sortable
                        filter
                        filterElement={typeFilterTemplate}
                        filterMatchModeOptions={[{ label: 'Equals', value: 'equals' }]}
                        showFilterMenuOptions={false}
                    // align={'center'}
                    // style={{maxWidth:'9ch'}}
                    />

                    <Column
                        field="date" header="Date"
                        editor={(options) => dateEditor(options)}
                        sortable
                        filter
                        filterElement={dateFilterTemplate}
                        filterMatchModeOptions={[{ label: 'Date Match', value: 'date_match' }, { label: 'Date Range', value: 'date_range' }]}
                        filterHeaderStyle={{ width: '15ch' }}
                        style={{ minWidth: '12ch' }}
                    />

                    <Column
                        header="Edit"
                        rowEditor={true}
                        align={'center'}
                    />
                    <Column
                        header="Delete"
                        body={deleteTemplate}
                        align={'center'}
                        style={{ flex: '0 0 4rem' }}
                    />
                </DataTable>
            </div>
        </>
    )
}

export default ExpensePage;