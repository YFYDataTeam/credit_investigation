import React, { useState, useEffect } from "react";
import Container from "./Container";
import '../../assets/css/judgement.css';

const JudgementSummary = ({ endPoint, companyId }) => {
    const [judgementSummary, setJudgementSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (companyId !== '') {
                try {
                    setLoading(true);
                    const response = await fetch(`${endPoint}judgement_summary/${companyId}`);
                    if (!response.ok) {
                        throw new Error('Data not found.');
                    }

                    const data = await response.json();
                    setJudgementSummary(data);
                    console.log('judgement data:', data);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching data", error);
                    setJudgementSummary(null);
                    setLoading(false);
                }
            } else {
                await fetch(`${endPoint}reset_company_id`);
            }
        };

        fetchData();
    }, [companyId]);

    if (!companyId) {
        return (
            <Container title="法院判決摘要">
            </Container>
        );
    }

    if (loading) {
        return (
            <Container title="法院判決摘要">
                <p>Loading...</p>
            </Container>
        );
    }

    if (!judgementSummary) {
        return (
            <Container title="法院判決摘要">
                <p>無法院判決資料</p>
            </Container>
        );
    }

    return (
        <Container title='法院判決摘要'>
            <table className="table">
                <thead>
                    <tr>
                        <th className="th">判決書名稱</th>
                        <th className="th">判決書內容整理</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(judgementSummary).map(([judgementName, details], index) => (
                        <React.Fragment key={index}>
                            <tr className="tr">
                                <td className="td" rowSpan="3">{judgementName}</td>
                                <td className="td"><strong>該公司扮演的腳色:</strong> {details.role}</td>
                            </tr>
                            <tr className="tr">
                                <td className="td">
                                    <strong>摘要:</strong>
                                    <div className="content">{details.summary}</div>
                                </td>
                            </tr>

                            <tr className="tr">
                                <td className="td">
                                    <strong>該公司受到的影響:</strong> 
                                    <div>{details.influence}</div>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </Container>
    );
}

export default JudgementSummary;
