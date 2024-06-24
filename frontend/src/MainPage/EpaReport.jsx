import React, { useState, useEffect } from "react";
import Container from "./Container";
import CustomBarChart from "../common/components/utils/EpaChartFunc.jsx";
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


  if(!companyId){
    return (
        <Container title="環保署汙染裁處記錄分析">
        </Container>
    );
  }

	if (!epaAnalysis) {
    return (
        <Container title="環保署汙染裁處記錄分析">
            <p>Loading...</p>
        </Container>
    );
}

	const label_penaltykind_in_count = epaAnalysis.penaltykind_count.map(item => item.penaltykind);
	const penaltykind_counts = epaAnalysis.penaltykind_count.map(item => item.count);

	const label_penaltykind_in_money = epaAnalysis.penaltykind_total_money.map(item => item.penaltykind);
	const penaltykind_money = epaAnalysis.penaltykind_total_money.map(item => item.penaltykind_amount);

	// const label_penaltykind_in_improve = epaAnalysis.penaltykind_total_money.map(item => item.penaltykind);
	const label__improve = epaAnalysis.improve_state.map(item => item.is_improve);
	const is_improve_counts = epaAnalysis.improve_state.map(item => item.count);

	const label_paymentstate = epaAnalysis.penaltykind_unpay.map(item => item.paymentstate);



	const penaltykind_amount_payment_state = epaAnalysis.penaltykind_unpay.map(item => item.penaltykind_amount);

	console.log('epa test:', penaltykind_amount_payment_state);


	// penaltykindcount
	const penaltykindcount_config = {
		title: "各類裁罰次數",
		nodatamsg: "無裁罰",
		color : {
			backgroundColor: 'rgba(54, 162, 235, 0.2)', 
			borderColor: 'rgba(54, 162, 235, 1)'
		}
	};
	const penaltykindmoney_config = {
		title: "各類裁罰金額統計",
		nodatamsg: "無裁罰",
		color : {
			backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light teal background
			borderColor: 'rgba(75, 192, 192, 1)', // Darker teal border
		}
	};
	const penaltykindimprove_config = {
		title: "要求改善項目統計",
		nodatamsg: "無要求改善項目",
		color : {
			backgroundColor: 'rgba(54, 162, 235, 0.2)', 
			borderColor: 'rgba(54, 162, 235, 1)'
		}
	};
	const paymentstate_config = {
		title: "各類裁罰次數",
		nodatamsg: "無未繳款",
		color : {
			backgroundColor: 'rgba(54, 162, 235, 0.2)', 
			borderColor: 'rgba(54, 162, 235, 1)'
		}
	};


	return (
		<Container title="環保署汙染裁處記錄分析">
			
			{ epaAnalysis ? (
				<div className="grid-container">
				<CustomBarChart
					labels={label_penaltykind_in_count}
					data={penaltykind_counts}
					title={penaltykindcount_config.title}
					noDataMsg={penaltykindcount_config.nodatamsg}
					color={penaltykindcount_config.color}
				/>
				<CustomBarChart
					labels={label_penaltykind_in_money}
					data={penaltykind_money}
					title={penaltykindmoney_config.title}
					noDataMsg={penaltykindmoney_config.nodatamsg}
					color={penaltykindmoney_config.color}
				/>
				<CustomBarChart
					labels={label__improve}
					data={is_improve_counts}
					title={penaltykindimprove_config.title}
					noDataMsg={penaltykindimprove_config.nodatamsg}
					color={penaltykindimprove_config.color}
				/>
				<CustomBarChart
					labels={label_paymentstate}
					data={penaltykind_amount_payment_state}
					title={paymentstate_config.title}
					noDataMsg={paymentstate_config.nodatamsg}
					color={paymentstate_config.color}
				/>
				</div>
				) : (
					<div><h3>查無資料</h3></div>
				)
			}
		</Container>


	)

};

export default EpaReport;

//TEST