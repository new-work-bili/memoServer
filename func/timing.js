const schedule = require('node-schedule');
//链接redis
const redis = require('../func/redis.js')
const redisClient = redis.redisClient


//每天判断黑名单有没有过期
const scheduleCronstyle = () => {
	//Cron表达式:每秒执行一次:*/1 * * * * ?;每天凌晨:0 0 0 /1 * ? *;
	schedule.scheduleJob('0 0 0 /1 * ? *', () => {
		var date =Math.ceil(new Date().getTime()/1000) //取精确到秒的时间戳
		// console.log(new Date());
		//遍历哈希表"token",获取所有的value
		redisClient.hvals("token", function(err, tokenValue) { //tokenValue是一个数组，值是value
			console.log('黑名单数量:', tokenValue.length);
			console.log('tokenValue:', tokenValue)
			tokenValue.forEach(function(value, i) {
				console.log('value:',value,'date:',date);
				if(date>value){
					//超时，删除
					console.log('超时，删除')
					redisClient.del('token', value, function(err, resData) {
						if(err){
							console.log('delErr:',err)
						}
						console.log('删除成功!')
					})
				}else{
					console.log('未超时')
				}
			});
		})
	});
}

module.exports = scheduleCronstyle
