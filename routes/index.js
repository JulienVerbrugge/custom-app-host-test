const express = require('express');
require('dotenv').config();
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getAkeneoToken } = require('../src/helpers/getAkeneoToken');
const { getProductIdentifierFromUUID } = require('../src/helpers/getProductIdentifierFromUUID');
const { getProduct } = require('../src/helpers/getProduct');
const FormData = require('form-data');

router.post('/generate-pdf', async (req, res) => {
  const { data, context, user, timestamp } = req.body;

  if (!data || !context || !user || !timestamp) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    // Retrieve uuid from payload and use it to retrieve the product Identifier
    productUuid = data.productUuid
    productIdentifier = await getProductIdentifierFromUUID(data.productUuid);
    const token = await getAkeneoToken()
    const baseURL = process.env.AKENEO_BASE_URL;

    // Generate the PDF with content
    const filePath = path.join(__dirname, 'generated.pdf');
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(14).text('Product Summary', { align: 'center', underline: true });
    doc.moveDown(1);
    
    doc.fontSize(12);
    doc.text(`Product UUID: ${productUuid}`);
    doc.text(`Locale: ${context.locale}`);
    doc.text(`Channel: ${context.channel}`);
    doc.text(`User UUID: ${user.uuid}`);
    doc.text(`Username: ${user.username}`);
    doc.text(`User Groups: ${user.groups.join(', ')}`);
    doc.text(`Timestamp: ${new Date(timestamp * 1000).toISOString()}`);
    doc.moveDown(1);
    
    const productData = await getProduct(productUuid);
    
    doc.text(`SKU: ${productData.values?.sku?.[0]?.data || 'N/A'}`);
    doc.moveDown(1);
    
    doc.fontSize(12).text('ERP Names', { underline: true });
    doc.moveDown(0.5);
    
    doc.font('Courier-Bold').text('Locale'.padEnd(15) + 'Scope'.padEnd(15) + 'Data');
    doc.font('Courier').text('-'.repeat(60));
    productData.values?.erp_name?.forEach(entry => {
      const locale = (entry.locale || 'N/A').padEnd(15);
      const scope = (entry.scope || 'N/A').padEnd(15);
      const data = entry.data || '';
      doc.text(`${locale}${scope}${data}`);
    });
    doc.moveDown(1);
    
    doc.fontSize(12).text('Descriptions', { underline: true });
    doc.moveDown(0.5);
    
    doc.font('Courier-Bold').text('Locale'.padEnd(15) + 'Scope'.padEnd(15) + 'Data');
    doc.font('Courier').text('-'.repeat(60));
    productData.values?.description?.forEach(entry => {
      const locale = (entry.locale || 'N/A').padEnd(15);
      const scope = (entry.scope || 'N/A').padEnd(15);
      const data = entry.data || '';
      doc.text(`${locale}${scope}`, { continued: true });
      doc.text(data, {
        indent: 30,
        align: 'left',
        lineGap: 2,
        continued: false
      });
      doc.moveDown(0.5);
    });

    // === External Stock Data ===
    try {
      const { data: externalData } = await axios.get('http://localhost:3000/api/get-mocked-external-data');

      const stockEntries = externalData.stock || [];

      doc.moveDown(1);
      doc.fontSize(12).text('Stock Information', { underline: true });
      doc.moveDown(0.5);

      doc.font('Courier-Bold').text('Location'.padEnd(20) + 'Quantity');
      doc.font('Courier').text('-'.repeat(30));

      stockEntries.forEach(entry => {
        const location = entry.location.padEnd(20);
        const quantity = entry.quantity.toString();
        doc.text(`${location}${quantity}`);
      });
    } catch (error) {
      console.error('Failed to fetch external stock data:', error.message);
      doc.moveDown(1);
      doc.fontSize(12).fillColor('red').text('⚠️ Failed to load stock data.', { underline: true });
      doc.fillColor('black');
    }

    
    doc.end();

    await new Promise(resolve => writeStream.on('finish', resolve));

    // Prepare the multipart/form-data
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('product', JSON.stringify({
      identifier: productIdentifier,
      attribute: 'notice',
      scope: null,
      locale: null
    }));

    const headers = {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`
    };

    const response = await axios.post(`${baseURL}/api/rest/v1/media-files`, form, { headers });

    console.log('Upload successful:', response.data);
    res.status(200).json({ success: true, data: response.data });


  } catch (error) {
    console.error('Error during PDF generation or upload:', error.response?.data || error.message);
    res.status(500).json({ error: 'An error occurred during PDF generation or upload' });
  }
});

router.get('/get-mocked-external-data', async (req, res) => {
  res.status(200).json({
    stock: [
      { quantity: 42, location: 'Warehouse A' },
      { quantity: 0, location: 'Warehouse B' },
      { quantity: 15, location: 'Warehouse C' }
    ]
  });
});

router.get('/get-product-order-status/:uuid', async (req, res) => {
  const uuid = req.params.uuid;

  try {
    const productData = await getProduct(uuid);
    const { data: orderData } = await axios.get('http://localhost:3000/api/get-mocked-order-status/' + productData.values.sku[0].data);

    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Invalid order data received');
    }

    res.status(200).json({
      values: productData.values,
      categories: productData.categories,
      family: productData.family,
      order: orderData.orders || []
    });
  } catch (error) {
    console.error('Error fetching product by UUID:', error.response?.data || error.message);
    res.status(500).json({ error: 'An error occurred while fetching the product' });
  }
});

router.get('/get-mocked-order-status/:sku', async (req, res) => {
  const sku = req.params.sku;

  if (!sku) {
    return res.status(400).json({ error: 'SKU is required' });
  }

  res.status(200).json({
    orders: [
      { number: 123, quantity: 10, status: 'Shipped' },
      { number: 456, quantity: 5, status: 'Pending' },
      { number: 789, quantity: 22, status: 'Cancelled' }
    ]
  });
});

router.post('/verify-token', function(req, res) {
  const token = req.body.token;
  const secret = req.body.secret || process.env.IFRAME_EXTENSION_SECRET;

  if (!secret) {
    return res.status(500).json({ error: 'Secret is not defined' });
  }

  jwt.verify(token, secret, (err, decoded) => {
      if (err) {
          return res.status(401).json({ valid: false, message: 'Invalid token' });
      }
      res.json({ valid: true, decoded });
  });
});

module.exports = router;
