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
const FormData = require('form-data');

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

    doc.fontSize(12).text(`Product UUID: ${productUuid}`);
    doc.text(`Locale: ${context.locale}`);
    doc.text(`Channel: ${context.channel}`);
    doc.text(`User UUID: ${user.uuid}`);
    doc.text(`Username: ${user.username}`);
    doc.text(`User Groups: ${user.groups.join(', ')}`);
    doc.text(`Timestamp: ${new Date(timestamp * 1000).toISOString()}`);
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

module.exports = router;
