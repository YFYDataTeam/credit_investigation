import React, {useState, useEffect} from "react";
import Container from "./Container";
import {MonthlySalesChart, QuarterlySalesChart} from "./RevenueChart";

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
                    monthly_sales: data.monthly_sales,
                    quarterly_sales: data.quarterly_sales,
                    yearly_sales: data.yearly_sales
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

    const labels_monthly_sales = revenueAnalysis.monthly_sales.map(item => item.period);
    const monthly_sales_data = revenueAnalysis.monthly_sales.map(item => item.sales);

    const labels_yq = revenueAnalysis.quarterly_sales.map(item => item.year_quarter);
    const quarter_sales_data = revenueAnalysis.quarterly_sales.map(item => item.year_quarter_sales)
    const sales_qoq_data = revenueAnalysis.quarterly_sales.map(item => item.QoQ);



    return (
        <Container title="Revenue Analysis">
            <MonthlySalesChart labels={labels_monthly_sales} salesData={monthly_sales_data} />
            <QuarterlySalesChart 
                labels={labels_yq} 
                quarterSales={quarter_sales_data} 
                qoqData={sales_qoq_data} />
        </Container>
    );
};

export default RevenueAnalysis;