import React, {useState, useEffect} from "react";
import Container from "./Container";
import SalesQoQChart from "./RevenueChart";

const RevenueAnalysis = ({end_point, companyId}) => {
    const [revenueAnalysis, setRevenueAnalysis] = useState(null);

    // console.log('end_point_revenue_analysis:', end_point);   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${end_point}revenue_analysis`);
                if (!response.ok) {
                    throw new Error("Data not found.");
                  }
    
                const data = await response.json();
                setRevenueAnalysis({
                    sales_qoq: data.sales_qoq,
                });

            } catch (error) {
                console.error("Error fetching data", error);
                setRevenueAnalysis(null);
            }
        };

        fetchData();

    }, [companyId]);

    if(!revenueAnalysis){
        return (
            <Container title="Revenue Analysis">
                <div>Loading...</div>
            </Container>
        );
    }

    const labels = revenueAnalysis.sales_qoq.map(item => item.year_quarter);
    const salesData = revenueAnalysis.sales_qoq.map(item => item.year_quarter_sales);
    const qoqData = revenueAnalysis.sales_qoq.map(item => item.QoQ);


    return (
        <Container title="Revenue Analysis">
            <SalesQoQChart labels={labels} qoqData={qoqData} /> {/* Use the QoQChart component */}
        </Container>
    );
};

export default RevenueAnalysis;
