import React, { useState, useEffect } from "react";
import Container from "./Container";
import FinancialTable from "./FinancialTable"; 
import '../../assets/css/financialtable.css';



const FinancialReport = ({end_point, companyId}) => {
  const [financialReport, setFinancialReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${end_point}financial_report`);
        if (!response.ok) {
          throw new Error("Data not found.");
        }

        const data = await response.json();
        // console.log('Fetched Data:', data);
        setFinancialReport({
          cashflow: data.cashflow,
          balance: data.balance,
          profitloss: data.profitlost
        });

      } catch (error) {
        console.error("Error fetching data", error);
        setFinancialReport(null);
      }
    };

    fetchData();
  }, [companyId]);

  if(!companyId){
    return (
        <Container title="財報報表">
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
