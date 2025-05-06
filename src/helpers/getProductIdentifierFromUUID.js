require('dotenv').config();
const axios = require('axios');
const { getAkeneoToken } = require('./getAkeneoToken');

/**
 * Retrieves the product identifier using its UUID from Akeneo.
 * @param {string} uuid - The UUID of the product.
 * @returns {Promise<string>} - The product identifier.
 */
async function getProductIdentifierFromUUID(uuid) {
  const token = await getAkeneoToken();
  const { AKENEO_BASE_URL } = process.env;

  try {
    const response = await axios.get(`${AKENEO_BASE_URL}/api/rest/v1/products-uuid/${uuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Assuming "sku" is the identifier attribute code for this example
    const skuValues = response.data.values?.sku;

    if (!skuValues || !Array.isArray(skuValues) || !skuValues[0]?.data) {
      throw new Error('Identifier attribute (e.g. "sku") not found in product values.');
    }

    return skuValues[0].data;
  } catch (error) {
    console.error('Error retrieving product:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getProductIdentifierFromUUID };