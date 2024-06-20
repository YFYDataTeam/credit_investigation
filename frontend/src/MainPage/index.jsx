import React, { useState, useRef } from "react";
// import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Container  from "./Container";
import BasicInfo from "./BasicInfo";
import EpaReport from "./EpaReport";
import PstReport from "./PstReport";
import FinancialReport from "./FinancialReports";
import RevenueAnalysis from "./RevenueAnalysis";
import CddResult from "./CddResult";
import JudgementSummary from "./JudgementSummary";
import AuthCheck from "./AuthCheck";
import '../../assets/css/title_section.css';

let endPoint = process.env.END_POINT;

const App = () => {
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [finalCompanyId, setFinalCompanyId] = useState("");
    const [finalCompanyName, setFinalCompanyName] = useState("");
    const [isValidUser, setIsValidUser] = useState(true); // Manage user validation status
    const [isAuthValid, setIsAuthValid] = useState(null); // Manage auth validation status


    const basicInfoRef = useRef(null); 

    const handleSearchClick = async () => {
        const company_id = companyId.trim();
        try {
            if (company_id === "") {
                throw new Error("No company ID entered.");
            }
            setFinalCompanyId(company_id);
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <AuthCheck onValidation={setIsAuthValid} />

            {isAuthValid === false ? (
                // <Redirect to="/invalid-user" /> // redirect
                <section className="welcome-hero">
                <div className="header-text">
                    <h1>徵信報告</h1>
                    <p className="subheading">
                        整合公司基本資訊、財部報表、公示資料等資料，快速評估公司運營情況
                    </p>
                </div>
            </section>
            ) : (
                <>
                    <section className="welcome-hero">
                        <div className="header-text">
                            <h1>徵信報告</h1>
                            <p className="subheading">
                                整合公司基本資訊、財部報表、公示資料等資料，快速評估公司運營情況
                            </p>
                        </div>
                    </section>

                    <Container title="輸入公司統編">
                        <div className="input-container">
                            <input 
                                type="number" 
                                value={companyId}
                                onChange={(e) => setCompanyId(e.target.value)}
                            />
                            <button
                                disabled={isLoading}
                                onClick={handleSearchClick}
                            >
                                查詢
                            </button>
                        </div>
                    </Container>

                    {finalCompanyId && (
                        <div ref={basicInfoRef}>
                            <BasicInfo endPoint={endPoint} companyId={finalCompanyId} />
                        </div>
                    )}
                    {finalCompanyId && <CddResult endPoint={endPoint} companyId={finalCompanyId} />}
                    {finalCompanyId && <RevenueAnalysis endPoint={endPoint} companyId={finalCompanyId} />}
                    {finalCompanyId && <FinancialReport endPoint={endPoint} companyId={finalCompanyId} />}
                    {finalCompanyId && <JudgementSummary endPoint={endPoint} companyId={finalCompanyId} />}
                </>
            )}
        </div>
    );
};

export default App;