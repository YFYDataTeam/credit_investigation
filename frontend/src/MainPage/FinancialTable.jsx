import React from "react";

const FinancialTable = ({ title, data }) => {
  return (
    <div>
      <h2>{title}</h2>
      <table border="1" className="dataframe">
        <thead>
          <tr>
            <th>財務年</th>
            <th>季度</th>
            <th>會計項目</th>
            <th>本年金額</th>
            <th>占比(%)</th>
            <th>去年金額</th>
            <th>占比(%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.period_year}</td>
              <td>{row.season}</td>
              <td>{row.acct_name}</td>
              <td>{row.this_year_amt}</td>
              <td>{row.this_year_percent}</td>
              <td>{row.last_year_amt}</td>
              <td>{row.last_year_percent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialTable;
