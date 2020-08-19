const {
	PRIVATE_KEY,
	tokenOutTime
} = require('../config.js')
const jwt = require('jsonwebtoken')

const createToken = function(username) {
	var time = new Date().getTime()
	var token = jwt.sign( //生成token
		{
			username,
			time
		},
		PRIVATE_KEY, 
		{
			expiresIn: tokenOutTime
		}
	)
	console.log('生成token:',token,'当前time:',time)
	return token
}

module.exports = createToken
