import React, { useState, useEffect } from "react";
import Container from "./Container";
import FinancialTable from "../common/components/charts/FinancialTable"; 
import '../../assets/css/financialtable.css';

const formatFinancialData = (data) => {
  return data.map(item => ({
    ...item,
    this_year_amt: item.this_year_amt.toLocaleString(),
    last_year_amt: item.last_year_amt.toLocaleString()
  }));
};

const FinancialReport = ({endPoint, companyId}) => {
  const [financialReport, setFinancialReport] = useState(null);
	const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if(companyId !== ''){
        try {
            setLoading(true);
            const response = await fetch(`${endPoint}financial_report/${companyId}`);
            if (!response.ok) {
              throw new Error("Data not found.");
            }
    
            const data = await response.json();
            if (data.message === "NoData"){
              setFinancialReport(null);

          } else {
            const formattedCashflow = formatFinancialData(data.cashflow);
            const formattedBalance = formatFinancialData(data.balance);
            const formattedProfitloss = formatFinancialData(data.profitloss);
            setFinancialReport({
              cashflow: formattedCashflow,
              balance: formattedBalance,
              profitloss: formattedProfitloss
    
    
            });
          }
          setLoading(false);
          } catch (error) {
            console.error("Error fetching data", error);
            setFinancialReport(null);
          } finally {
            setLoading(false);
          }
      } else {
        await fetch(`${endPoint}reset_company_id`);
    }
      
    };

    fetchData();
  }, [companyId]);
  // console.log('balance:', financialReport.balance);
  if(!companyId){
    return (
        <Container title="財報報表">
        </Container>
    );
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
            <p>無相關資料</p>
        </Container>
    );
}
  return (
    <Container title="財報報表">
      {
        financialReport ? (
          <div>
            <FinancialTable title={<span className="small-title">資產負債表</span>}  data={financialReport.balance} />
            <FinancialTable title={<span className="small-title">損益表</span>} data={financialReport.profitloss} />
            <FinancialTable title={<span className="small-title">現金流量表</span>} data={financialReport.cashflow} />
          </div>
        ) : (
          <div><h3>查無資料</h3></div>
        )
      }
    </Container>
  );
};  

export default FinancialReport;
