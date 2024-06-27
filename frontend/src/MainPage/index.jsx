import React, { useRef, useState } from 'react';

import '@assets/css/title_section.css';

import BasicInfo from './BasicInfo';
import CddResult from './CddResult';
// import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Container from './Container';
import EpaReport from './EpaReport';
import FinancialReport from './FinancialReports';
import JudgementSummary from './JudgementSummary';
import PstReport from './PstReport';
import RevenueAnalysis from './RevenueAnalysis';

let endPoint = process.env.END_POINT;

const App = () => {
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [finalCompanyId, setFinalCompanyId] = useState('');
  const [finalCompanyName, setFinalCompanyName] = useState('');
  const [token, setToken] = useState('');
  const [isValidUser, setIsValidUser] = useState(true);

  const basicInfoRef = useRef(null);

  const handleSearchClick = async () => {
    const company_id = companyId.trim();
    try {
      if (company_id === '') {
        throw new Error('No company ID entered.');
      }
      setFinalCompanyId(company_id);
    } catch (e) {
      alert(e.message);
    }
  };

  // useEffect(() => {
  //     // Fetch the token when the component mounts
  //     const storedToken = localStorage.getItem('token');
  //     if (storedToken) {
  //         setToken(storedToken);
  //     }
  // }, []);

  // useEffect(() => {
  //     // Check if the token is already in cookies
  //     const cookieToken = Cookies.get('token');
  //     if (cookieToken) {
  //         localStorage.setItem('token', cookieToken);
  //         setToken(cookieToken);
  //     } else {
  //         setIsValidUser(false);
  //     }
  // }, []);

  // const fetchWithToken = async (url) => {
  //     const response = await fetch(url, {
  //         headers: {
  //             'Authorization': `Bearer ${token}`
  //         }
  //     });
  //     if (response.status === 401) {
  //         throw new Error('Unauthorized');
  //     }
  //     return response.json();
  // };

  // if (!isValidUser) {
  //     return <Redirect to="/invalid-user" />;
  // }

  return (
    <div>
      <section className="welcome-hero">
        <div className="header-text">
          <h1>徵信報告</h1>
          <p className="subheading">
            {/* 透過大型語言模型(LLM)根據公司新聞、公開資訊及財務紀錄進行信用評分 */}
            整合公司基本資訊、財部報表、公示資料等資料，快速評估公司運營情況
          </p>
        </div>
      </section>

      <Container title="輸入公司統編">
        <div className="input-container">
          <input
            type="number"
            value={companyId}
            onChange={e => {
              setCompanyId(e.target.value);
            }}
          />
          <button disabled={isLoading} onClick={handleSearchClick}>
            {' '}
            查詢
          </button>

          {/* <button
                disabled={isLoading}
                onClick={async (e) => {
                    const company_name_input = companyName.trim();

                    try {
                        if (company_name_input === ""){
                            throw Error("No company name entered.")
                        }

                        // Set FinalCompanyID once input is validated and complete to prevent premature API calls
                        setFinalCompanyName(company_name_input);
                        const encodedCompanyName = encodeURIComponent(company_name_input);
                        const response = await fetch(`${end_point}/setup/${company_name_input}`);
                        const result = await response;
                        console.log("response outside", response)
                        setFinalCompanyId(company_id);
                        // Call set_up API to get

                    } catch (e) {
                        alert(e.message);
                    }
                    
                }}
            
            </button> */}
        </div>
      </Container>

      {/* {finalCompanyId && <BasicInfo end_point={endPoint} companyId={finalCompanyId}></BasicInfo>} */}

      {!!finalCompanyId && (
        <div ref={basicInfoRef}>
          <BasicInfo endPoint={endPoint} companyId={finalCompanyId} />
        </div>
      )}

      {!!finalCompanyId && (
        <CddResult endPoint={endPoint} companyId={finalCompanyId}></CddResult>
      )}

      {!!finalCompanyId && (
        <RevenueAnalysis endPoint={endPoint} companyId={finalCompanyId} />
      )}

      {!!finalCompanyId && (
        <FinancialReport endPoint={endPoint} companyId={finalCompanyId} />
      )}

      {/* {finalCompanyId && (
        <JudgementSummary endPoint={endPoint} companyId={finalCompanyId} />
      )} */}

      {!!finalCompanyId && (
        <EpaReport endPoint={endPoint} companyId={finalCompanyId}></EpaReport>
      )}

      {!!finalCompanyId && (
        <PstReport endPoint={endPoint} companyId={finalCompanyId}></PstReport>
      )}
    </div>
  );
};

export default App;
