import React, {useState, useEffect} from "react";
import Container from "./Container";
import { Line } from 'react-chartjs-2';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenueAnalysis = ({end_point, companyId}) => {
    const [revenueAnalysis, setRevenueAnalysis] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${end_point}revenue_analysis`);
                if (!response.ok) {
                    throw new Error("Data not found.");
                  }
    
                const data = await response.json();
                setRevenueAnalysis({
                    sales_qoq: data.sales_qoq,
                });

            } catch (error) {
                console.error("Error fetching data", error);
                setRevenueAnalysis(null);
            }
        };

        fetchData();

    }, [companyId]);

    if(!revenueAnalysis){
        return <div>Loading...</div>
    }

    const labels = revenueAnalysis.sales_qoq.map(item => item.year_quarter);
    const salesData = revenueAnalysis.sales_qoq.map(item => item.year_quarter_sales);
    const qoqData = revenueAnalysis.sales_qoq.map(item => item.QoQ);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Quarterly Sales',
                data: salesData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
            },
            {
                label: 'QoQ Growth',
                data: qoqData,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: false,
                yAxisID: 'y-axis-2',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            'y-axis-2': {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
        },
    };

    return (
        <Container title="Revenue Analysis">
            <div className="chart-container">
                <h2>Sales QoQ</h2>
                <Line data={chartData} options={options} />
            </div>
        </Container>
    );
};

export default RevenueAnalysis;
