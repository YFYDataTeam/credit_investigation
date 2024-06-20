import React, {useState, useEffect} from "react";
import Container from "./Container";
import '../../assets/css/epareport.css';


const EpaReport = ({endPoint, companyId}) => {

    const [epareport, setEpareport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${endPoint}epa_report/${companyId}`);

                if(!response.ok){
                    throw new Error("Data not found.");
                }

                const data = await response.json();
                console.log('epa data',data);
                if (data.message === 'NoData'){
                    setEpareport(null);
                } else {
                    setEpareport(data);
                }
            } catch (error) {
                console.error("Error:", error)
            }
        };

        fetchData();
    }, [companyId]); 

    if(!epareport){
        return (
              <Container title="環保署汙染裁處記錄分析">
              </Container>
          );
    }

    return (
        <Container title="環保署汙染裁處記錄分析">
            {epareport ? (
            <div className="penalty-details">
                <console className="log">companyId:{companyId}</console>
                <p>裁處總次數: {epareport.penalty_times}</p>
                <p>最高裁處金額紀錄: {epareport.max_penalty_money}</p>
                <p>最近一次裁處金額: {epareport.latest_penalty_money}</p>
                {epareport.plot_image ? (
                    <img src={`data:image/png;base64,${epareport.plot_image}`} alt="Plot Image" style={{ maxWidth: '100%', height: 'auto' }} />
                ) : (
                    <p>No plot image available.</p>
                )}
            </div>
            ) : (
                <div>
                    <h3>查無資料</h3>
                </div>
            )
                
            }


        </Container>
    )

};

export default EpaReport;

