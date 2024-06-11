// path: src/utils/fetchWebflowData.js
import axios from 'axios';

const fetchWebflowData = async () => {
  try {
    const response = await axios.get('/api/fetchWebflowData');
    return response.data;
  } catch (error) {
    console.error('Error fetching Webflow data:', error.response ? error.response.data : error.message);
    return [];
  }
};

export default fetchWebflowData;