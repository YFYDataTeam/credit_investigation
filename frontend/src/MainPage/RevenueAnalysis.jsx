import React, { useEffect, useState } from 'react';

import {
  MonthlySalesChart,
  MonthlyY2M,
  QuarterlySalesChart,
  YearlySalesChart,
} from '@/common/components/charts/RevenueChart';
import useConditionalRendering from '@/common/components/hooks/useConditionalRendering';
import useFetchData from '@/common/components/hooks/useFetchData';
import textContent from '@/common/components/utils/textContent';

import Container from './Container';

const description = textContent.revAna.des;
const nodatamessage = textContent.revAna.msg;
const title = textContent.revAna.title;

const RevenueAnalysis = ({ endPoint, companyId }) => {
  const apiUrl = `${endPoint}revenue_analysis/${companyId}`;
  const { loading, data: rawData, error } = useFetchData(apiUrl, companyId);

  let revenueAnalysis = null;
  if (rawData && rawData.message !== 'NoData') {
    revenueAnalysis = {
      monthly_sales: rawData.monthly_sales,
      quarterly_sales: rawData.quarterly_sales,
      annual_sales: rawData.annual_sales,
      monthly_y2m: rawData.monthly_y2m,
    };
  } else if (!rawData) {
    revenueAnalysis = null;
  }

  const conditionalContent = useConditionalRendering(
    title,
    description,
    nodatamessage,
    companyId,
    loading,
    revenueAnalysis
  );

  if (conditionalContent) {
    return conditionalContent;
  }

  const labels_monthly_sales = revenueAnalysis.monthly_sales.map(
    item => item.period
  );
  const monthly_sales_data = revenueAnalysis.monthly_sales.map(
    item => item.sales
  );

  const labels_yq = revenueAnalysis.quarterly_sales.map(
    item => item.year_quarter
  );
  const quarterly_sales_data = revenueAnalysis.quarterly_sales.map(
    item => item.year_quarter_sales
  );
  const sales_qoq_data = revenueAnalysis.quarterly_sales.map(item => item.QoQ);

  const labels_y = revenueAnalysis.annual_sales.map(item =>
    item.period_year.toString()
  );
  const annual_sales_data = revenueAnalysis.annual_sales.map(
    item => item.annual_sales
  );
  const sales_yoy_data = revenueAnalysis.annual_sales.map(item => item.YoY);

  const y2m_data = revenueAnalysis.monthly_y2m;

  return (
    <Container title="營運績效">
      <p className="description">{description}</p>
      <div className="grid-container">
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
      </div>
    </Container>
  );
};

export default RevenueAnalysis;
