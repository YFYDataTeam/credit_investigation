import React, {useState, useEffect} from "react";
import Container from "./Container";
import config from '../../public/configs.json';
import '../../assets/css/basicinfo.css';

const end_point = config.endpoint;

const BasicInfo = ({companyId}) => {
  
    const [basicInfo, setBasicInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    console.log("company_id:", companyId)
    useEffect(() => {
        const fetchData = async () => {
            if (companyId != ''){
                try {
                    console.log("input", companyId);
                    const response = await fetch(`${end_point}basicinfo/${companyId}`);
    
                    if(!response.ok){
                        throw new Error("Data not found.");
                    }
    
                    const data = await response.json();
                    console.log("data:", data);
                    if (data.message === "NoData"){
                        setBasicInfo(null);
                        setErrorMessage(''); // Reset the error message to ensure the useEffect will trigger
                        setTimeout(() => setErrorMessage("沒有找到相關公司資料。請確認公司統編是否輸入正確"), 0);
                        
                    } else {
                        setBasicInfo(data);
                        setErrorMessage('');
                    }
                    
    
                } catch (error) {
                    console.error("Error:", error)
                }
            } else {
                console.log('No company found.')
            }
            
        };

        fetchData();
    // Dependency Array: [companyId] is the dependency array for this useEffect. 
    // This array tells React to keep track of the variables listed inside it (in this case, just companyId). 
    }, [companyId]);

    useEffect(() => {
        if (errorMessage) {
            alert(errorMessage);    
        }
    },[errorMessage]);
    

    return (
      <Container title="公司基本資訊">
        {basicInfo ? (
          <div>
            <div class="info-row">
              <div class="info-column">
                <h3>公司名稱</h3>
                <p>{basicInfo.company_name}</p>
              </div>
              <div class="info-column">
                <h3>統一編號</h3>
                <p>{basicInfo.company_account}</p>
              </div>
              <div class="info-column">
                <h3>公司目前狀態</h3>
                <p>{basicInfo.company_status}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-column">
                <h3>資本額</h3>
                <p>{basicInfo.company_captial}</p>
              </div>
              <div class="info-column">
                <h3>董事長</h3>
                <p>{basicInfo.chairman}</p>
              </div>
              <div class="info-column">
                <h3>董事</h3>
                <p>{basicInfo.directors}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3>查無資料</h3>
            {/* <p>沒有找到相關公司資料。請確認公司 ID 是否正確或試試其他查詢。</p> */}
          </div>
        )}
      </Container>
    );
  
};

export default BasicInfo;