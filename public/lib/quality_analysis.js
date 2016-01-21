var AV = require('avoscloud-sdk');
var assert = require('assert');
var log = require("./logger").log;
var logger = new log("QualityAnalysis");
var MongoClient = require('mongodb').MongoClient;
var logId = '9ra69chz8rbbl77mlplnl4l2pxyaclm612khhytztl8b1f9o';
var logKey = '1zohz2ihxp9dhqamhfpeaer8nh1ewqd9uephe9ztvkka544b';
AV.initialize(logId, logKey);

var Log = AV.Object.extend("Log");

var userInstallationMap = {
	"569f0f03c24aa80053b8157c":"DBzxiHMlFtX0Wr80s2qNBpd6FK1jLGe8",
	"5624d68460b2b199f7628914":"clCdNs1Yd9B0o8oGkkro3s9N1kTpxBVf",
	"5634da2360b22ab52ef82a45":"G93jbBRhtiWVGFULyLR9gPHDjUkl3S3R",
	"560d7193ddb2dd00356f4e80":"mRruMjhKIunQ2u1qA9tAyb3F2edEc5oP",
	"560bd9b7ddb2e44a621fc217":"tpktm6L2CS6qKTKveuH2gYIaqaCdbRUk",
	"561bdea960b2de2d09810f22":"SmP8BGCuFKkveWnJli6v82Ls80Dcqe0U",
	"5624b97660b296e5979bce05":"0pMVJ0w2VJXbt0MKdKplDKaMLCTEubM1",
	"5624ce21ddb24819b84d59d2":"oKNszXSBwhJ2ffLW8REwelucDlYAsUbP",
	"560bdbcb60b267e6db7aa2a9":"6IlHq2FGpaOV2xqyGh43cVLrdIgTK95g",
	"560e7b25ddb2e44a624f4d4e":"mbEmGcVhBpEvypVCb817z9dUu9aetxHn",
	"5625af4060b202593e53cda7":"jtcmMusRc3G6MrciP16fgiXby7cAFzqm",
	"562881ae60b2260e76fc77cb":"iNP06vsxqdxEA5hHdkGnA0mYy4tr2NvN",
	"5627226c00b09f851ff4a200":"A9ShIco5L0t1Akfyhe9MwMutGMePqrXV",
	"564156f160b262671ea7aa65":"kyOLAICaT7jHbGNA9DpEVk2xaq51yYeQ",
	"5689cf3700b09aa2fdd88d3b":"p95f3qTptXDhs2W9USx1MTi7Cc9N6zbW",
	"569ccda100b04bbf1ee10b4a":"RlX6tbryE7tj58NFo8b7mLpbCQjg27EK",
	"568a0ca200b01b9f2c08f53d":"ynnAdkuvdolGEsxhUYIpyL70nJGVDX7b",
	"5684d18200b068a2a955aefc":"ntK466fF6qCfJeYLwGYJ8od5L8n1gwXD",
	"5604e5ce60b2521fb8eb240a":"1KwFXGJkRKb4V4wgcK59mCBFzXap91po",
	"56406b4a00b0ee7f57b5c3a3":"CpMjyBI2oGAjJDfQiehPnzDchlmAWxzA",
	"5689cd6d60b2e57ba2c05e4c":"FXiPOQjv2stL1FAuDieWmSwjlanVEGmf",
	"564bd84b60b2ed362064985f":"kQOCfohjsGYbr1xQokcrgvigluS0Ab97",
	"55d845e100b0d7b2266ac668":"kJY4H24ojKYJQAmVDiKcVJSVp3fO7Npo",
	"564575ac60b20fc9b99d8d9d":"4Y5KKBtB7TuPrAiQd14xE1EarhJu0EQ0",
	"5684fa9e00b009a31af7efcb":"aoXQRUGjNb25HyG8J3wfIB9APjWp6mOe",
	"558a5ee7e4b0acec6b941e96":"sFlPo3d40EXFvQ4sBiqMQ2sPJwf0XnbU",
	"55f788f4ddb25bb7713125ef":"lq1V2vWODJMDOoplWPHMH3HLFJuJW6kL",
	"55c1e2d900b0ee7fd66e8ea3":"ipAujsbPwifG5EMPcec9gCXeVSFyp2EN",
	"5653c88e00b0e772838cd61b":"k5luekqGhj9JUYnG7jIJRIPL5tNn0czA",
	"5682580d00b0f9a1f22748c7":"yKJpjUD6ouU8oUnX3Sq8BO03AWrW4QQy",
	"5684d3d660b2b60f65d84285":"h8CQnD4g3VtojKIdymYEcRAIMidOH6wG"
};

var getTime = function(){
	var now = new Date();

	now.setHours(now.getHours() - 1 );
	now.setMinutes(0);
	now.setSeconds(0);
	console.log(now.toISOString());
	var start = now.getTime();

	now.setMinutes(59);
	now.setSeconds(59);
	var end = now.getTime();
	console.log(now.toISOString());
	return [start, end];
};

var queryMoContent = function(collection, option, cb){
	var url = 'mongodb://senzhub:Senz2everyone@119.254.111.40:27017/RefinedLog';
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

		var query_option = typeof option === "object" ? option : {};
		var callback = typeof option === "function" ? option : cb;

		var cursor = db.collection(collection).find(query_option);
		cursor.each(function(err, doc){
			assert.equal(null, err);
			callback(doc || {});
			db.close();
		});
	});
};

var calcRawLog = function(config){
	var ts = getTime();
	var promises = [];
	var users = [];
	Object.keys(userInstallationMap).forEach(function(uid){
		users.push(uid);
		var query = new AV.Query(Log);
		var installation = {
			"__type": "Pointer",
			"className": "_Installation",
			"objectId": userInstallationMap[uid]
		};
		query.equalTo("installation", installation);
		query.greaterThan("createdAt", new Date(ts[0]));
		query.lessThan("createdAt", new Date(ts[1]));
		promises.push(query.count());
	});

	return AV.Promise.all(promises).then(
		function(numbers){
			logger.debug("Log", numbers);
			numbers.forEach(function(data, index){
				if(data < config.count[0]){
					logger.warn("Log", users[index] + "[data]: " + data + " less than min!");
				}
				if(data > config.count[1]){
					logger.warn("Log", users[index] + "[data]: " + data + " greater than max!");
				}
			})
		})
};

var calcUserLocation = function(config){
	var ts = getTime();
	var promises = [];
	var users = [];

	var url = 'mongodb://senzhub:Senz2everyone@119.254.111.40:27017/RefinedLog';
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

		Object.keys(userInstallationMap).forEach(function (uid) {
			users.push(uid);
			var where = {
				createdAt: {$gt: new Date(ts[0]), $lt: new Date(ts[1])},
				user_id: uid
			};
			promises.push(db.collection(config.Class).count(where));
		});

		return Promise.all(promises).then(
			function (numbers) {
				db.close();
				logger.debug("UserLocation", numbers);
				numbers.forEach(function(data, index){
					if(data < config.count[0]){
						logger.warn("UserLocation", users[index] + "[data]: " + data + " less than min!");
					}
					if(data > config.count[1]){
						logger.warn("UserLocation", users[index] + "[data]: " + data + " greater than max!");
					}
				});
			});
	});
};

var calcAllClass = function(){
	queryMoContent("QualityAnalysis", function(config){
		if(config.Class == "Log"){calcRawLog(config);}
		if(config.Class == "UserLocation"){calcUserLocation(config);}
	});
};

var QualityAnalysis = function() {
	setInterval(function () {
		var minute = new Date().getMinutes();
		if (minute == 0){
			calcAllClass();
		}
	}, 3000);
};


module.exports = QualityAnalysis;