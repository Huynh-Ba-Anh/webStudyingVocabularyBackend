var express = require('express');
var router = express.Router();
const Vocabulary = require('../models/Vocabularies');

/* GET home page. */
router.get('/', function(req, res, next) {
console.log("Hello from vocabularies.js");
  res.send('respond with a resource');
});

module.exports = router;
