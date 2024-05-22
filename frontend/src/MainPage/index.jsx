import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Container  from "./Container";
import BasicInfo from "./BasicInfo";
import EpaReport from "./EpaReport";
import PstReport from "./PstReport";
import MopsReport from "./Mops";
import FinancialReport from "./Financial";
import config from '../../public/configs.json';

const end_point = config.end_point;

const App = () => {
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [finalCompanyId, setFinalCompanyId] = useState("");
    const [finalCompanyName, setFinalCompanyName] = useState("");
    const [token, setToken] = useState("");
    const [isValidUser, setIsValidUser] = useState(true);

    useEffect(() => {
        // Fetch the token when the component mounts
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        // Check if the token is already in cookies
        const cookieToken = Cookies.get('token');
        if (cookieToken) {
            localStorage.setItem('token', cookieToken);
            setToken(cookieToken);
        } else {
            setIsValidUser(false);
        }
    }, []);

    const fetchWithToken = async (url) => {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        return response.json();
    };

    if (!isValidUser) {
        return <Redirect to="/invalid-user" />;
    }


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

        <Container title = "輸入公司統編或名稱">
            <input 
                type="number" 
                value={companyId}
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
                        
                        // Call set_up API to get

                    } catch (e) {
                        alert(e.message);
                    }
                    
                }}
            > 輸入公司統編
            </button>
            <space> </space>
            <input 
                type="string" 
                value={companyName}
                onChange={(e) => {
                    setCompanyName(e.target.value);
                }}
            />
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

        </Container>

        <BasicInfo companyId={finalCompanyId}></BasicInfo>
        

        
        <MopsReport companyId={finalCompanyId}></MopsReport>

        <FinancialReport companyId={finalCompanyId}></FinancialReport>

        <EpaReport companyId={finalCompanyId}></EpaReport>

        <PstReport companyId={finalCompanyId}></PstReport>
    </div>
    )
};

export default App;