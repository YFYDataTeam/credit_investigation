// App.js

// Function to fetch EPA report data from the provided endpoint
async function fetchEpaReport() {
    try {
      const response = await fetch('http://localhost:8001/epa_report'); // Fetch data from the provided endpoint
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
    const epaReportContent = `
      
      <p>公司名稱: ${data.company_name}</p>
      <p>統一編號: ${data.company_account}</p>
      <p>公司目前狀態: ${data.company_status}</p>
      <p>報告類別: ${data.invest_type}</p>
      <p>裁處總次數: ${data.penalty_times}</p>
    `;

    
    // Set the HTML content of the #epaReport div
    epaReportElement.innerHTML = epaReportContent;
  }
  
  // Call the fetchEpaReport function when the page loads
  window.onload = fetchEpaReport;
  