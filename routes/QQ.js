var express = require('express');
var router = express.Router();
const {login,init,add,edit,delet} = require('../db/sql.js')


router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('req.headers:',req.headers)
	res.json({
		code: 1,
		code:'code'
	})
});

module.exports = router;