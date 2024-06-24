import React from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, Filler } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
  ChartDataLabels
); 



const CustomBarChart = ({ labels, data, color, title, noDataMsg }) => {
  if (!data || data.length === 0) {
    return <div className="sub_container">{noDataMsg}</div>;
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: color.backgroundColor,
        borderColor: color.borderColor,
        borderWidth: 1,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false, // Hide grid lines on x-axis
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          display: false, // Hide grid lines on y-axis
        },
      },
    },
    plugins: {
      title: {
        display: true,
        align: 'center',
        text: title,
        font: { size: 18 },
      },
      legend: {
        display: false, // Hide the legend
      },
      datalabels: {
        anchor: 'end',
        align: 'bottom',
        formatter: (value) => value,
        font: {
          size: 12,
        },
        color: 'black',
      },
      
    },
  };

  return (
    <div className="sub_container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CustomBarChart;
