var express = require('express');
var router = express.Router();
var Progress = require('../models/Progresses');

/* GET home page. */
router.get('/', function(req, res, next) {
console.log("Hello from progresses.js");
  res.send('respond with a resource');
});

module.exports = router;
