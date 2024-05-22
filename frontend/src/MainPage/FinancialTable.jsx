import React from "react";

const FinancialTable = ({ title, data }) => {
  return (
    <div>
      <h2>{title}</h2>
      <table border="1" className="dataframe">
        <thead>
          <tr>
            <th>period_year</th>
            <th>season</th>
            <th>acct_name</th>
            <th>this_year_amt</th>
            <th>this_year_percent</th>
            <th>last_year_amt</th>
            <th>last_year_percent</th>
          </tr>
        </thead>
        <tbody>
          {data && Array.isArray(data) && data.map((row, index) => {
            if (row.this_year_amt === 0 && !row.acct_name.includes("股數")) {
              return (
                <tr key={index}>
                  <td>{row.period_year}</td>
                  <td>{row.season}</td>
                  <td colSpan="5">{row.acct_name}</td>
                </tr>
              );
            } else if (!row.acct_name.includes("股數")) {
              return (
                <tr key={index}>
                  <td>{row.period_year}</td>
                  <td>{row.season}</td>
                  <td>{row.acct_name}</td>
                  <td>{row.this_year_amt}</td>
                  <td>{row.this_year_percent}</td>
                  <td>{row.last_year_amt}</td>
                  <td>{row.last_year_percent}</td>
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
