import React from "react";
import { Bar } from 'react-chartjs-2';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    BarElement, 
    Title, 
    Tooltip, 
    Legend);

    const SalesQoQChart = ({ labels, qoqData }) => {
        const chartData = {
            labels: labels,
            datasets: [
                {
                    data: qoqData,
                    backgroundColor: qoqData.map(value => value <= 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)'),
                    borderColor: qoqData.map(value => value <= 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)'),
                    borderWidth: 1
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
                legend: {
                    display: false,  // Hide the legend
                }
            }
        };
    
        return (
            <div className="chart-container">
                <h2 className="chart-title">Sales QoQ</h2>
                <Bar data={chartData} options={options} />
            </div>
        );
    };
    
    export default SalesQoQChart;


// const SalesYouChart