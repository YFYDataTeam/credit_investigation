import React from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import { Chart, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend,
    PointElement
);

const MonthlySalesChart = ({ labels, salesData }) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: salesData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light blue fill
                borderColor: 'rgba(54, 162, 235, 1)', // Blue line
                borderWidth: 1,
                fill: true,
                tension: 0.4 // Smooth lines
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false // Hide grid lines on x-axis
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: {
                    display: false // Hide grid lines on y-axis
                }
            }
        },
        plugins: {
            title:{
                display:true,
                align: 'center',
                text: "Monthly Sales",
                font:{size:18}
            },
            legend: {
                display: false,  // Hide the legend
            }
        }
    };

    return (
        <div className="sub_container">
            <Line data={chartData} options={options} />
        </div>
    );
};

const QuarterlySalesChart = ({ labels, quarterlySales, qoqData }) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                type: 'bar',
                label: 'Quarterly Sales',
                data: quarterlySales,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            },
            {
                type: 'line',
                label: 'QoQ',
                data: qoqData,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: false,
                tension: 0.5,
                yAxisID: 'y2'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false // Hide grid lines on x-axis
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: {
                    display: false // Hide grid lines on y-axis
                },
                title: {
                    display: true,
                    text: 'Quarterly Sales'
                }
            },
            y2: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    display: false // Hide grid lines on y-axis
                },
                title: {
                    display: true,
                    text: 'QoQ'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                align: 'center',
                text: "Quarterly Sales Report",
                font: {size: 18}
            },
            legend: {
                display: true,  // Show the legend to distinguish between the datasets
            }
        }
    };

    return (
        <div className="sub_container">
            <Chart data={chartData} options={options} />
        </div>
    );
};


const YearlySalesChart = ({ labels, annualSales, yoyData }) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                type: 'bar',
                label: 'Yearly Sales',
                data: annualSales,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            },
            {
                type: 'line',
                label: 'YoY',
                data: yoyData,
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderWidth: 2,
                fill: false,
                tension: 0.5,
                yAxisID: 'y2'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false // Hide grid lines on x-axis
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: {
                    display: false // Hide grid lines on y-axis
                },
                title: {
                    display: true,
                    text: 'Annual Sales'
                }
            },
            y2: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    display: false // Hide grid lines on y-axis
                },
                title: {
                    display: true,
                    text: 'YoY'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                align: 'center',
                text: "Annual Sales and YoY",
                font: {
                    size: 18,
                    fontColor: 'red'
                },
            },
            legend: {
                display: true,  // Show the legend to distinguish between the datasets
            }
        }
    };

    return (
        <div className="sub_container">
            <Chart data={chartData} options={options} />
        </div>
    );
};

export {MonthlySalesChart, QuarterlySalesChart,  YearlySalesChart};