var express = require('express');
var router = express.Router();
const {login,init,add,edit,delet} = require('../db/sql.js')


router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('req.body:',req.body)
});

module.exports = router;