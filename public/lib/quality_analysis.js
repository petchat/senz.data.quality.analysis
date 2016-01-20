var AV = require('avoscloud-sdk');
var timelineId = '9ra69chz8rbbl77mlplnl4l2pxyaclm612khhytztl8b1f9o';
var timelineKey = '1zohz2ihxp9dhqamhfpeaer8nh1ewqd9uephe9ztvkka544b';
AV.initialize(timelineId, timelineKey);

var test = function(){
	setInterval(function(){
		console.log("Mageia");
		console.log(new Date());
	}, 1000);
};

module.exports = test;