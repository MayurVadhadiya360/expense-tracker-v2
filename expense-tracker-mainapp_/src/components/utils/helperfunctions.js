
const formatDate = (date) => {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
export { formatDate };

const generateColorPalette = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const hue = (i * 360 / numColors) % 360;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
};
export { generateColorPalette };

// Export Data
const exportPdf = (expenseData) => {
    const cols = [
        { field: 'description', header: 'Description' },
        { field: 'category', header: 'Category' },
        { field: 'amount', header: 'Amount' },
        { field: 'type', header: 'PaymentType' },
        { field: 'date', header: 'Date' },
    ];
    const exportColumns = cols.map((col) => ({ title: col.header, dataKey: col.field }));

    import('jspdf').then((jsPDF) => {
        import('jspdf-autotable').then(() => {
            const doc = new jsPDF.default(0, 0);
            doc.autoTable(exportColumns, expenseData);
            doc.save('expense_data.pdf');
        });
    });
};

const exportExcel = (expenseData) => {
    import('xlsx').then((xlsx) => {
        const trans = expenseData.map(({ description, category, amount, type, date }) => ({ description, category, amount, type, date }))
        const worksheet = xlsx.utils.json_to_sheet(trans);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
        });
        saveAsExcelFile(excelBuffer, 'expense_data');
    });
};

const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then((module) => {
        if (module && module.default) {
            let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data = new Blob([buffer], {
                type: EXCEL_TYPE
            });
            module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
        }
    });
};
export { exportPdf, exportExcel };