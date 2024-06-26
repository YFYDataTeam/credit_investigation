import React, { useEffect, useState } from 'react';

import FinancialTable from '@/common/components/charts/FinancialTable';
import useConditionalRendering from '@/common/components/hooks/useConditionalRendering';
import useFetchData from '@/common/components/hooks/useFetchData';
import textContent from '@/common/components/utils/textContent';
import '@assets/css/financialreport.css';
import '@assets/css/financialtable.css';

import Container from './Container';

// Add this line to import the custom CSS

const description = textContent.revRep.des;
const nodatamessage = textContent.revRep.msg;
const title = textContent.revRep.title;

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

  const conditionalContent = useConditionalRendering(
    title,
    description,
    nodatamessage,
    companyId,
    loading,
    financialReport
  );

  if (conditionalContent) {
    return conditionalContent;
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
