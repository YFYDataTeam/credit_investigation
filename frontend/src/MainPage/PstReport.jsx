import React, { useState, useEffect } from "react";
import Container from "./Container";
import config from '../../public/configs.json';
// mport '../../assets/css/epareport.css';


const end_point = config.endpoint;

const PstReport = ({companyId}) => {
    const [pstreport, setPstreport] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${end_point}/pst_report`)
            }
        };

        fetchData();
        }
    , [companyId]);

    return
};

export default PstReport;