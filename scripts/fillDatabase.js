require('./moment.min.js');
require('./twix.js');

var pg = require('pg').native;


main();


function main() {
	// insertStores();
	insertNumCustomers(30);
	insertProfits(30);
}


var stores = [
{ 
	name: 'Macys', x: 318, y: 618
},
{ 
	name: 'Nike', x: 520, y: 278
},
{ 
	name: 'TMobile', x: 511, y: 633
},
{ 
	name: 'Verizon', x: 921, y: 604
},
{ 
	name: 'ATT', x: 1260, y: 629
},
{ 
	name: 'Safeway', x: 1586, y: 543
},
{ 
	name: 'Adidas', x: 1371, y: 320
},
{ 
	name: 'BoA', x: 1076, y: 272
},
{ 
	name: 'CapitalOne', x: 789, y: 272
},
];


function insertStores () {
	pg.connect(process.env.DATABASE_URL || 'postgres://localhost:5432/floorplanviz', function(err, client) {
		var query = client.query('drop table stores;', function(err, result) {
			
		});
		query = client.query('create table stores(id serial primary key, name text, x integer, y integer);', function(err, result) {
			
		});
		for(var i in stores) {
			query = client.query('insert into stores (name, x, y) values (\''+ stores[i].name +'\',' + stores[i].x + ',' + stores[i].y +');', function(err, result) {
			});
		}
		query.on('end', function() { client.end(); });
	});
}

/*
parameters: howManyDays - days of data to create
*/
function insertNumCustomers (howManyDays) {
	pg.connect(process.env.DATABASE_URL || 'postgres://localhost:5432/floorplanviz', function(err, client) {
		var query = client.query('drop table storecustomers;', function(err, result) {
			
		});
		query = client.query('create table storecustomers(id serial primary key, number integer, store_id integer, foreign key(store_id) references stores(id), time timestamp);', function(err, result) {
			
		});

		var iter = moment().subtract('days', howManyDays).twix(moment()).iterate("days");
		var date, time, number;
		while(iter.hasNext()) {
			date = iter.next();
			for(var hour = 9; hour <= 22; hour++){
				for(var i in stores) {
					var time = date.year() + "-" + date.month() + "-" + date.date() + " " + hour + ':00';
					number = Math.floor((Math.random()*100)+1);
					query = client.query('insert into storecustomers (store_id, number, time) values ('+ (i*1+1) +',' + number + ',\'' + time  +'\');', function(err, result) {
					});
				}

			}
		}
		query.on('end', function() { client.end(); });
	});
}

/*
parameters: howManyDays - days of data to create
*/
function insertProfits (howManyDays) {
	pg.connect(process.env.DATABASE_URL || 'postgres://localhost:5432/floorplanviz', function(err, client) {
		var query = client.query('drop table storeprofits;', function(err, result) {
			
		});
		query = client.query('create table storeprofits(id serial primary key, profit integer, store_id integer, foreign key(store_id) references stores(id), time timestamp);', function(err, result) {
			
		});

		var iter = moment().subtract('days', howManyDays).twix(moment()).iterate("days");
		var date, time, profit;
		var min = 500;
		var max = 5000;
		while(iter.hasNext()) {
			date = iter.next();
			for(var hour = 9; hour <= 22; hour++){
				for(var i in stores) {
					time = date.year() + "-" + date.month() + "-" + date.date() + " " + hour + ':00';
					profit = Math.floor(Math.random() * (max - min + 1)) + min;
					query = client.query('insert into storeprofits (store_id, profit, time) values ('+ (i*1+1) +',' + profit + ',\'' + time  +'\');', function(err, result) {
					});
				}

			}
		}
		query.on('end', function() { client.end(); });
	});
}