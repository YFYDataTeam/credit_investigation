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
  plugins,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Chart, Line } from 'react-chartjs-2';

import textContent from '@/common/components/utils/textContent';

import Container from './Container';

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

const description = textContent.cdd.des;
const nodatamessage = textContent.cdd.msg;

const CddResult = ({ endPoint, companyId }) => {
  const [cddAnalysis, setCddAnalysis] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId !== '') {
        try {
          setLoading(true);
          const response = await fetch(`${endPoint}cdd_result/${companyId}`);

          if (!response.ok) {
            throw new Error('Error fetching data');
          }

          const data = await response.json();

          if (data.message === 'NoData') {
            setCddAnalysis(null);
          } else {
            setCddAnalysis({ cdd_result: data.cdd_weekly_clustering });
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setCddAnalysis(null);
        } finally {
          setLoading(false);
        }
      } else {
        await fetch(`${endPoint}reset_company_id`);
      }
    };

    fetchData();
  }, [companyId, endPoint]);

  if (!companyId) {
    return <Container title="每周信用評分結果"></Container>;
  }

  if (loading) {
    return (
      <Container title="每周信用評分結果">
        <p>Loading...</p>
      </Container>
    );
  }

  if (!cddAnalysis && !loading) {
    return (
      <Container title="每周信用評分結果">
        <p className="description">{description}</p>
        <p className="message">{nodatamessage}</p>
      </Container>
    );
  }

  const label_week = cddAnalysis.cdd_result.map(item => item.week_date);
  const cred_invest_result = cddAnalysis.cdd_result.map(
    item => item.cred_invest_result
  );

  if (companyId && cddAnalysis) {
    return (
      <Container title="每周信用評分結果">
        <p className="description">{description}</p>
        <CddResultPlot labels={label_week} cred_data={cred_invest_result} />
      </Container>
    );
  }
};

export default CddResult;

const CddResultPlot = ({ labels, cred_data }) => {
  const getColor = value => {
    switch (value.toLowerCase()) {
      case 'green':
        return 'green';
      case 'red':
        return 'red';
      case 'yellow':
        return 'darkorange';
      default:
        return 'black';
    }
  };
  const getNumericValue = value => {
    switch (value.toLowerCase()) {
      case 'green':
        return 1;
      case 'yellow':
        return 2;
      case 'red':
        return 3;
      default:
        return 0;
    }
  };
  const pointColors = cred_data.map(value => getColor(value));
  const numericValues = cred_data.map(value => getNumericValue(value));
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: numericValues,
        borderColor: 'black',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 6, // Bigger node size
        pointHoverRadius: 8, // Bigger hover node size
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        display: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: '信用評估',
        },
        ticks: {
          callback: value => {
            switch (value) {
              case 1:
                return '綠燈';
              case 2:
                return '黃燈';
              case 3:
                return '紅燈';
              default:
                return '';
            }
          },
        },
      },
    },
    plugins: {
      title: {
        display: false,
        align: 'center',
        text: '信用評估燈號紀錄',
        font: {
          size: 18,
          color: 'red',
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        display: false,
      },
    },
  };
  return (
    <div className="cdd-chart">
      <Chart type="line" data={chartData} options={options} />
    </div>
  );
};
