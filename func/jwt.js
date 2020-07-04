//认证token
const jwt = require('express-jwt');
const {
	PRIVATE_KEY
} = require('../config.js');
const blacklist = require('../blacklist')
//链接redis
const redis = require('../func/redis.js')
const redisClient = redis.redisClient

//设置黑名单？
let isRevokedCallback = function(req, payload, done) {
	redisClient.hkeys("token", function(err, tokenKey) { //tokenKey是一个数组，值是value
		// console.log('黑名单数量:', tokenKey.length);
		// console.log('tokenKey:', tokenKey)
	})
	
	//payload当前的token信息----如；{ username: 'test', iat: 1591179448, exp: 1591784248 }
	// console.log('验证token中的token信息', payload)
	// console.log('jwt检查是否在黑名单内','   本次token Key:',payload.time)
	//是否含有
	redisClient.hexists('token', payload.time, function(err, tokenNumber) {
		if(err){
			console.log('hashErr:',err)
		}
		if(tokenNumber == 1){
			console.log('在黑名单中')
			return done(null, true)  // 第二个参数为 true 则不通过
		}else{
			console.log('不在黑名单中')
			return done(null, false)  //通过
		}
	})
}

const jwtAuth = jwt({
	secret: PRIVATE_KEY,
	credentialsRequired: false, // 设置为false就不进行校验了，游客也可以访问
	isRevoked: isRevokedCallback
}).unless({
	path: [
		'/',
		'/login/',
		'/login/registe/',
		'/memo/qqlogin',
		'/memo/qqlogin/',
		'/qqData/',
		'/upload/',
		'/sendEmali/'
	], // 设置 jwt 认证白名单
});



module.exports = jwtAuth;
