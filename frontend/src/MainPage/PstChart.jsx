import React from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, Filler } from 'chart.js';
import { Chart, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    Filler
);


const AnnualAgreementPlot = ({labels, annual_total_agreement_amount, annual_agreement_count}) => {
    console.log("label_agreement",labels);
    const chartData = {
        labels : labels,
        datasets: [
            {
                type: 'bar',
                label: '金額(NTD)',
                data: annual_total_agreement_amount,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            },
            {
                type: 'line',
                label: '每年擔保案件數',
                data: annual_agreement_count,
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
                    text: '每年擔保總金額'
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
                    text: '每年擔保案件數'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                align: 'center',
                text: "每年擔保金額與次數",
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

    return  (
        <div className="sub_container">
            <Chart data={chartData} options={options} />
        </div>
    );
};





export {AnnualAgreementPlot};