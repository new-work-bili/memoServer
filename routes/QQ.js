var express = require('express');
var router = express.Router();
const {login,init,add,edit,delet} = require('../db/sql.js')


router.get('/memo/qqlogin/', function(req, res, next) {
	console.log('req.query:',req.query)
	console.log('QQreq.url',req.url)
	res.json({
		code: 1,
		code:'code'
	})
});

module.exports = router;