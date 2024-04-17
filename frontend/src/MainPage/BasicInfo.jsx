import React, {useState, useEffect} from "react";
import Container from "./Container";


const BasicInfo = ({companyId}) => {
  
    const [basicInfo, setBasicInfo] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                console.log("input", companyId);
                const response = await fetch(`${endpoint}basicinfo/${companyId}`);

                if(!response.ok){
                    throw new Error("Data not found.");
                }

                const data = await response.josn();

                if (data.message === "NoData"){
                    throw Error("displayNoDataMessage");
                } else {
                    setBasicInfo(data);
                }
                

            } catch (error) {
                console.error("Error:", error)
            }
        };


        fetch();
    // whenever companyId changes,
    // Dependency Array: [companyId] is the dependency array for this useEffect. 
    // This array tells React to keep track of the variables listed inside it (in this case, just companyId). 
    }, [companyId]);
    

    return (
        <Container title="公司基本資訊">
          {basicInfo && (
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
          )}
        </Container>
      );
};

export default BasicInfo;