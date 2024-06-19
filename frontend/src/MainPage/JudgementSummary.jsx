import React, {useState, useEffect} from "react";
import Container from "./Container";


const JudgementSummary = ({endPoint, companyId}) => {
    const [judgementSummary, setJudgementSummary] = useState(null);
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (companyId !== '') {
                try {
                    setLoading(true);
                    const response = await fetch(`${endPoint}judgement_summary/${companyId}`);
                    if (!response.ok) {
                        throw new Error('Data not found.')
                    }

                    const data = await response.json();
                    setJudgementSummary(data);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching data", error);
                    setRevenueAnalysis(null);
                    setLoading(false);
                }
            } else {
                await fetch(`${endPoint}reset_company_id`);
            }
        };

        fetchData();
    }, [companyId]);

    if(!companyId){
        return (
            <Container title="法院判決摘要">
            </Container>
        );
    }

    if (!judgementSummary) {
        return (
            <Container title="法院判決摘要">
                <p>Loading...</p>
            </Container>
        );
    }

    return (
        <Container title='法院判決摘要'>


        </Container>
    )
}

export default JudgementSummary;