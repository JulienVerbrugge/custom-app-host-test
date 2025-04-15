var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* iframe extension */
router.get('/iframe-extension', function(req, res, next) {
  res.render('iframeExtension', { title: 'iframe extension' });
});

const jwt = require('jsonwebtoken');

// Route to verify JWT token
router.post('/verify-token', function(req, res) {
    const token = req.body.token; // Get the token from the request body
    const secret = '3jg649gp4c8w00o4kgwg0gw00sg0cwss48s0kg4s44cs8gcso4'; // Replace with your actual secret

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ valid: false, message: 'Invalid token' });
        }
        res.json({ valid: true, decoded });
    });
});


module.exports = router;
