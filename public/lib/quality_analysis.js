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
	"569f0f03c24aa80053b8157c": "DBzxiHMlFtX0Wr80s2qNBpd6FK1jLGe8",
	"5624d68460b2b199f7628914":"U5j5sSNX3qEUPNv8wsWG1XuDMphhwGUQ"
};

var getTime = function(){
	var now = new Date();

	now.setHours(14);

	now.setMinutes(0);
	now.setSeconds(0);
	var start = now.getTime();

	now.setMinutes(59);
	now.setSeconds(59);
	var end = now.getTime();

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
					logger.warn("Log", users[index] + " less than min!");
				}
				if(data > config.count[1]){
					logger.warn("Log", users[index] + " greater than max!");
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
						logger.warn("UserLocation", users[index] + " less than min!");
					}
					if(data > config.count[1]){
						logger.warn("UserLocation", users[index] + " greater than max!");
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
		if (minute == 0) calcAllClass();
	}, 30000);
};


module.exports = QualityAnalysis;