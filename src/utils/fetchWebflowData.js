// path: src/utils/fetchWebflowData.js
const fetchWebflowData = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5001/webflow-api-b99c9/us-central1/app/items');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.items) {
      throw new Error('Invalid data format');
    }
    return data.items; // Return the items directly
  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    return [];
  }
};

export default fetchWebflowData;