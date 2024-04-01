// App.js


// get the endpoint config
// fetch('C:/Users/sean.chang/yfy/git/credit_investigation/frontend/public/configs.json').then(response => response.json()).then(config => {
//   const endpoint = config.endpoint
// })
endpoint = 'http://localhost:8000/'


//

async function fetchBasicInfo(){
  try{
    const response = await fetch(endpoint + 'basicinfo');
    const data = await response.json();
    displayBasicInfo(data);
  } catch (error) {
    console.error('Error fetching Basic info data:', error);
  }
}

function displayBasicInfo(data) {
    const BasicInfoElement = document.getElementById('basicInfo');

    let BasicInfoContent = `
      <p>公司名稱: ${data.company_name}</p>
      <p>統一編號: ${data.company_account}</p>
      <p>公司目前狀態: ${data.company_status}</p>
    `;

    BasicInfoElement.innerHTML = BasicInfoContent;
}

window.addEventListener('load', fetchBasicInfo);

// Function to fetch EPA report data from the provided endpoint
async function fetchEpaReport() {
    try {
      const response = await fetch(endpoint + 'epa_report'); // Fetch data from the provided endpoint
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
      <p>報告類別: ${data.invest_type}</p>
      <p>裁處總次數: ${data.penalty_times}</p>
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
