import React from 'react';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { MultiStateCheckbox } from 'primereact/multistatecheckbox';


const dateFilterTemplate = (options) => {
    return (
        <Calendar
            value={options.value}
            onChange={(e) => options.filterApplyCallback(e.value)}
            dateFormat="yy-mm-dd"
            placeholder="yyyy-mm-dd"
            mask="9999/99/99"
            showButtonBar
            selectionMode={options.filterModel.matchMode === 'date_range' ? 'range' : 'single'}
        />
    );
};
export { dateFilterTemplate };


const typeFilterTemplate = (options) => {
    const items = [
        { value: 'Paid', icon: 'pi pi-arrow-circle-up' },
        { value: 'Received', icon: 'pi pi-arrow-circle-down' },
    ];
    return <div className='d-flex justify-content-center align-items-center'>
        <div className='me-1'>Select Type: </div>
        <MultiStateCheckbox value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} options={items} optionValue="value" empty={false} />
    </div>
}
export { typeFilterTemplate };


const amountFilterTemplate = (options) => {

    if (options.filterModel.matchMode === 'amount_range') {
        const [lower, upper] = options.value ?? [null, null];
        return (
            <div className="d-flex gap-1">
                <InputNumber value={lower} onChange={(e) => options.filterApplyCallback([e.value, upper])} className="w-full" placeholder="Lower" />
                <InputNumber value={upper} onChange={(e) => options.filterApplyCallback([lower, e.value])} className="w-full" placeholder="Upper" />
            </div>
        );
    }
    else {
        return (
            <div>
                <InputNumber value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} className="w-full" placeholder="Enter Amount" />
            </div>
        );
    }
}
export { amountFilterTemplate }


const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
};

const amountBodyTemplate = (expense) => {
    return <span className='m-0 p-0' style={{ color: expense.type === 'Received' ? 'green' : 'red', }}>{formatCurrency(expense.amount)}</span>;
};
export { amountBodyTemplate };


const typeBodyTemplate = (expense) => {

    if (expense.type === 'Received') {
        return <Tag className='pi pi-arrow-circle-down expense-type' severity={'success'} data-pr-tooltip={expense.type}></Tag>
    }
    else {
        return <Tag className='pi pi-arrow-circle-up expense-type' severity={'danger'} data-pr-tooltip={expense.type}></Tag>
    }

}
export { typeBodyTemplate };


const SelectItemTemplate = (option) => {
    return <span style={{ width: '7ch', margin: 0, padding: 0 }}>{option}</span>
}
export { SelectItemTemplate };


// Editors
const textEditor = (options) => {
    return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
};
export { textEditor };


const amountEditor = (options) => {
    return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" />;
};
export { amountEditor };


const dateEditor = (options) => {
    let tempDate = new Date(options.value);
    return <Calendar value={tempDate} onChange={(e) => options.editorCallback(e.value)} dateFormat="yy-mm-dd" placeholder="yyyy-mm-dd" mask="9999/99/99" showButtonBar />;
};
export { dateEditor };


const typeEditor = (options) => {
    const items = [
        { value: 'Paid', icon: 'pi pi-arrow-circle-up' },
        { value: 'Received', icon: 'pi pi-arrow-circle-down' },
    ];
    return <MultiStateCheckbox value={options.value} onChange={(e) => options.editorCallback(e.value)} options={items} optionValue="value" empty={false} />
}
export { typeEditor };