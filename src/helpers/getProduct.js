require('dotenv').config();
const axios = require('axios');
const { getAkeneoToken } = require('./getAkeneoToken');

async function getProduct(uuid) {
    const token = await getAkeneoToken();
    const baseURL = process.env.AKENEO_BASE_URL;
  
    try {
      const response = await axios.get(`${baseURL}/api/rest/v1/products-uuid/${uuid}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching product by UUID:', error.response?.data || error.message);
      throw error;
    }
}

module.exports = { getProduct };