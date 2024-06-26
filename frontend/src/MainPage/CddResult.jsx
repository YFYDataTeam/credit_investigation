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

import useConditionalRendering from '@/common/components/hooks/useConditionalRendering';
import useFetchData from '@/common/components/hooks/useFetchData';
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
const title = textContent.revRep.title;

const CddResult = ({ endPoint, companyId }) => {
  const apiUrl = `${endPoint}cdd_result/${companyId}`;
  const { loading, data: cddAnalysis, error } = useFetchData(apiUrl, companyId);

  const conditionalContent = useConditionalRendering(
    title,
    description,
    nodatamessage,
    companyId,
    loading,
    cddAnalysis
  );

  if (conditionalContent) {
    return conditionalContent;
  }

  const label_week = cddAnalysis.cdd_weekly_clustering.map(
    item => item.week_date
  );
  const cred_invest_result = cddAnalysis.cdd_weekly_clustering.map(
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
