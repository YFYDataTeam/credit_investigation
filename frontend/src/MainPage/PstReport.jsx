import React, { useState, useEffect } from 'react';
import Container from "./Container";

const year_region = process.env.YEAR_REGION;

const getCurrencyCode = (currencyName) => {
    const currencyMap = {
        '新台幣': 'TWD',
        '日圓': 'JPY',   
        '美金': 'USD'     
    };

    return currencyMap[currencyName] || currencyName; 
};

const CurrencyAgreements = ({end_point, companyId}) => {
    const [agreements, setAgreements] = useState(null);
    const [pieChart, setPieChart] = useState(null);
    const [lineChart, setLineChart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${end_point}pst_report?time_config=past&year_region=${year_region}`);
                if (!response.ok) {
                    throw new Error('Error fetching data');
                }
    
                const data = await response.json();
                console.log('pst companyid', companyId);
                console.log('pst data',data);
                if (data.message === 'NoData'){
                    setAgreements(null);
                    setPieChart(null);
                    setLineChart(null);
                } else {
                        
                    setAgreements(data.total_agreement_currency);
                    setPieChart(data.pst_type_distribution);
                    setLineChart(data.pst_enddate_over_year);

                }

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [companyId]);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    if(!agreements){
        return (
              <Container title="動產擔保分析">
              </Container>
          );
    }

    return (
        <Container title="動產擔保分析">
            {agreements ? (
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
        </Container>
    );
}

export default CurrencyAgreements;
