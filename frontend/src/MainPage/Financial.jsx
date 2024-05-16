import React, { useState, useEffect } from "react";
import Container from "./Container";
import FinancialTable from "./FinancialTable"; // Import the FinancialTable component
import config from '../../public/configs.json';

const end_point = config.endpoint;

const FinancialReport = ({ companyId }) => {
  const [financialReport, setFinancialReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${end_point}financial_report`);
        if (!response.ok) {
          throw new Error("Data not found.");
        }

        const data = await response.json();
        console.log('Fetched Data:', data);
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

  return (
    <Container title="財報分析part2">
      {
        financialReport ? (
          <div>
            <FinancialTable title='資產負債表' data={financialReport.balance} />
            <FinancialTable title='損益表' data={financialReport.profitloss} />
            <FinancialTable title='現金流量表' data={financialReport.cashflow} />
          </div>
        ) : (
          <div><h3>查無資料</h3></div>
        )
      }
    </Container>
  );
};

export default FinancialReport;
