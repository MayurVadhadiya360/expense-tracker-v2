import React, { useState, useContext, useEffect } from 'react';
import { GlobalDataContext } from '../App';
import { formatDate } from './utils/helperfunctions';
import { SelectItemTemplate } from './utils/templates';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';


function AddExpense({ header = true, }) {
    const { API_URL, categories, categorySeverity, setToastMsg } = useContext(GlobalDataContext);
    const expenseTypeOptions = ['Paid', 'Received'];

    // Fields for new expense
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [expenseType, setExpenseType] = useState(expenseTypeOptions[0]);
    const [amount, setAmount] = useState('');

    // For validating input fields
    const [validDesc, setValidDesc] = useState(true);
    const [validCategory, setValidCategory] = useState(true);
    const [validDate, setValidDate] = useState(true);
    const [validAmount, setValidAmount] = useState(true);

    // loadings
    const [loadingExpense, setLoadingExpense] = useState(false);


    const categoryOptionTemplate = (option) => {
        return (<Tag value={option} severity={categorySeverity[option]} />);
    };

    const selectedCategoryTemplate = (option, props) => {
        if (option) {
            return categoryOptionTemplate(option);
        }
        return <span>{props.placeholder}</span>;
    };

    useEffect(() => {
        setValidDesc((description === '' || description === null) ? false : true);
    }, [description]);

    useEffect(() => {
        setValidCategory((category === '' || category === null) ? false : true);
    }, [category]);

    useEffect(() => {
        setValidDate((date === '' || date === null) ? false : true);
    }, [date]);

    useEffect(() => {
        setValidAmount((amount === '' || amount === null || amount <= 0) ? false : true);
    }, [amount]);

    const addNewExpense = () => {
        if (validDesc && validCategory && validDate && validAmount) {
            setLoadingExpense(true);

            let body_data = {
                description: description,
                category: category,
                date: formatDate(date),
                amount: amount,
                expenseType: expenseType,
            };

            fetch(`${API_URL}/add_expense/`, {
                method: 'POST',
                headers: { 'accept': 'application.json', 'content-type': 'application/json' },
                body: JSON.stringify(body_data),
                cache: 'default',
            }).then(res => res.json())
                .then(
                    (result) => {
                        if (result.status) {
                            setToastMsg({ severity: 'success', summary: 'Confirmed', detail: result.msg, life: 3000 });
                            clearForm();
                        }
                        else {
                            setToastMsg({ severity: 'error', summary: 'Error', detail: result.msg, life: 3000 });
                        }
                        setLoadingExpense(false);
                    },
                    (error) => {
                        console.error(error);
                        setToastMsg({ severity: 'error', summary: 'Invalid', detail: "Functional error!", life: 3000 });
                        setLoadingExpense(false);
                    }
                )
        }
        else {
            setToastMsg({ severity: 'error', summary: 'Invalid', detail: "Fill all fields properly!", life: 3000 });
            setLoadingExpense(false);
        }
    };

    const clearForm = () => {
        setDescription('');
        setCategory('');
        setDate('');
        setExpenseType(expenseTypeOptions[0]);
        setAmount('');
    }

    const onClear = () => {
        clearForm();
        setToastMsg({ severity: 'info', detail: 'Cleared all fields!', })
    }

    return (
        <>
            {console.log('- add expense')}

            <div>
                {
                    header &&
                    <>
                        <div className='d-flex justify-content-center header-p' >
                            <h3 >Add New Expense</h3>
                        </div>
                        <hr className='m-0' />
                    </>
                }
                <div className="card flex flex-column mt-2">

                    <div className="m-2 p-inputgroup flex-1" style={{ width: 'auto' }}>
                        <span className="p-inputgroup-addon">Description</span>
                        <InputText
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            // invalid={!validDesc}
                            variant="filled"
                        />
                    </div>

                    <div className="m-2 p-inputgroup flex-1" style={{ width: 'auto' }}>
                        <span className="p-inputgroup-addon">Category</span>
                        <Dropdown
                            value={category}
                            onChange={(e) => setCategory(e.value)}
                            options={categories}
                            optionLabel="name"
                            valueTemplate={selectedCategoryTemplate}
                            itemTemplate={categoryOptionTemplate}
                            filter
                            placeholder="Select Category"
                            // invalid={!validCategory}
                            variant="filled"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className='m-2  flex-auto' style={{ width: 'auto' }}>
                        <Calendar
                            id='dateinput'
                            value={date}
                            onChange={(e) => setDate(e.value)}
                            showIcon
                            showButtonBar
                            dateFormat="dd-mm-yy"
                            placeholder='Select Date'
                            // invalid={!validDate}
                            variant="filled"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className='m-2 p-inputgroup flex-1' style={{ width: 'auto', borderRadius: '0.5rem' }}>
                        <SelectButton
                            value={expenseType}
                            onChange={(e) => setExpenseType(e.value)}
                            options={expenseTypeOptions}
                            itemTemplate={SelectItemTemplate}
                            allowEmpty={false}
                            className='me-1'
                        />
                        <InputNumber
                            value={amount}
                            onChange={(e) => setAmount(e.value)}
                            min={0}
                            inputId="currency-india"
                            mode="currency"
                            currency="INR"
                            currencyDisplay="code"
                            locale="en-IN"
                            // invalid={!validAmount}
                            variant="filled"
                        />
                    </div>

                    <div className='m-2 d-flex justify-content-evenly' style={{ width: 'auto' }}>
                        <Button
                            label="Clear"
                            icon="pi pi-times"
                            onClick={onClear}
                            severity="danger"
                            disabled={description === '' && category === '' && date === '' && amount === ''}
                            className='rounded-custom'
                            outlined
                        />
                        <Button
                            label="Submit"
                            icon="pi pi-check"
                            onClick={addNewExpense}
                            loading={loadingExpense}
                            className='rounded-custom'
                            raised
                        />
                    </div>

                </div>
            </div>

        </>
    );
}


export default AddExpense;