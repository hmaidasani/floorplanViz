
/*
 * POST data.
 */

var moment = require('moment');

var hourColumns = [
    {"time":"9a"},
    {"time":"10a"},
    {"time":"11a"},
    {"time":"12a"},
    {"time":"1p"},
    {"time":"2p"},
    {"time":"3p"},
    {"time":"4p"},
    {"time":"5p"},
    {"time":"6p"},
    {"time":"7p"},
    {"time":"8p"},
    {"time":"9p"},
    {"time":"10p"}
];
var hourColumnsIds = {
	9:1,
    10:2,
    11:3,
    12:4,
    13:5,
    14:6,
    15:7,
    16:8,
    17:9,
    18:10,
    19:11,
    20:12,
    21:13,
    22:14
};

var dayColumns = [
    {"time":"Mon"},
    {"time":"Tue"},
    {"time":"Wed"},
    {"time":"Thu"},
    {"time":"Fri"},
    {"time":"Sat"},
    {"time":"Sun"}        
];

var dayColumnsIds = {
	1:1,
    2:2,
    3:3,
    4:4,
    5:5,
    6:6,
    0:7
};

var monthColumns = [
    {"time":"Jan"},
    {"time":"Feb"},
    {"time":"Mar"},
    {"time":"Apr"},
    {"time":"May"},
    {"time":"Jun"},
    {"time":"Jul"},
    {"time":"Aug"},
    {"time":"Sep"},
    {"time":"Oct"},
    {"time":"Nov"},
    {"time":"Dec"}
];

exports.getData = function(req, res){
	var type = req.body.type || req.query.type;
	if(type == 'stores') {
		sendStoresData(req, res);
	} else if(type == 'map') {
		sendMapData(req, res);
	} else {
		res.json({});
	}
};


function sendStoresData(req, res) {
	var output = {};
	var name = req.body.name || req.query.name;
	var timeType = req.body.timeType || req.query.timeType;
	var time1 = req.body.time1 || req.query.time1;
	var time2 = req.body.time2 || req.query.time2;
	var value = req.body.value || req.query.value;
	switch(timeType)
	{
		case "hour":
			output["columns"] = hourColumns;
			break;
		case "day":
			output["columns"] = dayColumns;
			break;
		case "month":
			output["columns"] = monthColumns;
			break;
		default:
			output["columns"] = "timeType parameter not specified";
	}
	
	var queryString = 'SELECT name as store FROM stores';
	if(name == 'all' || name === undefined)
		queryString += '';
	else
		queryString += ' WHERE LOWER(name) like \'%' + name.toLowerCase() +'%\'';
	
	var stores = {};
	var pg = require('pg'); 
	pg.connect(process.env.DATABASE_URL || 'postgres://localhost:5432/floorplanviz', function(err, client, done) {
		client.query(queryString, function(err, result) {
		    done();
		    if(err) return console.error(err);
		    
		    output["rows"] = result.rows;
		    for(var i in result.rows) {
		    	stores[result.rows[i].store] = i*1+1;
		    }
		    
		    if(value == 'customers' && (time1 || time2)) {
		    	var time1Moment = moment(time1);
		    	var time2Moment = moment(time2);
		    	var time = time1Moment.year()+'-'
		    	if(time1 && time2)
		    		queryString = "select number as value, time, name from storecustomers inner join stores on storecustomers.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
		    	else if(time1)
		    		queryString = "select number as value, time, name from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
		    	else if(time1)
		    		queryString = "select number as value, time, name from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
		    	if(name == 'all' || name === undefined)
		    		queryString += '';
		    	else
		    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
		    	queryString += ' order by store_id';
		    	console.log(queryString);
		    	client.query(queryString, function(err, result) {
		    		done();
		    		if(err) return console.error(err);
		    		var binnedData = binData(result.rows, timeType, stores);
		    		var results = [];
		    		for(var i in binnedData){
		    			for(var j in binnedData[i]){
		    				if(j.indexOf('count') == -1){
		    					results.push({"store":parseInt(i), "value":(binnedData[i][j]/binnedData[i]['count'+j]), "time": parseInt(j)});
		    				}
		    			}
		    		}
		    		output["values"] = results;

		    		res.json(output);
		    	});
		    } else if(value == 'profit' && (time1 || time2)) {
		    	var time1Moment = moment(time1);
		    	var time2Moment = moment(time2);
		    	var time = time1Moment.year()+'-'
		    	if(time1 && time2)
		    		queryString = "select profit as value, time, name from storeprofits inner join stores on storeprofits.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
		    	else if(time1)
		    		queryString = "select profit as value, time, name from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
		    	else if(time1)
		    		queryString = "select profit as value, time, name from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
		    	if(name == 'all' || name === undefined)
		    		queryString += '';
		    	else
		    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
		    	queryString += ' order by store_id';
		    	console.log(queryString);
		    	client.query(queryString, function(err, result) {
		    		done();
		    		if(err) return console.error(err);
		    		var binnedData = binData(result.rows, timeType, stores);
		    		var results = [];
		    		for(var i in binnedData){
		    			for(var j in binnedData[i]){
		    				if(j.indexOf('count') == -1){
		    					results.push({"store":parseInt(i), "value":(binnedData[i][j]/binnedData[i]['count'+j]), "time": parseInt(j)});
		    				}
		    			}
		    		}
		    		output["values"] = results;

		    		res.json(output);
		    	});
		    } else {
		    	output["values"] = "provide time time1 or time2 parameters";
		    	res.json(output);
		    }
		    
		  });
	});
}

function binData(rows, timeType, stores) {
	var storeToTimeBins = {};
	switch(timeType)
	{
		case "hour":
			for(var i in rows) {
				if(storeToTimeBins[stores[rows[i].name]] && storeToTimeBins[stores[rows[i].name]][hourColumnsIds[moment(rows[i].time).hour()]]) {
					storeToTimeBins[stores[rows[i].name]][hourColumnsIds[moment(rows[i].time).hour()]] += rows[i].value;
					storeToTimeBins[stores[rows[i].name]]['count'+hourColumnsIds[moment(rows[i].time).hour()]]++;
				} else {
					if(!storeToTimeBins[stores[rows[i].name]])
						storeToTimeBins[stores[rows[i].name]] = {};
					storeToTimeBins[stores[rows[i].name]][hourColumnsIds[moment(rows[i].time).hour()]] =  rows[i].value;
					storeToTimeBins[stores[rows[i].name]]['count'+hourColumnsIds[moment(rows[i].time).hour()]] = 1;
				}	
			}
			break;
		case "day":
			for(var i in rows) {
				if(storeToTimeBins[stores[rows[i].name]] && storeToTimeBins[stores[rows[i].name]][dayColumnsIds[moment(rows[i].time).day()]]) {
					storeToTimeBins[stores[rows[i].name]][dayColumnsIds[moment(rows[i].time).day()]] += rows[i].value;
					storeToTimeBins[stores[rows[i].name]]['count'+dayColumnsIds[moment(rows[i].time).day()]]++;
				} else {
					if(!storeToTimeBins[stores[rows[i].name]])
						storeToTimeBins[stores[rows[i].name]] = {};
					storeToTimeBins[stores[rows[i].name]][dayColumnsIds[moment(rows[i].time).day()]] =  rows[i].value;
					storeToTimeBins[stores[rows[i].name]]['count'+dayColumnsIds[moment(rows[i].time).day()]] = 1;
				}	
			}
			break;
		case "month":
			for(var i in rows) {
				if(storeToTimeBins[stores[rows[i].name]] && storeToTimeBins[stores[rows[i].name]][moment(rows[i].time).month()+1]) {
					storeToTimeBins[stores[rows[i].name]][moment(rows[i].time).month()+1] += rows[i].value;
					storeToTimeBins[stores[rows[i].name]]['count'+(moment(rows[i].time).month()*1+1)]++;
				} else {
					if(!storeToTimeBins[stores[rows[i].name]])
						storeToTimeBins[stores[rows[i].name]] = {};
					storeToTimeBins[stores[rows[i].name]][moment(rows[i].time).month()+1] =  rows[i].value;
					storeToTimeBins[stores[rows[i].name]]['count'+(moment(rows[i].time).month()*1+1)] = 1;
				}	
			}
			break;
		default:
			break;
	}

	// console.log(storeToTimeBins);
	return storeToTimeBins;
}

// function sendMapData(req, res) {
// 	var output = {};
// 	var name = req.body.name || req.query.name;
// 	var timeType = req.body.timeType || req.query.timeType;
// 	var time1 = req.body.time1 || req.query.time1;
// 	var time2 = req.body.time2 || req.query.time2;
// 	var value = req.body.value || req.query.value;
// 	switch(timeType)
// 	{
// 		case "hour":
// 			output["columns"] = hourColumns;
// 			break;
// 		case "day":
// 			output["columns"] = dayColumns;
// 			break;
// 		case "month":
// 			output["columns"] = monthColumns;
// 			break;
// 		default:
// 			output["columns"] = "timeType parameter not specified";
// 	}
	
// 	var queryString = 'SELECT name as store, id FROM stores';
// 	if(name == 'all' || name === undefined)
// 		queryString += '';
// 	else
// 		queryString += ' WHERE LOWER(name) like \'%' + name.toLowerCase() +'%\'';
	
// 	var stores = {};
// 	var pg = require('pg'); 
// 	pg.connect(process.env.DATABASE_URL || 'postgres://localhost:5432/floorplanviz', function(err, client, done) {
// 		client.query(queryString, function(err, result) {
// 		    done();
// 		    if(err) return console.error(err);
		    
// 		    output["rows"] = result.rows;
// 		    for(var i in result.rows) {
// 		    	stores[result.rows[i].store] = i*1+1;
// 		    }
		    
// 		    if(value == 'customers' && (time1 || time2)) {
// 		    	var time1Moment = moment(time1);
// 		    	var time2Moment = moment(time2);
// 		    	var time = time1Moment.year()+'-'
// 		    	if(time1 && time2)
// 		    		queryString = "select round(avg(number),2) as value, store_id as id from storecustomers inner join stores on storecustomers.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
// 		    	else if(time1)
// 		    		queryString = "select round(avg(number),2) as value, store_id as id from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
// 		    	else if(time1)
// 		    		queryString = "select round(avg(number),2) as value, store_id as id from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
// 		    	if(name == 'all' || name === undefined)
// 		    		queryString += '';
// 		    	else
// 		    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
// 		    	queryString += ' group by store_id order by store_id';
// 		    	console.log(queryString);
// 		    	client.query(queryString, function(err, result) {
// 		    		done();
// 		    		if(err) return console.error(err);
// 		    		var results = [];
// 		    		for(var i in result.rows) {
// 		    			results.push({"id":result.rows[i].id, "value":result.rows[i].value});
// 		    		}
// 		    		output["values"] = results;

// 		    		res.json(output);
// 		    	});
// 		    } else if(value == 'profit' && (time1 || time2)) {
// 		    	var time1Moment = moment(time1);
// 		    	var time2Moment = moment(time2);
// 		    	var time = time1Moment.year()+'-'
// 		    	if(time1 && time2)
// 		    		queryString = "select round(avg(profit),2) as value, store_id as id from storeprofits inner join stores on storeprofits.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
// 		    	else if(time1)
// 		    		queryString = "select round(avg(profit),2) as value, store_id as id from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
// 		    	else if(time1)
// 		    		queryString = "select round(avg(profit),2) as value, store_id as id from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
// 		    	if(name == 'all' || name === undefined)
// 		    		queryString += '';
// 		    	else
// 		    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
// 		    	queryString += ' group by store_id order by store_id';
// 		    	console.log(queryString);
// 		    	client.query(queryString, function(err, result) {
// 		    		done();
// 		    		if(err) return console.error(err);
// 		    		var results = [];
// 		    		for(var i in result.rows) {
// 		    			results.push({"id":result.rows[i].id, "value":result.rows[i].value});
// 		    		}
// 		    		output["values"] = results;

// 		    		res.json(output);
// 		    	});
// 		    } else {
// 		    	output["values"] = "provide time time1 or time2 parameters";
// 		    	res.json(output);
// 		    }
		    
// 		  });
// 	});
// }