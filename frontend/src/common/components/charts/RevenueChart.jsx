import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar, Chart, Line } from 'react-chartjs-2';

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
        tension: 0.4, // Smooth lines
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
        text: 'Monthly Sales',
        font: { size: 18 },
      },
      legend: {
        display: false, // Hide the legend
      },
      datalabels: {
        display: false,
      },
    },
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
        yAxisID: 'y1',
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
        yAxisID: 'y2',
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
      y1: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          display: false, // Hide grid lines on y-axis
        },
        title: {
          display: true,
          text: 'Quarterly Sales',
        },
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          display: false, // Hide grid lines on y-axis
        },
        title: {
          display: true,
          text: 'QoQ',
        },
      },
    },
    plugins: {
      title: {
        display: true,
        align: 'center',
        text: 'Quarterly Sales Report',
        font: { size: 18 },
      },
      legend: {
        display: true, // Show the legend to distinguish between the datasets
      },
      datalabels: {
        display: false,
      },
    },
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
        yAxisID: 'y1',
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
        yAxisID: 'y2',
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
      y1: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          display: false, // Hide grid lines on y-axis
        },
        title: {
          display: true,
          text: 'Annual Sales',
        },
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          display: false, // Hide grid lines on y-axis
        },
        title: {
          display: true,
          text: 'YoY',
        },
      },
    },
    plugins: {
      title: {
        display: true,
        align: 'center',
        text: 'Annual Sales and YoY',
        font: {
          size: 18,
          fontColor: 'red',
        },
      },
      legend: {
        display: true, // Show the legend to distinguish between the datasets
      },
      datalabels: {
        display: false,
      },
    },
  };

  return (
    <div className="sub_container">
      <Chart data={chartData} options={options} />
    </div>
  );
};

const MonthlyY2M = ({ y2mData }) => {
  function processY2Mdata(data) {
    const currentYear = new Date().getFullYear();
    const datasets = {};

    data.forEach(item => {
      const year = item.period_year;
      const month = item.period_month;

      if (!datasets[year]) {
        datasets[year] = {
          label: year.toString(),
          data: Array(12).fill(null),
          borderColor:
            year === currentYear
              ? 'rgba(255, 99, 132, 1)'
              : 'rgba(200, 200, 200, 1)',
          backgroundColor:
            year === currentYear
              ? 'rgba(255, 99, 132, 0.2)'
              : 'rgba(200, 200, 200, 0.2)',
          // fill: false,
          tension: 0.1,
        };
      }
      datasets[year].data[month - 1] = item.sales; // Populate the sales data for the correct month
    });

    // Other years in descending order
    function compareNumbers(b, a) {
      return a - b;
    }
    // Convert datasets object to an array and sort it so the current year is first
    const sortedDatasets = Object.values(datasets).sort((a, b) => {
      if (a.label === currentYear.toString()) return -1; // Current year first
      if (b.label === currentYear.toString()) return -1; // double check Current year first
      return compareNumbers(a.label, b.label);
    });

    return sortedDatasets;
  }

  const labels = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ];
  const datasets = processY2Mdata(y2mData);

  const config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false, // Hide grid lines on x-axis
          },
          title: {
            display: true,
            text: 'Month',
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: false, // Hide grid lines on y-axis
          },
          title: {
            display: true,
            text: 'Sales',
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: 'Year to Month Sales',
          font: {
            size: 18,
          },
        },
        legend: {
          display: true, // Show the legend to distinguish between the datasets
        },
        datalabels: {
          display: false,
        },
      },
    },
  };
  console.log('config.data:', config.data);
  return (
    <div className="sub_container">
      <Line data={config.data} options={config.options} />
    </div>
  );
};

export { MonthlySalesChart, QuarterlySalesChart, YearlySalesChart, MonthlyY2M };
