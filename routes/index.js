'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('<h1>Front page</h1><h2><a href="/features">Features</a></h2>');
});

module.exports = router;
