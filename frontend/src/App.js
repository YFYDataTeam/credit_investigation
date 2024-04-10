// App.js


// get the endpoint config
// fetch('C:/Users/sean.chang/yfy/git/credit_investigation/frontend/public/configs.json').then(response => response.json()).then(config => {
//   const endpoint = config.endpoint
// })
endpoint = 'http://localhost:8000/'


document.getElementById('GetIDFromInput').addEventListener('submit', async (event) => {
  event.preventDefault(); 
  const company_id = document.getElementById('companyID').value;

  fetchBasicInfo(company_id);
  fetchEpaReport(company_id)
  
})

async function fetchBasicInfo(company_id){
  try{
    console.log('input', company_id);
    const response = await fetch(endpoint + `basicinfo/${company_id}`);
    if (response.ok) {
      const data = await response.json();
      displayBasicInfo(data);
    } else {
      throw new Error('Data not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayBasicInfo(data) {
  const BasicInfoElement = document.getElementById('basicInfo');

  let BasicInfoContent = `
    <div class="info-row">
      <div class="info-column">
        <h3>公司名稱</h3>
        <p>${data.company_name}</p>
      </div>
      <div class="info-column">
        <h3>統一編號</h3>
        <p>${data.company_account}</p>
      </div>
      <div class="info-column">
        <h3>公司目前狀態</h3>
        <p>${data.company_status}</p>
      </div>
    </div>
    <div class="info-row">
      <div class="info-column">
        <h3>資本額</h3>
        <p>${data.company_captial}</p>
      </div>
      <div class="info-column">
        <h3>董事長</h3>
        <p>${data.chairman}</p>
      </div>
      <div class="info-column">
        <h3>董事</h3>
        <p>${data.directors}</p>
      </div>
    </div>
  `;

  BasicInfoElement.innerHTML = BasicInfoContent;
}



window.addEventListener('load', fetchBasicInfo);

// Function to fetch EPA report data from the provided endpoint
async function fetchEpaReport(company_id) {
    try {
      const response = await fetch(endpoint + `epa_report/${company_id}`); // Fetch data from the provided endpoint
      const data = await response.json();
      displayEpaReport(data);
    } catch (error) {
      console.error('Error fetching EPA report data:', error);
    }
  }
  
  // Function to display EPA report on the web page
function displayEpaReport(data) {
    const epaReportElement = document.getElementById('epaReport');

    // Construct the EPA report content
    let epaReportContent = `
      <p>裁處總次數: ${data.penalty_times}</p>
      <p>最高裁處金額紀錄: ${data.max_penalty_money}</p>
      <p>最近一次裁處金額: ${data.latest_penalty_money}</p>
    `;

    // Check if there is a plot image and add it to the content
    if (data.plot_image) {
        epaReportContent += `<img src="data:image/png;base64,${data.plot_image}" alt="Plot Image" style="max-width: 100%; height: auto;">`;
    } else {
        epaReportContent += `<p>No plot image available.</p>`;
    }

    // Set the HTML content of the #epaReport div
    epaReportElement.innerHTML = epaReportContent;
}
  
// Call the fetchEpaReport function when the page loads
window.addEventListener('load', fetchEpaReport);


async function fecthPstReport(){
  try {
    const respone = await fetch(endpoint + 'pst_report');
    const data = await respone.json();
    displayPstReport(data);
  } catch(error) {
    console.error('Error fetching Psrt Report data:', error)
  }
}

function displayPstReport(data){
    const pstReportElement = document.getElementById('pstReport');

    let pstReportContent = `
    <h3>Report Details</h3>
    <p>Nearest End Date: ${data.nearest_end_date}</p>
    <div id="total_agreement_currency"></div>
    <img src="data:image/png;base64,${data.pieplot_img_buf}" alt="Pie Plot Image" style="max-width: 100%; height: auto;">
    <img src="data:image/png;base64,${data.lineplot_img_buf}" alt="Line Plot Image" style="max-width: 100%; height: auto;">
  `;
  
  pstReportElement.innerHTML = pstReportContent;
 
  displayTotalAgreement(data.total_agreement_currency);
}

function displayTotalAgreement(df){
  const totalAgreementElement = document.getElementById(total_agreement_currency);

  let totalAgreementContent = '<h4>過去5年動產擔保紀錄總額</h4>';
  df.forEach(row => {
    totalAgreementContent += `
          <div>
              <p>Debtor Title: ${row.debtor_title}</p>
              <p>Currency: ${row.currency}</p>
              <p>Total Amount: ${row.total_amount}</p>
          </div>
      `;
  });

  totalAgreementElement.innerHTML = totalAgreement

}


// async function fetchPstReport(timeConfig) {
//   try {
//     let url = new URL(endpoint + 'pst_report');
//     url.searchParams.append('time_config', timeConfig);
    
//     const response = await fetch(url);
//     const data = await response.json();
//     return data; // Return the fetched data
//   } catch (error) {
//     console.error(`Error fetching Pst Report data for ${timeConfig}:`, error);
//     return null; // Return null in case of an error
//   }
// }

// async function fetchAndDisplayReports() {
//   // Use Promise.all to fetch both reports concurrently
//   const [pastData, futureData] = await Promise.all([
//     fetchPstReport('past'),
//     fetchPstReport('future')
//   ]);

//   // Assuming you want to display these reports in separate sections
//   if (pastData) displayPstReport(pastData, 'pastReport');
//   if (futureData) displayPstReport(futureData, 'futureReport');
// }

// function displayPstReport(data, elementId) {
//   const reportElement = document.getElementById(elementId);

//   let reportContent = `
//     <h3>Report Details (${data.time_config})</h3>
//     <p>Nearest End Date: ${data.nearest_end_date}</p>
//     <div>Total Agreement Currency: ${data.total_agreement_currency}</div>
//     <img src="data:image/png;base64,${data.pieplot_img_buf}" alt="Pie Plot Image" style="max-width: 100%; height: auto;">
//     <img src="data:image/png;base64,${data.lineplot_img_buf}" alt="Line Plot Image" style="max-width: 100%; height: auto;">
//   `;
  
//   reportElement.innerHTML = reportContent;
// }

// // Trigger the data fetch and display when ready
// fetchAndDisplayReports();
