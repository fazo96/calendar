#!/usr/bin/env node
// Load modules
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var chalk = require('chalk');

// Initialization
var app = express();
app.use(bodyParser.json())
app.use(function (req, res, next) {
  // Log all requests
  console.log(chalk.underline.cyan('\nRequest') + chalk.bold(' from ') + chalk.underline(req.ip) + chalk.bold('\n\tMethod: ') + chalk.underline(req.method) + chalk.bold('\n\tURL: ') + chalk.underline(req.originalUrl) + chalk.bold('\n\tTime ') + chalk.underline(Date()));
  next();
});

// Fix request URLs
app.use(function(req,res,next){
  req.url = req.url.replace("%20"," ")
  next();
});

// Prevent SQL Injection
app.use(function(req,res,next){
  req.url = req.url.replace("'","").replace('"',"").replace(';',"");
  next();
});

// Default Settings
var settings = {
  port: 3000,
  mysqlHost: 'localhost',
  mysqlUser: 'root'
}
// Try to read settings from file
console.log(chalk.yellow("Reading settings..."))
try {
  var settingsFilePath = './settings.json'
  var settingsFile = fs.readFileSync(settingsFilePath).toString()
  settings = JSON.parse(settingsFile)
  console.log(chalk.green("Using settings from " + chalk.bold(settingsFilePath)))
} catch (e) {
  console.log(chalk.red("Failed reading settings.json file!") + " " + chalk.green("Using defaults"))
  console.log(chalk.green.bold("Default settings (in use): ") + chalk.bold(JSON.stringify(settings)))
}

// Create sql connection
var connection = mysql.createConnection({
  host     : settings.mysqlHost,
  user     : settings.mysqlUser,
  password : settings.mysqlPassword
});
connection.connect(function(err){
  if(err){
    console.log(chalk.red("Failed to connect to SQL Database: ") + chalk.bold(err));
    process.exit(-1)
  }
})
connection.query('use calendar;');

// Define query abstraction
function execute(query,res,code){
  console.log(chalk.green('Querying: ') + chalk.inverse(query))
  connection.query(query, function(err,rows){
    if(err){
      res.status(400).json(err);
      console.log(chalk.red('Replying: ') + chalk.underline(400) + chalk.red(' With Error: ') + chalk.inverse(err))
    } else {
      res.status(code || 200).json(rows);
      console.log(chalk.green('Replying: ') + chalk.underline(code || 200) + chalk.green(' With Data: ') + chalk.bold(JSON.stringify(rows)))
    }
  });
}

// "ADD EVENT" api definition
app.post('/',function(req,res){
  var query = "insert into events (descrizione,startDate,endDate) values ('";
  query += req.body.desc+"','"+req.body.startDate+"','"+req.body.endDate+"');"
  execute(query,res);
});

// "DAY" api definition
function dayQuery(date){
 return " from events where ((startDate between '"+date+" 00:00:00.000' and '"+date+" 23.59.59.000') or startDate < '"+date+"') and (endDate > '"+date+"' or (endDate between '"+date+" 00:00:00.000' and '"+date+" 23.59.59.000'));";
};

app.get('/day/:date',function(req,res){
  execute("select *" + dayQuery(req.params.date),res);
});

app.delete('/day/:date',function(req,res){
  execute("delete" + dayQuery(req.params.date),res);
});

// "ID" api definition
app.delete('/:id',function(req,res){
  var query = "delete from events where id = "+req.params.id+";";
  execute(query,res);
});

app.get('/:id',function(req,res){
  var query = "select * from events where id = "+req.params.id+";";
  execute(query,res);
});

// "GET ALL" api definition
app.get('/',function(req,res){
  execute("select * from events;",res);
});

// "TIMESPAN" api definition
function timespanQuery(date1,date2){
  return ' from events where ((startDate <= "'+date2+'" and startDate >= "'+date1+'") or (endDate >= "'+date1+'" and endDate <= "'+date2+'") or (startDate <= "'+date1+'" and endDate >= "'+date2+'"));';
};

app.get('/:date1/:date2',function(req,res){
  execute("select *" + timespanQuery(req.params.date1,req.params.date2),res);
});

app.delete('/:date1/:date2',function(req,res){
  execute("delete" + timespanQuery(req.params.date1,req.params.date2),res);
});

app.use(function(req,res,next){
  console.log(chalk.green('wReplying: ') + chalk.underline(res.code) + chalk.green(' With Data: ') + chalk.bold(JSON.stringify(res.body)))
  next()
});

// Start the service
app.listen(settings.port);
console.log(chalk.green('Calendar started on port ' + chalk.bold.underline(settings.port)));
