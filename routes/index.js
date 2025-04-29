const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const jwt = require('jsonwebtoken');

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
  const token = req.body.token; // Get the token from the request body
  const secret = req.body.secret; // Get the secret from the request body

  jwt.verify(token, secret, (err, decoded) => {
      if (err) {
          return res.status(401).json({ valid: false, message: 'Invalid token' });
      }
      res.json({ valid: true, decoded });
  });
});

/* POST route to generate a PDF */
router.post('/generate-pdf', (req, res) => {
  const { data, context, user, timestamp } = req.body;

  if (!data || !context || !user || !timestamp) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Create a new PDF document
  const doc = new PDFDocument();

  // Define the output file path
  const filePath = `./public/generated-pdf-${Date.now()}.pdf`;

  // Pipe the PDF to a file
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Add content to the PDF
  doc.fontSize(16).text('Generated PDF', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Product UUID: ${data.productUuid}`);
  doc.text(`Locale: ${context.locale}`);
  doc.text(`Channel: ${context.channel}`);
  doc.text(`User UUID: ${user.uuid}`);
  doc.text(`Username: ${user.username}`);
  doc.text(`User Groups: ${user.groups.join(', ')}`);
  doc.text(`Timestamp: ${new Date(timestamp * 1000).toISOString()}`);

  // Finalize the PDF
  doc.end();

  // Wait for the file to be written, then send the response
  writeStream.on('finish', () => {
    res.json({ message: 'PDF generated successfully', filePath });
  });

  writeStream.on('error', (err) => {
    console.error('Error writing PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  });
});

module.exports = router;
