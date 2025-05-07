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
    console.log('Received token verification request');
    console.log('You need to implement the logic to generate a PDF here');
    return false;
});

router.post('/generate-pdf', async (req, res) => {
  console.log('Received PDF generation request');
  console.log('You need to implement the logic to generate a PDF here');
});

module.exports = router;
