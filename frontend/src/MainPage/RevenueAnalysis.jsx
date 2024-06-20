import React, { useState, useEffect } from "react";
import Container from "./Container";
import {
  MonthlySalesChart,
  QuarterlySalesChart,
  YearlySalesChart,
  MonthlyY2M,
} from "./RevenueChart";

const RevenueAnalysis = ({ endPoint, companyId }) => {
  const [revenueAnalysis, setRevenueAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId !== "") {
        try {
          setLoading(true);
          const response = await fetch(
            `${endPoint}revenue_analysis/${companyId}`
          );
          if (!response.ok) {
            throw new Error("Data not found.");
          }

          const data = await response.json();
          setRevenueAnalysis({
            monthly_sales: data.monthly_sales,
            quarterly_sales: data.quarterly_sales,
            annual_sales: data.annual_sales,
            monthly_y2m: data.monthly_y2m,
          });
        } catch (error) {
          console.error("Error fetching data", error);
          setRevenueAnalysis(null);
        } finally {
          setLoading(false);
        }
      } else {
        try {
          await fetch(`${endPoint}reset_company_id`);
        } catch (error) {
          console.error("Error resetting company ID", error);
        }
      }
    };

    fetchData();
  }, [companyId, endPoint]);

  if (!companyId) {
    return (
      <Container title="營運績效">
        <p>請提供公司 ID。</p>
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

  if (!revenueAnalysis && !loading) {
    return (
      <Container title="營運績效">
        <p>查無資料</p>
      </Container>
    );
  }

  const labels_monthly_sales = revenueAnalysis.monthly_sales.map(
    (item) => item.period
  );
  const monthly_sales_data = revenueAnalysis.monthly_sales.map(
    (item) => item.sales
  );

  const labels_yq = revenueAnalysis.quarterly_sales.map(
    (item) => item.year_quarter
  );
  const quarterly_sales_data = revenueAnalysis.quarterly_sales.map(
    (item) => item.year_quarter_sales
  );
  const sales_qoq_data = revenueAnalysis.quarterly_sales.map(
    (item) => item.QoQ
  );

  const labels_y = revenueAnalysis.annual_sales.map((item) =>
    item.period_year.toString()
  );
  const annual_sales_data = revenueAnalysis.annual_sales.map(
    (item) => item.annual_sales
  );
  const sales_yoy_data = revenueAnalysis.annual_sales.map((item) => item.YoY);

  const y2m_data = revenueAnalysis.monthly_y2m;

  return (
    <Container title="營運績效">
      <YearlySalesChart
        labels={labels_y}
        annualSales={annual_sales_data}
        yoyData={sales_yoy_data}
      />
      <QuarterlySalesChart
        labels={labels_yq}
        quarterlySales={quarterly_sales_data}
        qoqData={sales_qoq_data}
      />
      <MonthlySalesChart
        labels={labels_monthly_sales}
        salesData={monthly_sales_data}
      />
      <MonthlyY2M y2mData={y2m_data} />
    </Container>
  );
};

export default RevenueAnalysis;
