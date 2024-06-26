import React, { useEffect, useRef, useState } from 'react';

import Container from '@/MainPage/Container';
import useFetchData from '@/common/components/hooks/useFetchData';
import '@assets/css/basicinfo.css';

const BasicInfo = ({ endPoint, companyId }) => {
  const apiUrl = `${endPoint}basicinfo/${companyId}`;
  const { loading, data: basicInfo, error } = useFetchData(apiUrl, companyId);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (basicInfo && basicInfo.message === 'NoData') {
      setErrorMessage('沒有找到相關公司資料。請確認公司統編是否輸入正確');
    }
  }, [basicInfo]);

  useEffect(() => {
    if (errorMessage) {
      alert(errorMessage);
    }
  }, [errorMessage]);

  const scrollAnchorRef = useRef(null);
  useEffect(() => {
    if (!companyId || loading) {
      return;
    }

    const scrollAnchor = scrollAnchorRef.current;

    if (!scrollAnchor) {
      return;
    }

    scrollAnchor.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  }, [companyId, loading]);

  if (!companyId) {
    return <Container title="營運績效"></Container>;
  }

  if (loading) {
    return (
      <Container title="公司基本資訊">
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container title="公司基本資訊">
        <p>Error: {error.message}</p>
      </Container>
    );
  }

  if (!basicInfo) {
    return (
      <Container title="公司基本資訊">
        <p>查無資料</p>
      </Container>
    );
  }

  let businessItems = [];
  if (basicInfo.busi_item) {
    try {
      businessItems = JSON.parse(basicInfo.busi_item).map(
        item => item.Business_Item_Desc
      );
    } catch (e) {
      console.error('Failed to parse busi_item:', e);
    }
  }

  return (
    <Container title="公司基本資訊" ref={scrollAnchorRef}>
      <div>
        <div className="info-row">
          <div className="info-column">
            <h3>公司名稱</h3>
            <p>{basicInfo.company_name}</p>
          </div>
          <div className="info-column">
            <h3>統一編號</h3>
            <p>{basicInfo.company_account}</p>
          </div>
          <div className="info-column">
            <h3>公司目前狀態</h3>
            <p>{basicInfo.company_status}</p>
          </div>
        </div>
        <div className="info-row">
          <div className="info-column">
            <h3>資本額</h3>
            <p>{basicInfo.company_captial}</p>
          </div>
          <div className="info-column">
            <h3>董事長</h3>
            <p>{basicInfo.chairman}</p>
          </div>
          <div className="info-column">
            <h3>董事</h3>
            <p>{basicInfo.directors}</p>
          </div>
        </div>
        <div className="info-row">
          <div className="info-column">
            <h3>營業項目</h3>
            <ul className="business-items">
              {businessItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BasicInfo;
