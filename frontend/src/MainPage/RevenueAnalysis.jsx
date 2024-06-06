import React, {useState, useEffect} from "react";
import Container from "./Container";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';



const RevenueAnalysis = ({end_point, companyId}) => {
    const [revenueAnalysis, setRevenueAnalysis] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${end_point}revenue_analysis`);
                if (!response.ok) {
                    throw new Error("Data not found.");
                  }
    
                const data = await response.json();
                setRevenueAnalysis({
                    revenue_analysis: data.revenue_analysis,
                    sales_qoq: data.sales_qoq,
                    monthly_y2m: data.monthly_y2m
                });

            } catch (error) {
                console.error("Error fetching data", error);
                setRevenueAnalysis(null);
            }


        };

        fetchData();

    }, [companyId]);

    const chartData = {
        label: labels
    }

    return 


};


export default RevenueAnalysis;