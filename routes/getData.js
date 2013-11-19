
/*
 * POST data.
 */

exports.getData = function(req, res){
	var type = req.body.type || req.query.type;
	if(type == 'stores') {
		var pg = require('pg'); 
		pg.connect(process.env.DATABASE_URL || 'postgres://localhost:5432/floorplanviz', function(err, client, done) {
			client.query('SELECT * FROM stores', function(err, result) {
			    done();
			    if(err) return console.error(err);
			    res.json(result.rows);
			  });
		});
	} else {
		res.json({});
	}
};