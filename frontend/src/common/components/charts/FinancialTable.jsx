import React from "react";
import '../../../../assets/css/financialtable.css'

const FinancialTable = ({ title, data }) => {
  return (
    <div className="table-container">
      <h2>{title}</h2>
      <table className="dataframe">
        <thead>
          <tr>
            <th>年度</th>
            <th>季度</th>
            <th>會計科目</th>
            <th>金額(今年)</th>
            <th>%(今年)</th>
            <th>金額(去年)</th>
            <th>%(去年)</th>
          </tr>
        </thead>
        <tbody>
          {data && Array.isArray(data) && data.map((row, index) => {
            if (row.this_year_amt === 0 && !row.acct_name.includes("股數")) {
              return (
                <tr key={index}>
                  <td className="center-content">{row.period_year}</td>
                  <td className="center-content">{row.season}</td>
                  <td className="center-content" colSpan="7">{row.acct_name}</td>
                </tr>
              );
            } else if (!row.acct_name.includes("股數")) {
              return (
                <tr key={index}>
                  <td className="center-content">{row.period_year}</td>
                  <td className="center-content">{row.season}</td>
                  <td className="center-content">{row.acct_name}</td>
                  <td className="center-content">{row.this_year_amt}</td>
                  <td className="center-content">{row.this_year_percent}</td>
                  <td className="center-content">{row.last_year_amt}</td>
                  <td className="center-content">{row.last_year_percent}</td>
                </tr>
              );
            }
            return null; // Add this to avoid returning undefined for rows that don't meet the criteria
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialTable;
