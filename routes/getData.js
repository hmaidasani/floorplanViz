
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
    {"time":"Tues"},
    {"time":"Wed"},
    {"time":"Thurs"},
    {"time":"Fri"},
    {"time":"Sat"},
    {"time":"Sun"}        
];

var monthColumns = [
    {"time":"Jan"},
    {"time":"Feb"},
    {"time":"Mar"},
    {"time":"Apr"},
    {"time":"May"},
    {"time":"Jun"},
    {"time":"Jul"},
    {"time":"Aug"},
    {"time":"Sept"},
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
			    		queryString = "select number, time, name from storecustomers inner join stores on storecustomers.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select number, time, name from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select number, time, name from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	if(name == 'all' || name === undefined)
			    		queryString += '';
			    	else
			    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
			    	console.log(queryString);
			    	client.query(queryString, function(err, result) {
			    		done();
			    		if(err) return console.error(err);
			    		var results = [];
			    		for(var i in result.rows) {
			    			results.push({"store":stores[result.rows[i].name], "value":result.rows[i].number, "time": hourColumnsIds[moment(result.rows[i].time).hour()]});
			    		}
			    		output["values"] = results;

			    		res.json(output);
			    	});
			    } else if(value == 'profit' && (time1 || time2)) {
			    	var time1Moment = moment(time1);
			    	var time2Moment = moment(time2);
			    	var time = time1Moment.year()+'-'
			    	if(time1 && time2)
			    		queryString = "select profit, time, name from storeprofits inner join stores on storeprofits.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select profit, time, name from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select profit, time, name from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	if(name == 'all' || name === undefined)
			    		queryString += '';
			    	else
			    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
			    	console.log(queryString);
			    	client.query(queryString, function(err, result) {
			    		done();
			    		if(err) return console.error(err);
			    		var results = [];
			    		for(var i in result.rows) {
			    			results.push({"store":stores[result.rows[i].name], "value":result.rows[i].profit, "time": hourColumnsIds[moment(result.rows[i].time).hour()]});
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

function sendMapData(req, res) {
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
		
		var queryString = 'SELECT name as store, id FROM stores';
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
			    		queryString = "select round(avg(number),2) as value, store_id as id from storecustomers inner join stores on storecustomers.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select round(avg(number),2) as value, store_id as id from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select round(avg(number),2) as value, store_id as id from storecustomers inner join stores on storecustomers.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	if(name == 'all' || name === undefined)
			    		queryString += '';
			    	else
			    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
			    	queryString += ' group by store_id order by store_id';
			    	console.log(queryString);
			    	client.query(queryString, function(err, result) {
			    		done();
			    		if(err) return console.error(err);
			    		var results = [];
			    		for(var i in result.rows) {
			    			results.push({"id":result.rows[i].id, "value":result.rows[i].value});
			    		}
			    		output["values"] = results;

			    		res.json(output);
			    	});
			    } else if(value == 'profit' && (time1 || time2)) {
			    	var time1Moment = moment(time1);
			    	var time2Moment = moment(time2);
			    	var time = time1Moment.year()+'-'
			    	if(time1 && time2)
			    		queryString = "select round(avg(profit),2) as value, store_id as id from storeprofits inner join stores on storeprofits.store_id = stores.id where time >= \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\' and time <= \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select round(avg(profit),2) as value, store_id as id from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time1Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	else if(time1)
			    		queryString = "select round(avg(profit),2) as value, store_id as id from storeprofits inner join stores on storeprofits.store_id = stores.id where time = \'" + time2Moment.format("YYYY-MM-DD HH:00") +"\'";
			    	if(name == 'all' || name === undefined)
			    		queryString += '';
			    	else
			    		queryString += ' AND LOWER(name) like \'%' + name.toLowerCase() +'%\'';
			    	queryString += ' group by store_id order by store_id';
			    	console.log(queryString);
			    	client.query(queryString, function(err, result) {
			    		done();
			    		if(err) return console.error(err);
			    		var results = [];
			    		for(var i in result.rows) {
			    			results.push({"id":result.rows[i].id, "value":result.rows[i].value});
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