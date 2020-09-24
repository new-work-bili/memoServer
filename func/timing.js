const schedule = require('node-schedule');
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
//链接redis
const redis = require('../func/redis.js')
const redisClient = redis.redisClient


//初始化PV数
redisClient.get('PV', (err, data) => { //注意第二个参数才是data
	if (data == null) {
		redisClient.set('PV', 0)
	}
})

//每天把PV统计一下；手动
const PV_log = () => {
	redisClient.get('PV', (err, data) => { //注意第二个参数才是data
		if (err) {
			throw err;
		}
		//时间
		function add0(m) {
			return m < 10 ? '0' + m : m
		}
		var time = new Date();
		var y = time.getFullYear();
		var m = time.getMonth() + 1;
		var d = time.getDate();
		var str = y + '-' + add0(m) + '-' + add0(d) + '访问次数：' + data + '人次' + '\r\n '

		//倒写日志
		var accessData = fs.readFileSync(path.join(__dirname, '../logs/PV.log')) //这个是绝对地址
		fs.writeFile('./logs/PV.log', str, function(err) {
			if (err) {
				throw err;
			}
			//然后在把之前日志文件的内容加在后面
			fs.writeFile('./logs/PV.log', accessData, {
				'flag': 'a'
			}, function(err) { // 传递了追加参数 { 'flag': 'a' }
				if (err) {
					throw err;
				}
			});
		});
		
		//归零
		redisClient.set('PV', 0)
	})

}
//test
// setInterval(()=>{
// 	PV_log()
// },1000)

//每天判断黑名单有没有过期
const Blacklist = () => {
	var date = Math.ceil(new Date().getTime() / 1000) //取精确到秒的时间戳
	//遍历哈希表"token",获取所有的value
	redisClient.hvals("token", function(err, tokenValue) { //tokenValue是一个数组，值是value
		console.log('黑名单数量:', tokenValue.length);
		// console.log('tokenValue:', tokenValue)
		tokenValue.forEach(function(value, i) {
			// console.log('value:',value,'date:',date);
			if (date > value) {
				//超时，删除
				console.log('超时，删除')
				redisClient.del('token', value, function(err, resData) {
					if (err) {
						console.log('delErr:', err)
					}
					console.log('删除成功!')
				})
			} else {
				console.log('未超时')
			}
		});
	})
}

//每天判断黑名单有没有过期
const scheduleCronstyle = () => {
	//Cron表达式:每秒执行一次:*/1 * * * * ?;每天凌晨:0 0 0 /1 * ? *;
	schedule.scheduleJob('0 0 0 /1 * ? *', () => {
		Blacklist()
		//PV
		PV_log()
	});



}



module.exports = scheduleCronstyle
