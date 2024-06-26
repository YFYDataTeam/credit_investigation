import React, { useEffect, useState } from 'react';

import useFetchData from '@/common/components/hooks/useFetchData';
import CustomBarChart from '@/common/components/utils/EpaChartFunc';
import textContent from '@/common/components/utils/textContent';
import '@assets/css/epareport.css';

import Container from './Container';

const description = textContent.epa.des;
const nodatamessage = textContent.epa.msg;

const EpaReport = ({ endPoint, companyId }) => {
  apiUrl = `${endPoint}epa_report`;
  // const [epaAnalysis, setEpareport] = useState(null);
  // const [loading, setLoading] = useState(true);

  const { loading, data: rawData, error } = useFetchData(apiUrl, companyId);

  let epaAnalysis = null;
  if (rawData && rawData.message !== 'NoData') {
    epaAnalysis = {
      penaltykind_count: rawData.penaltykind_count,
      penaltykind_total_money: rawData.penaltykind_total_money,
      improve_state: rawData.improve_state,
      penaltykind_unpay: rawData.penaltykind_unpay,
    };
  } else if (!rawData) {
    epaAnalysis = null;
  }

  if (loading) {
    return (
      <Container title="環保署汙染裁處記錄分析">
        <p>Loading...</p>
      </Container>
    );
  }

  if (!epaAnalysis && !loading) {
    return (
      <Container title="環保署汙染裁處記錄分析" className="container-center">
        <p className="description">{description}</p>
        <p className="message">{nodatamessage}</p>
      </Container>
    );
  }

  const label_penaltykind_in_count = epaAnalysis.penaltykind_count.map(
    item => item.penaltykind
  );
  const penaltykind_counts = epaAnalysis.penaltykind_count.map(
    item => item.count
  );

  const label_penaltykind_in_money = epaAnalysis.penaltykind_total_money.map(
    item => item.penaltykind
  );
  const penaltykind_money = epaAnalysis.penaltykind_total_money.map(
    item => item.penaltykind_amount
  );

  // const label_penaltykind_in_improve = epaAnalysis.penaltykind_total_money.map(item => item.penaltykind);
  const label__improve = epaAnalysis.improve_state.map(item => item.is_improve);
  const is_improve_counts = epaAnalysis.improve_state.map(item => item.count);

  const label_paymentstate = epaAnalysis.penaltykind_unpay.map(
    item => item.paymentstate
  );
  const penaltykind_amount_payment_state = epaAnalysis.penaltykind_unpay.map(
    item => item.penaltykind_amount
  );

  // penaltykindcount
  const penaltykindcount_config = {
    title: '各類裁罰次數',
    nodatamsg: '無裁罰',
    color: {
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
  };
  const penaltykindmoney_config = {
    title: '各類裁罰金額統計',
    nodatamsg: '無裁罰',
    color: {
      backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light teal background
      borderColor: 'rgba(75, 192, 192, 1)', // Darker teal border
    },
  };
  const penaltykindimprove_config = {
    title: '要求改善項目統計',
    nodatamsg: '無要求改善項目',
    color: {
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
  };
  const paymentstate_config = {
    title: '各類裁罰次數',
    nodatamsg: '無未繳款',
    color: {
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
    },
  };

  return (
    <Container title="環保署汙染裁處記錄分析">
      <p className="description">{description}</p>
      <div className="grid-container">
        <CustomBarChart
          labels={label_penaltykind_in_count}
          data={penaltykind_counts}
          title={penaltykindcount_config.title}
          noDataMsg={penaltykindcount_config.nodatamsg}
          color={penaltykindcount_config.color}
        />
        <CustomBarChart
          labels={label_penaltykind_in_money}
          data={penaltykind_money}
          title={penaltykindmoney_config.title}
          noDataMsg={penaltykindmoney_config.nodatamsg}
          color={penaltykindmoney_config.color}
        />
        <CustomBarChart
          labels={label__improve}
          data={is_improve_counts}
          title={penaltykindimprove_config.title}
          noDataMsg={penaltykindimprove_config.nodatamsg}
          color={penaltykindimprove_config.color}
        />
        <CustomBarChart
          labels={label_paymentstate}
          data={penaltykind_amount_payment_state}
          title={paymentstate_config.title}
          noDataMsg={paymentstate_config.nodatamsg}
          color={paymentstate_config.color}
        />
      </div>
    </Container>
  );
};

export default EpaReport;

//TEST
