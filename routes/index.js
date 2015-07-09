'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('Front page.');
});

module.exports = router;
