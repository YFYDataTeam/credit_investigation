import React from 'react';

import { AnnualAgreementPlot } from '@/common/components/charts/PstChart';
import useFetchData from '@/common/components/hooks/useFetchData';
import textContent from '@/common/components/utils/textContent';

import Container from './Container';

const description = textContent.pst.des;
const nodatamessage = textContent.pst.msg;

const PstAnalysis = ({ endPoint, companyId }) => {
  const year_region = process.env.YEAR_REGION || 5;
  const apiUrl = `${endPoint}pst_report?time_config=past&year_region=${year_region}`;

  const { loading, data: pstAnalysis, error } = useFetchData(apiUrl, companyId);

  if (pstAnalysis)
    if (!companyId) {
      return <Container title="動產擔保分析"></Container>;
    }

  if (loading) {
    return (
      <Container title="動產擔保分析">
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container title="動產擔保分析">
        <p>Error: {error.message}</p>
      </Container>
    );
  }

  if (!pstAnalysis) {
    return (
      <Container title="動產擔保分析">
        <p className="description">{description}</p>
        <p className="message">{nodatamessage}</p>
      </Container>
    );
  }

  const label_agreement = pstAnalysis.annualAgreement.map(
    item => item.agreement_end_year
  );
  const annual_total_agreement_amount = pstAnalysis.annualAgreement.map(
    item => item.total_agreement_amount
  );
  const annual_agreement_count = pstAnalysis.annualAgreement.map(
    item => item.agreement_count
  );

  return (
    <Container title="動產擔保分析">
      <p className="description">{description}</p>
      <AnnualAgreementPlot
        labels={label_agreement}
        annual_total_agreement_amount={annual_total_agreement_amount}
        annual_agreement_count={annual_agreement_count}
      />
    </Container>
  );
};

export default PstAnalysis;
