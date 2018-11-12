var express = require('express');
var router = express.Router();

// GET home page.
router.get('/', function(req, res) {
  res.redirect('/catalog');
});

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

module.exports = router;
