"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'a lovely specification app.' });
});

module.exports = router;
