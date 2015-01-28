var express = require('express');
var fs = require('fs');
var app = express();
var port = 3000

// Settings
/*var settingsFile = fs.readFileSync('settings.json');
var settings = JSON.parse(settings);
port = settings.port*/

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : ''
});

connection.connect();
connection.query('use CALENDAR;');

// Database test
connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;
  console.log('The solution is: ', rows[0].solution);
});

// Log middleware
app.use(function (req, res, next) {
  console.log('Request from '+req.ip+' URL:'+req.originalUrl+' at time:', Date.now());
  next();
});

// ADD api
app.get('/add/:desc&:date&:time&:duration',function(req,res){
  var query = "insert into events (descrizione,date,time,durata) values ('";
  query += req.params.desc+"','"+req.params.date+"','"+req.params.time
  query += "',"+req.params.duration+");"
  connection.query(query, function(err,rows){
    console.log(err);
    if(err){
      res.status(400).json(err);
    } else {
      res.status(200).json(rows);
    }
  });
});

// DELETE api
app.get('/delete/:id',function(req,res){
  var query = "delete from events where id = "+req.params.id+";";
  connection.query(query, function(err,rows){
    console.log(err);
    if(err){
      res.status(400).json(err);
    } else {
      res.status(200).json(rows);
    }
  });
});

app.listen(port);
console.log('Calendar started on port ' + port);
