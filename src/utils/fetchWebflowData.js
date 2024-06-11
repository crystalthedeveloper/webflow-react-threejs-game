// path: src/utils/fetchWebflowData.js
import axios from 'axios';

const fetchWebflowData = async () => {
  const collectionId = process.env.REACT_APP_WEBFLOW_COLLECTION_ID;
  const apiToken = process.env.REACT_APP_WEBFLOW_API_TOKEN;

  console.log('Collection ID:', collectionId);
  console.log('API Token:', apiToken);

  if (!collectionId || !apiToken) {
    console.error('Environment variables are missing.');
    return [];
  }

  try {
    const response = await axios.get(
      `http://localhost:3000/https://api.webflow.com/collections/${collectionId}/items`, // Update to your CORS proxy URL
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Accept-Version': '1.0.0',
        },
      }
    );
    console.log('API Response:', response.data);
    const items = response.data.items;
    return items.filter(item => item._draft === false && item._archived === false);
  } catch (error) {
    console.error('Error fetching Webflow data:', error.response ? error.response.data : error.message);
    return [];
  }
};

export default fetchWebflowData;