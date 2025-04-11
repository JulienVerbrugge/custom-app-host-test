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

module.exports = router;
