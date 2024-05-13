import React, {useState, useEffect} from "react";
import Container from "./Container";
import config from '../../public/configs.json';

const end_point = config.endpoint;

const MopsReport = ({companyId}) => {
    const [mopsreport, setMopsreport] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${end_point}mops_report`);
                
                if(!response.ok){
                    throw new Error("Data not found.");
                }

                // const data = await response.json();
                
                console.log('mops data:', data)
                if (data.message === 'NoData'){
                    setMopsreport(null);
                } else {
                    setMopsreport(data);
                }
            } catch (error) {
                console.error("Error:", error)
            }
        };

        fetchData();
    }, [companyId])

    return (
        <Container title="財報分析part1">
            {mopsreport ? (
                <div>
                    <img src={`data:image/png;base64,${mopsreport.plot_sales_over_month}`} alt="Sales Over Month" />
                    <img src={`data:image/png;base64,${mopsreport.plot_sales_yoy}`} alt="Year-over-Year Sales" />
                    <img src={`data:image/png;base64,${mopsreport.plot_sales_y2m}`} alt="Year to Month Sales" />
                    <img src={`data:image/png;base64,${mopsreport.plot_sales_qoq}`} alt="Quarter-over-Quarter Sales" />
                </div>

            ) : (
                <div>
                    <h3>查無資料 </h3>
                </div>
            )}
        </Container>
    )
};


export default MopsReport;