import React, { useEffect, useState } from 'react';

import useFetchData from '@/common/components/hooks/useFetchData';
import textContent from '@/common/components/utils/textContent';

import Container from './Container';

const description = textContent.jud.des;
const nodatamessage = textContent.jud.msg;

const JudgementSummary = ({ endPoint, companyId }) => {
  const apiUrl = `${endPoint}judgement_summary/${companyId}`;
  const {
    loading,
    data: judgementSummary,
    error,
  } = useFetchData(apiUrl, companyId);

  if (!companyId) {
    return <Container title="法院判決摘要"></Container>;
  }

  if (loading) {
    return (
      <Container title="法院判決摘要">
        <p>Loading...</p>
      </Container>
    );
  }

  if (!judgementSummary && !loading) {
    return (
      <Container title="法院判決摘要">
        <p className="description">{description}</p>
        <p className="message">{nodatamessage}</p>
      </Container>
    );
  }

  return (
    <Container title="法院判決摘要">
      <p className="description">{description}</p>
      <table>
        <thead>
          <tr>
            <th>判決書名稱</th>
            <th>判決書摘要</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(judgementSummary).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
};

export default JudgementSummary;
