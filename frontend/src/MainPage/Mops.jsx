import react, {useState, useEffect} from "react";
import Container from "./Container";
import config from '../../public/configs.json';

const end_point = config.endpoint;

const MopsReport = ({companyId}) => {
    const [mopsreport, setMopsreport] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response= await fetch(`${end_point}mops_report`)

                if(!response.ok){
                    throw new Error("Data not found.");
                }

                const data = await response.json();

                if (DataTransfer.message === 'NoData'){
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

    return
};


export default MopsReport;