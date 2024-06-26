import React, { useEffect, useState } from 'react';

import FinancialTable from '@/common/components/charts/FinancialTable';
import useFetchData from '@/common/components/hooks/useFetchData';
import textContent from '@/common/components/utils/textContent';
import '@assets/css/financialreport.css';
import '@assets/css/financialtable.css';

import Container from './Container';

// Add this line to import the custom CSS

const description = textContent.revRep.des;
const nodatamessage = textContent.revRep.msg;

const formatFinancialData = data => {
  return data.map(item => ({
    ...item,
    this_year_amt: item.this_year_amt.toLocaleString(),
    last_year_amt: item.last_year_amt.toLocaleString(),
  }));
};

const FinancialReport = ({ endPoint, companyId }) => {
  const apiUrl = `${endPoint}financial_report/${companyId}`;
  const { loading, data: rawData, error } = useFetchData(apiUrl, companyId);
  const [showBalance, setShowBalance] = useState(false);
  const [showProfitloss, setShowProfitloss] = useState(false);
  const [showCashflow, setShowCashflow] = useState(false);

  let financialReport = null;
  if (rawData && rawData.message !== 'NoData') {
    financialReport = {
      cashflow: formatFinancialData(rawData.cashflow),
      balance: formatFinancialData(rawData.balance),
      profitloss: formatFinancialData(rawData.profitloss),
    };
  } else if (!rawData) {
    financialReport = null;
  }
  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (companyId !== '') {
  //       try {
  //         setLoading(true);
  //         const response = await fetch(
  //           `${endPoint}financial_report/${companyId}`
  //         );
  //         if (!response.ok) {
  //           throw new Error('Data not found.');
  //         }

  //         const data = await response.json();
  //         if (data.message === 'NoData') {
  //           setFinancialReport(null);
  //         } else {
  //           const formattedCashflow = formatFinancialData(data.cashflow);
  //           const formattedBalance = formatFinancialData(data.balance);
  //           const formattedProfitloss = formatFinancialData(data.profitloss);
  //           setFinancialReport({
  //             cashflow: formattedCashflow,
  //             balance: formattedBalance,
  //             profitloss: formattedProfitloss,
  //           });
  //         }
  //         setLoading(false);
  //       } catch (error) {
  //         console.error('Error fetching data', error);
  //         setFinancialReport(null);
  //       } finally {
  //         setLoading(false);
  //       }
  //     } else {
  //       await fetch(`${endPoint}reset_company_id`);
  //     }
  //   };

  //   fetchData();
  // }, [companyId]);

  if (!companyId) {
    return <Container title="財報報表"></Container>;
  }

  if (loading) {
    return (
      <Container title="營運績效">
        <p>Loading...</p>
      </Container>
    );
  }

  if (!financialReport) {
    return (
      <Container title="財報報表">
        <p className="description">{description}</p>
        <p className="message">{nodatamessage}</p>
      </Container>
    );
  }

  return (
    <Container title="財報報表">
      <p className="description">{description}</p>
      <div>
        <div className="financial-section">
          <span className="small-title">資產負債表</span>
          <button
            className="toggle-button"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? '▼' : '▶'}
          </button>
        </div>
        {showBalance && <FinancialTable data={financialReport.balance} />}

        <div className="financial-section">
          <span className="small-title">損益表</span>
          <button
            className="toggle-button"
            onClick={() => setShowProfitloss(!showProfitloss)}
          >
            {showProfitloss ? '▼' : '▶'}
          </button>
        </div>
        {showProfitloss && <FinancialTable data={financialReport.profitloss} />}

        <div className="financial-section">
          <span className="small-title">現金流量表</span>
          <button
            className="toggle-button"
            onClick={() => setShowCashflow(!showCashflow)}
          >
            {showCashflow ? '▼' : '▶'}
          </button>
        </div>
        {showCashflow && <FinancialTable data={financialReport.cashflow} />}
      </div>
    </Container>
  );
};

export default FinancialReport;
