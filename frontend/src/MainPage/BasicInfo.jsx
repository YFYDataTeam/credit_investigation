import React, {useState, useEffect} from "react";
import Container from "./Container";


const BasicInfo = ({companyId}) => {
  
    const [basicInfo, setBasicInfo] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                console.log("input", companyId);
                const response = await fetch(`${endpoint}basicinfo/${companyId}`);
            } catch (error) {
                console.error("Error:", error)
            }
        };

        fetch();
    }, []);
    

    return 
};

export default BasicInfo;