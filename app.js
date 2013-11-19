
/**
 * Module dependencies.
 */

var express = require('express'), 
exphbs  = require('express3-handlebars'),
cors = require('cors');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.engine('html', exphbs({defaultLayout: 'main.html'}));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
// app.use(cors);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var getDataRoute = require('./routes/getData');
app.post('/getData', getDataRoute.getData);

app.get('/getData', cors(), getDataRoute.getData);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

exports = app;
