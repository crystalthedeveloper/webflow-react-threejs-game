// api/fetchWebflowData.js
const fetch = require('node-fetch');

export default async function handler(req, res) {
  const collectionId = process.env.WEBFLOW_COLLECTION_ID;
  const apiToken = process.env.WEBFLOW_API_TOKEN;

  if (!collectionId || !apiToken) {
    console.error('Environment variables are missing.');
    res.status(500).json({ error: 'Environment variables are missing.' });
    return;
  }

  const url = `https://api.webflow.com/v2/collections/${collectionId}/items`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apiToken}`
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Webflow data:', error);
    res.status(500).json({ error: error.message });
  }
}