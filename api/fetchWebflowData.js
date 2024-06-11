// api/fetchWebflowData.js
import axios from 'axios';

export default async function handler(req, res) {
  const collectionId = process.env.WEBFLOW_COLLECTION_ID;
  const apiToken = process.env.WEBFLOW_API_TOKEN;

  console.log('Collection ID:', collectionId);
  console.log('API Token:', apiToken ? 'Exists' : 'Missing');

  if (!collectionId || !apiToken) {
    console.error('Environment variables are missing.');
    res.status(500).json({ error: 'Environment variables are missing.' });
    return;
  }

  try {
    const response = await axios.get(
      `https://api.webflow.com/v2/collections/${collectionId}/items`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Accept-Version': '1.0.0',
        },
      }
    );
    const items = response.data.items.filter(
      (item) => item._draft === false && item._archived === false
    );
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching Webflow data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
}