import React, { useState, useEffect } from 'react';
import Container from "./Container";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, Filler, plugins } from 'chart.js';
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


const CddResult = ({end_point, companyId}) => {
    const [cddAnalysis, setCddAnalysis] = useState(null);
    const [loading, setLoading] = useState(null);
    
    useEffect(() => {
        const fetchData = async() => {
            if (companyId !== '') {
                try {
                    setLoading(true);
                    const response = await fetch(`${end_point}cdd_result`);
                    
                    if (!response.ok) {
                        throw new Error('Error fetching data');
                    }
    
                    const data = await response.json();
                    if (data.message === 'NoData') {
                        setCddAnalysis(null);
                    } else {
                        setCddAnalysis({cdd_result:data.cdd_weekly_category});
                    }
    
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                await fetch(`${end_point}reset_company_id`);
            }
                
        };

        fetchData();
    }, [companyId, end_point]);

    if(!cddAnalysis){
        return (
              <Container title="信用評估模型">
              </Container>
          );
      }


    const label_week = cddAnalysis.cdd_result.map(item => item.week_date);
    const cred_invest_result = cddAnalysis.cdd_result.map(item => item.cred_invest_result);
    return (
        <Container title="每周信用評分結果">
            <CddResultPlot
                labels={label_week}
                cred_data={cred_invest_result}
                />
        </Container>
    )
};

export default CddResult;


const CddResultPlot = ({labels, cred_data}) => {
    const getColor = (value) => {
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
    const getNumericValue = (value) => {
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
    const chartData ={
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
            }
        ]
    }
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                type: 'linear',
                display: true,
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: '信用評估'
                },
                ticks: {
                    callback: (value) => {
                        switch (value) {
                            case 1:
                                return 'green';
                            case 2:
                                return 'yellow';
                            case 3:
                                return 'red';
                            default:
                                return '';
                        }
                    }
                }
            }
        },
        plugins: {
            title: {
                display: false,
                align: 'center',
                text: "信用評估燈號紀錄",
                font: {
                    size: 18,
                    color: 'red'
                },
            },
            legend: {
                display: false,
            }
        }
    }
    return (
        <div className="sub_container">
             <Chart type='line' data={chartData} options={options} />
        </div>
    );
};
