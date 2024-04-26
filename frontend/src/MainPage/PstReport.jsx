import React, { useState, useEffect } from 'react';
import Container from "./Container";
import config from '../../public/configs.json';

const end_point = config.endpoint;
const year_region = config.year_region;

const getCurrencyCode = (currencyName) => {
    const currencyMap = {
        '新台幣': 'TWD',  // New Taiwan Dollar
        '日圓': 'JPY',    // Japanese Yen
        '美金': 'USD'     // US Dollar
    };

    return currencyMap[currencyName] || currencyName;  // default to the original if not found
};

function CurrencyAgreements() {
    const [agreements, setAgreements] = useState([]);
    const [pieChart, setPieChart] = useState('');
    const [lineChart, setLineChart] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${end_point}pst_report?time_config=past&year_region=${year_region}`)  // Modify query params as needed
            .then(response => response.json())
            .then(data => {
                setAgreements(data.total_agreement_currency || []);
                setPieChart(data.pst_type_distribution || '');
                setLineChart(data.pst_enddate_over_year || '');
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container title="動產擔保分析">
        <div>
            {agreements.length > 0 ? (
                <div>
                    <table>
                        <thead>
                            <tr>
                                #TODO : change the column name
                                <th>Currency</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agreements.map((agreement, index) => (
                                <tr key={index}>
                                    <td>{getCurrencyCode(agreement.currency)}</td>
                                    <td>{agreement.total_amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <h2>抵押品類別分布</h2>
                        <img src={`data:image/png;base64,${pieChart}`} alt="Pie Chart of Type Distribution" />
                    </div>
                    <div>
                        <h2>年度動產擔保到期次數</h2>
                        <img src={`data:image/png;base64,${lineChart}`} alt="Line Chart of Agreement Expiry by Year" />
                    </div>
                </div>
            ) : (
                <h3>查無資料</h3>
            )}
        </div>
        </Container>
    );
}

export default CurrencyAgreements;
