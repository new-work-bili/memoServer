const jwt = require('jsonwebtoken')
const {
	PRIVATE_KEY,
	tokenOutTime
} = require('../config.js')

//通过token解析信息,获取用户名(不能依靠客户端在localStorage中传来的用户名，不安全)
function getusername(token) {
	var str = token.replace("Bearer ", ""); //去掉 Bearer
	var username
	jwt.verify(str, PRIVATE_KEY, function(err, resUser) {
		console.log('resUser', resUser.username);
		username = resUser.username
	})
	console.log('resUser', username);
	return username
}
module.exports = getusername;
