import React, { useState, useEffect } from "react";
import Container from "./Container";
import config from '../../public/configs.json';

const end_point = config.endpoint;

// Simplified as the API sends an array of records directly
const FinancialTable = ({ title, data }) => {
  return (
    <div>
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Period Year</th>
            <th>Season</th>
            <th>Account Name</th>
            <th>This Year Amount</th>
            <th>This Year Percent</th>
            <th>Last Year Amount</th>
            <th>Last Year Percent</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index}</td>
              <td>{item.period_year}</td>
              <td>{item.season}</td>
              <td>{item.acct_name}</td>
              <td>{item.this_year_amt}</td>
              <td>{item.this_year_percent}</td>
              <td>{item.last_year_amt}</td>
              <td>{item.last_year_percent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
          cashflow: data, // Example, adjust according to your API and data structure
          balance: data,  // Example, adjust according to your API and data structure
          profitloss: data // Example, adjust according to your API and data structure
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
            <FinancialTable title='現金流量表' data={financialReport.cashflow} />
            <FinancialTable title='資產負債表' data={financialReport.balance} />
            <FinancialTable title='損益表' data={financialReport.profitloss} />
          </div>
        ) : (
          <div><h3>查無資料</h3></div>
        )
      }
    </Container>
  );
};

export default FinancialReport;
