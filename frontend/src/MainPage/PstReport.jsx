import React, { useState, useEffect } from 'react';
import Container from "./Container";
import { AnnualAgreementPlot } from '@/common/components/charts/PstChart';
import textContent from '@/common/components/utils/textContent';

const description = textContent.pst.des;
const nodatamessage = textContent.pst.msg;

const getCurrencyCode = (currencyName) => {
	const currencyMap = {
		'新台幣': 'TWD',
		'日圓': 'JPY',
		'美金': 'USD'
	};

	return currencyMap[currencyName] || currencyName;
};

const PstAnalysis = ({ endPoint, companyId }) => {
	const [pstAnalysis, setPstAnalysis] = useState(null);
	const [loading, setLoading] = useState(null);

	const year_region = process.env.YEAR_REGION || 5;

	useEffect(() => {
		const fetchData = async () => {
			if (companyId !== '') {
				try {
					setLoading(true);
					const response = await fetch(`${endPoint}pst_report?time_config=past&year_region=${year_region}`);
					if (!response.ok) {
						throw new Error('Error fetching data');
					}

					const data = await response.json();
					if (data.message === 'NoData') {
						setAgreements(null);
					} else {
						setPstAnalysis({
							timeConfig: data.time_config,
							nearestEndDate: data.nearest_end_date,
							annualAgreement: data.annual_agreement_aggregates,
							overallTypeCounts: data.overall_type_counts,
							annualTypeCounts: data.annual_type_counts
						});
						setLoading(false);
					}
				} catch (error) {
					console.error('Error:', error);
					setLoading(false);
				} finally {
					setPstAnalysis(null);
					setLoading(false);
				}
			} else {
				await fetch(`${endPoint}reset_company_id`);
			}

		};


		fetchData();

	}, [companyId, endPoint, year_region]);


	if (!companyId) {
		return (
			<Container title="動產擔保分析"></Container>
		);
	}


	if (loading) {
		return (
			<Container title="動產擔保分析">
				<p>Loading...</p>
			</Container>
		);
	}

	if (!pstAnalysis && !loading) {
		return (
			<Container title="動產擔保分析">
				<p className="description">{description}</p>
				<p className="message">{nodatamessage}</p>
			</Container>
		);
	}


	const label_agreement = pstAnalysis.annualAgreement.map(item => item.agreement_end_year);
	const annual_total_agreement_amount = pstAnalysis.annualAgreement.map(item => item.total_agreement_amount);
	const annual_agreement_count = pstAnalysis.annualAgreement.map(item => item.agreement_count);
	return (
		<Container title="動產擔保分析">
			<p className="description">{description}</p>
			<AnnualAgreementPlot
				labels={label_agreement}
				annual_total_agreement_amount={annual_total_agreement_amount}
				annual_agreement_count={annual_agreement_count} />

		</Container>
	);
};

export default PstAnalysis;