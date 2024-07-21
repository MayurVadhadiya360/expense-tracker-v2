import React, { useState, useContext, useEffect } from 'react'
import { GlobalDataContext } from '../App';
import { generateColorPalette } from './utils/helperfunctions';
import { dropdownIconValueTemplate, selectedDropdownIconValueTemplate } from './utils/templates';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';

const getInsightData =
    ({
        API_URL,
        dateTypeInsight = false,
        categoryTypeInsight = false,
        monthYearTypeInsight = false,
        setDateTypeInsightData = (data) => { },
        setCategoryTypeInsightData = (data) => { },
        setMonthYearTypeInsightData = (data) => { },
        daysCount = null,
        selectedCategories = [],
        dates = null,
        setToastMsg = (data) => { },
    }) => {
        fetch(`${API_URL}/get_insights_data/`, {
            method: 'POST',
            headers: {
                'accept': 'application.json',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                'insight_date_type_totalAmount': dateTypeInsight,
                'insight_category_type_totalAmount': categoryTypeInsight,
                'insight_month_year_type_totalAmount': monthYearTypeInsight,
                'days_count': daysCount,
                'dates': dates,
                'categories': selectedCategories
            }),
            cache: 'default',
        }).then(res => res.json())
            .then(
                (result) => {
                    if (result.status) {
                        if (dateTypeInsight) {
                            setDateTypeInsightData(result.data['date_type_totalAmount_data']);
                        }
                        if (categoryTypeInsight) {
                            setCategoryTypeInsightData(result.data['category_type_totalAmount_data'])
                        }
                        if (monthYearTypeInsight) {
                            setMonthYearTypeInsightData(result.data['month_year_type_totalAmount_data'])
                        }
                        // setToastMsg({ severity: 'success', summary: 'Success', detail: result.msg, life: 3000 });
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Error', detail: result.msg, life: 3000 });
                    }
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: "Functional error!", life: 3000 });
                }
            )
    }

function InsightCategoryTypeTotalAmount({ filter = false, chartHeight = '30rem' }) {
    const { API_URL, setToastMsg } = useContext(GlobalDataContext);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [insightData, setInsightData] = useState([]);
    const expenseTypeOptions = [
        { value: 'Paid', icon: 'pi-arrow-circle-up' },
        { value: 'Received', icon: 'pi-arrow-circle-down' }
    ];
    const [selectedType, setSelectedType] = useState(expenseTypeOptions[0]['value']);
    const [dates, setDates] = useState(null);


    useEffect(() => {
        getInsightData({
            API_URL: API_URL,
            categoryTypeInsight: true,
            setCategoryTypeInsightData: setInsightData,
            dates: dates,
            setToastMsg: setToastMsg,
        });
        // eslint-disable-next-line
    }, [dates]);

    useEffect(() => {
        insightData.sort((a, b) => { return b.totalAmount - a.totalAmount });

        let type_data = [];
        let type_label = '';

        if (selectedType === "Received") {
            type_data = insightData.filter((item, index) => { return item.type === "Received"; });
            type_label = "Received";
        }
        else {
            type_data = insightData.filter((item, index) => { return item.type === "Paid"; });
            type_label = "Paid";
        }

        const labels = type_data.map(item => item.category);
        const pie_chart_data = type_data.map(item => item.totalAmount);

        const numLabels = labels.length;
        const backgroundColors = generateColorPalette(numLabels);
        const hoverBackgroundColors = backgroundColors.map(color => color.replace('70%', '60%'));

        const data = {
            labels: labels,
            datasets: [
                {
                    data: pie_chart_data,
                    label: type_label,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: hoverBackgroundColors
                },

            ]
        };
        const options = {};

        setChartData(data);
        setChartOptions(options);
    }, [insightData, selectedType]);

    return (
        <>
            <div className="card ">
                <div>
                    <div className='d-flex justify-content-center align-items-center p-2 header-insight-p' >
                        <h4 className='m-auto' >Category-wise Total Expenses</h4>
                    </div>
                    {
                        filter &&
                        <div className='d-flex justify-content-between px-2'>
                            <Dropdown
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.value)}
                                options={expenseTypeOptions}
                                optionLabel="value"
                                optionValue='value'
                                valueTemplate={selectedDropdownIconValueTemplate}
                                itemTemplate={dropdownIconValueTemplate}
                                placeholder="Select a Type"
                                checkmark={true}
                                className="w-full md:w-14rem my-1"
                                style={{ minWidth: '15ch' }}
                            />

                            <Calendar
                                value={dates}
                                onChange={(e) => setDates(e.value)}
                                selectionMode="range"
                                readOnlyInput
                                hideOnRangeSelection
                                showButtonBar
                                placeholder='Select date/range'
                                className='my-1'
                            />
                        </div>
                    }
                </div>

                <Chart
                    type="pie"
                    data={chartData}
                    options={chartOptions}
                    className="w-full md:w-30rem"
                    style={{ height: chartHeight }}
                />

            </div>
        </>
    );
}

function InsightDateTypeTotalAmount({ filter = false, chartType = 'line', daysCount = null, chartHeight = '30rem', titleHeader = 'Date-wise Total Expenses' }) {
    const { API_URL, setToastMsg, categories, categorySeverity } = useContext(GlobalDataContext);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [insightData, setInsightData] = useState([]);
    const [selectedChartType, setSelectedChartType] = useState(chartType);
    const [dates, setDates] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const chartTypeOptions1 = [
        { value: 'line', icon: 'pi pi-chart-line' },
        { value: 'bar', icon: 'pi pi-chart-bar' },
    ]

    useEffect(() => {
        getInsightData({
            API_URL: API_URL,
            dateTypeInsight: true,
            setDateTypeInsightData: setInsightData,
            daysCount: daysCount,
            dates: dates,
            selectedCategories: selectedCategories,
            setToastMsg: setToastMsg,
        });
        // eslint-disable-next-line
    }, [dates, selectedCategories, daysCount]);

    useEffect(() => {
        const line_chart_paid = insightData.filter((item, index) => { return item.type === "Paid"; });
        const line_chart_received = insightData.filter((item, index) => { return item.type === "Received"; });

        const labels = line_chart_paid.map(item => item.date);
        const line_chart_data_paid = line_chart_paid.map(item => item.totalAmount);
        const line_chart_data_received = line_chart_received.map(item => item.totalAmount);

        const data = {
            labels: labels,
            datasets: [
                {
                    data: line_chart_data_paid,
                    label: 'Paid',
                    tension: 0.4,
                },
                {
                    data: line_chart_data_received,
                    label: 'Received',
                    tension: 0.4,
                },
            ]
        };
        const options = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
        };

        setChartData(data);
        setChartOptions(options);
    }, [insightData]);

    const categoryValueTemplate = (option) => {
        return <Tag value={option} severity={categorySeverity[option]} style={{ whiteSpace: 'nowrap' }} />;
    };

    return (
        <>
            <div className="card d-flex justify-content-center" >
                <div>
                    <div className='d-flex justify-content-around align-items-center header-insight-p' >
                        <h4>{titleHeader}</h4>
                    </div>
                    {
                        filter &&
                        <div className='d-flex justify-content-around row px-2'>
                            <Dropdown
                                value={selectedChartType}
                                options={chartTypeOptions1}
                                onChange={(e) => setSelectedChartType(e.value)}
                                optionLabel="value"
                                optionValue='value'
                                valueTemplate={selectedDropdownIconValueTemplate}
                                itemTemplate={dropdownIconValueTemplate}
                                placeholder="Select a Type"
                                checkmark={true}
                                className="col-md-auto my-1 chart-type"
                                style={{ minWidth: '15ch' }}
                            />

                            <MultiSelect
                                value={selectedCategories}
                                options={categories}
                                itemTemplate={categoryValueTemplate}
                                onChange={(e) => setSelectedCategories(e.value)}
                                placeholder="Select Categories"
                                display='chip'
                                className="col-md-auto my-1"
                                style={{ width: '14rem' }}
                            />

                            <Calendar
                                value={dates}
                                onChange={(e) => setDates(e.value)}
                                placeholder='Select range'
                                selectionMode="range"
                                readOnlyInput
                                hideOnRangeSelection
                                showButtonBar
                                className='col-md-auto my-1'
                            />
                        </div>
                    }
                </div>
                <Chart
                    type={selectedChartType}
                    data={chartData}
                    options={chartOptions}
                    className="w-full md:w-30rem"
                    style={{ height: chartHeight }}
                />
            </div>
        </>
    );
}

function InsightMonthYearTypeTotalAmount({ chartHeight = '30rem' }) {
    const { API_URL, setToastMsg } = useContext(GlobalDataContext);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [insightData, setInsightData] = useState([]);



    useEffect(() => {
        getInsightData({
            API_URL: API_URL,
            monthYearTypeInsight: true,
            setMonthYearTypeInsightData: setInsightData,
            setToastMsg: setToastMsg,
        });
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const bar_chart_paid = insightData.filter((item, index) => { return item.type === "Paid"; });
        const bar_chart_received = insightData.filter((item, index) => { return item.type === "Received"; });

        const labels = bar_chart_paid.map(item => item.yearMonth);
        const bar_chart_data_paid = bar_chart_paid.map(item => item.totalAmount);
        const bar_chart_data_received = bar_chart_received.map(item => item.totalAmount);

        const data = {
            labels: labels,
            datasets: [
                {
                    data: bar_chart_data_paid,
                    label: "Paid",
                },
                {
                    data: bar_chart_data_received,
                    label: "Received",
                },
            ]
        };
        const options = {};

        setChartData(data);
        setChartOptions(options);
    }, [insightData]);


    return (
        <>
            <div className="card d-flex justify-content-center">
                <div className='d-flex justify-content-center align-items-center p-2 header-insight-p'>
                    <h4 className='m-auto' >Total Monthly Expenses</h4>
                </div>

                <Chart type="bar" data={chartData} options={chartOptions} className="w-full md:w-30rem" inputMode='text' style={{ height: chartHeight }} />
            </div>
        </>
    );
}

function Insights(props) {
    return (
        <>
            {console.log('- insights page')}
            <div className='row w-100 m-auto'>
                <div className='col-md-4 container p-1' >
                    <InsightCategoryTypeTotalAmount filter />
                </div>

                <div className='col-md-8 container p-1' >
                    <InsightDateTypeTotalAmount filter />
                </div>

                <div className='col-md-6 container p-1' >
                    {/* <InsightCategoryTypeTotalAmount /> */}
                    <InsightMonthYearTypeTotalAmount chartHeight='25rem' />
                </div>

                <div className='col-md-6 container p-1' >
                    <InsightDateTypeTotalAmount daysCount={7} chartHeight='25rem' titleHeader='Expense of Last 7 Days' />
                </div>
            </div>

        </>
    );
}

export { InsightCategoryTypeTotalAmount, InsightDateTypeTotalAmount, InsightMonthYearTypeTotalAmount };
export default Insights;