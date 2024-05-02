import React, { useState } from "react";
import Container  from "./Container";
import BasicInfo from "./BasicInfo";
import EpaReport from "./EpaReport";
import PstReport from "./PstReport";
import MopsReport from "./Mops";

const App = () => {
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [finalCompanyId, setFinalCompanyId] = useState("");
    const [finalCompanyName, setFinalCompanyName] = useState("");
    return (
    <div>
        <section class="welcome-hero">
            <div class="container">
                <div class="header-text">
                <h1>徵信報告</h1>
                <p class="subheading">
                    透過大型語言模型(LLM)根據公司新聞、公開資訊及財務紀錄進行信用評分
                </p>
                </div>
            </div>
        </section>

        <Container title = "輸入公司統編">
            <input 
                type="number" 
                value={companyId}
                // required={!companyName}
                onChange={(e) => {
                    setCompanyId(e.target.value);
                }}
            />
            <button
                disabled={isLoading}
                onClick={async (e) => {
                    const company_id = companyId.trim();

                    try {
                        if (company_id === ""){
                            throw Error("No company ID entered.")
                        }

                        // Set FinalCompanyID once input is validated and complete to prevent premature API calls
                        setFinalCompanyId(company_id);
                        
                        // Call API
                        // await fetchBasicInfo(company_id);

                    } catch (e) {
                        alert(e.message);
                    }
                    
                }}
            > 輸入公司統編
            </button>

        </Container>

        <BasicInfo companyId={finalCompanyId}></BasicInfo>
        
        <EpaReport companyId={finalCompanyId}></EpaReport>

        <PstReport companyId={finalCompanyId}></PstReport>
        
        <MopsReport companyId={finalCompanyId}></MopsReport>
    </div>
    )
};

export default App;