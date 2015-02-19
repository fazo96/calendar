#!/usr/bin/env node
// Load modules
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
// Initialization
var app = express();
app.use(bodyParser.json())

// Default Settings
var settings = {
  port: 3000,
  mysqlHost: 'localhost',
  mysqlUser: 'root'
}
// Try to read settings from file
console.log("Reading settings...");
try {
  var settingsFile = fs.readFileSync('./settings.json').toString();
  settings = JSON.parse(settingsFile);
  console.log("Using settings from settings.json");
} catch (e) {
  console.log("Failed reading settings.json file! Using defaults")
}

// Create sql connection
var connection = mysql.createConnection({
  host     : settings.mysqlHost,
  user     : settings.mysqlUser,
  password : settings.mysqlPassword
});
connection.connect();
connection.query('use calendar;');

// Define logger middleware for all requests
app.use(function (req, res, next) {
  console.log('Request from '+req.ip+' URL:'+req.originalUrl+' at time:', Date.now());
  next();
});

// Define query abstraction
function execute(query,res){
  console.log("Attempting query: "+query);
  connection.query(query, function(err,rows){
    if(err){
      console.log("Query " + err);
      res.status(400).json(err);
    } else {
      res.status(200).json(rows);
    }
  });
}

// "ADD EVENT" api definition
app.post('/',function(req,res){
  var query = "insert into events (descrizione,date,time,durata) values ('";
  query += req.body.desc+"','"+req.body.date+"','"+req.body.time
  query += "',"+req.body.duration+");"
  execute(query,res);
});

// "DELETE EVENT" api definition
app.delete('/:id',function(req,res){
  var query = "delete from events where id = "+req.params.id+";";
  execute(query,res);
});

// "GET DAY" api definition
app.get('/:date',function(req,res){
  var query = 'select * from events where date = "'+req.params.date+'";'
  execute(query,res);
});

// "GET TIMESPAN" api definition
app.get('/:date1/:date2',function(req,res){
  var query = 'select * from events where date <= "'+req.params.date2+'" and date >= "'+req.params.date1+'";'; 
  execute(query,res);
});

// Start the service
app.listen(settings.port);
console.log('Calendar started on port ' + settings.port);
