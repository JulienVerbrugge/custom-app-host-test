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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* iframe extension */
router.get('/iframe-extension', function(req, res, next) {
  res.render('iframeExtension', { title: 'iframe extension' });
});

// Route to verify JWT token
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

  // Retrieve uuid from payload and use it to retrieve the product Identifier
  productUuid = data.productUuid
  productIdentifier = await getProductIdentifierFromUUID(data.productUuid);

  console.log(productIdentifier);

  const token = await getAkeneoToken()
  const baseURL = process.env.AKENEO_BASE_URL;

  // Create an empty PDF
  const filePath = path.join(__dirname, 'empty.pdf');
  fs.writeFileSync(filePath, '%PDF-1.4\n%EOF');

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
});

module.exports = router;
