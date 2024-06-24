import React, { useState, useEffect } from "react";
import Container from "./Container";
import '../../assets/css/epareport.css';


const EpaReport = ({ endPoint, companyId }) => {

	const [epaAnalysis, setEpareport] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`${endPoint}epa_report`);

				if (!response.ok) {
					throw new Error("Data not found.");
				}
				const data = await response.json();
				console.log('epa data:', data);
				if (data.message === 'NoData') {
					setEpareport(null);
				} else {

					setEpareport({
						penaltykind_count: data.penaltykind_count,
						penaltykind_total_money: data.penaltykind_total_money,
						improve_state: data.improve_state,
						penaltykind_unpay: data.penaltykind_unpay
					});

				};
			} catch (error) {
				console.error("Error:", error)
			}
		};

		fetchData();
	}, [companyId]);



	if (!epaAnalysis) {
		return (
			<Container title="環保署汙染裁處記錄分析">
			</Container>
		);
	}

	const penaltykind_in_df_count = epaAnalysis.penaltykind_count.map(item => item.penaltykind);
	const penaltykind_counts = epaAnalysis.penaltykind_count.map(item => item.count);

	const penaltykind_in_df_money = epaAnalysis.penaltykind_total_money.map(item => item.penaltykind);
	const penaltykind_money = epaAnalysis.penaltykind_total_money.map(item => item.penalty_money);

	const penaltykind_in_df_improve = epaAnalysis.improve_state.map(item => item.penaltykind);
	const is_improve_counts = epaAnalysis.improve_state.map(item => item.count);

	const paymentstate = epaAnalysis.penaltykind_unpay.map(item => item.paymentstate);
	const penaltykind_amount_payment_state = epaAnalysis.penaltykind_unpay.map(item => item.penaltykind_amount);

	console.log('epa test:', penaltykind_amount_payment_state);

	return (
		<Container title="環保署汙染裁處記錄分析">

		</Container>
	)

};

export default EpaReport;

