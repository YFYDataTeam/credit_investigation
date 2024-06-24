import React, { useState, useEffect } from "react";
import Container from "./Container";
import textContent from "@/common/components/utils/textContent";

const description = textContent.jud.des;
const nodatamessage = textContent.jud.msg;

const JudgementSummary = ({ endPoint, companyId }) => {
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
					setJudgementSummary(null);
				} finally {
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

	if (!judgementSummary && !loading) {
    return (
        <Container title="法院判決摘要">
					<p className="description">{description}</p>
					<p className="message">{nodatamessage}</p>
        </Container>
    );
}

	return (
		<Container title='法院判決摘要'>
			<p className="description">{description}</p>
			<table>
				<thead>
					<tr>
						<th>判決書名稱</th>
						<th>判決書摘要</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(judgementSummary).map(([key, value]) => (
						<tr key={key}>
							<td>{key}</td>
							<td>{value}</td>
						</tr>
					))}
				</tbody>
			</table>

		</Container>
	)
}

export default JudgementSummary;