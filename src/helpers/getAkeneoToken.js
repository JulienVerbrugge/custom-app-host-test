require('dotenv').config();
const axios = require('axios');

/**
 * Fetch an Akeneo API access token using OAuth2 password grant.
 * @returns {Promise<string>} - Resolves to access token
 */
async function getAkeneoToken() {
    const {
      AKENEO_BASE_URL,
      AKENEO_CLIENT_ID,
      AKENEO_SECRET,
      AKENEO_USERNAME,
      AKENEO_PASSWORD
    } = process.env;
  
    try {
      const response = await axios.post(`${AKENEO_BASE_URL}/api/oauth/v1/token`, {
        grant_type: 'password',
        client_id: AKENEO_CLIENT_ID,
        client_secret: AKENEO_SECRET,
        username: AKENEO_USERNAME,
        password: AKENEO_PASSWORD,
      });
  
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to retrieve token:', error.response?.data || error.message);
      throw error;
    }
}

module.exports = { getAkeneoToken };