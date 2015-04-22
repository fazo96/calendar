#!/usr/bin/env node
// Load modules
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var chalk = require('chalk');
var cli = require('commander')

// Configuring command line options
cli
  .version('0.2')
  .usage('[options]')
  .option('-p, --port <port>', 'the port of the main server', parseInt)
  .option('-s, --settings <file>', 'the file used to read settings')
  .option('-f, --forcehttps', 'force usage of https (only possible if using https)')
  .option('-i, --init', 'create required database and tables')
  .parse(process.argv)

// Configuring default Settings
var settings = {
  port: cli.port || 3000,
  mysqlHost: 'localhost',
  mysqlUser: 'root'
}

// This function reads settings from a given file
function readSettings(settingsFilePath){
  var settingsFile = fs.readFileSync(settingsFilePath).toString()
  sets = JSON.parse(settingsFile)
  console.log(chalk.green("Loading settings from " + chalk.bold(settingsFilePath)))
  settings = sets
  settings.port = cli.port || settings.port || 3000
  settings.forcehttps = cli.forcehttps || settings.forcehttps || true
  return settings
}

// Try to read settings from file
console.log(chalk.yellow("Reading settings..."))
try {
  readSettings(cli.settings || './settings.json')
} catch (e) {
  // Use defaults
  console.log(chalk.red("Failed reading '"+(cli.settings || './settings.json')+"'!") + " " + chalk.green("Using defaults"))
  console.log(chalk.green.bold("Default settings (in use): ") + chalk.bold(JSON.stringify(settings)))
}

// Initialization

// Print PID
console.log(chalk.green(chalk.bold("PID: ") + process.pid))

// Configure MySQL INIT script
var initSql = 'create database IF NOT EXISTS calendar;\nuse calendar;\nCREATE TABLE events(id int auto_increment primary key, description char(50) not null, startDate DATETIME not null, endDate DATETIME not null);'

// Configure web server
var app, srv, io, secondaryApp;
if(settings.httpsKey && settings.httpsCertificate) {
  // Use HTTPS
  console.log(chalk.green.bold("Using HTTPs"))
  app = express.createServer({ key: settings.httpsKey, cert: settings.httpsCertificate })
  secondaryApp = express();
  secondaryApp.all('*', function(req,res){
    res.redirect("https://"+req.headers.host+req.headers.url);
  });
} else {
  app = express();
}
srv = require('http').Server(app)
io = require('socket.io')(srv)
console.log(chalk.green('Activating WebSocket API'))

// Configure Web server Middlewares
app.use(function (req, res, next) {
  // Log all requests
  console.log(chalk.underline.cyan('\nRequest') + chalk.bold(' from ') + chalk.underline(req.ip) + chalk.bold('\n\tMethod: ') + chalk.underline(req.method) + chalk.bold('\n\tURL: ') + chalk.underline(req.originalUrl) + chalk.bold('\n\tTime ') + chalk.underline(Date()) + chalk.bold('\n\tBody ') + chalk.underline(req.body));
  next();
});

app.use(bodyParser.json())

// Serve static files
if(settings.enableGUI){
  app.use(express.static("gui"))
  // Make angular html5 mode work
  function sendIndex(req,res){
    console.log('sending',__dirname+'/gui/index.html')
    res.sendFile(__dirname+'/gui/index.html')
  }
  var links = ["/evt/:id","/insert"]
  for(var i in links){
    app.get(links[i],sendIndex)
  }
  console.log(chalk.green("Enabled "+chalk.bold("HTML GUI")))
} else console.log(chalk.green("Disabled "+chalk.bold("HTML GUI")))

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

// Initialize Database if needed
if(cli.init){
  console.log(chalk.yellow("Launching init SQL script: ")+chalk.inverse(initSql.replace('\n','')))
    // Run INIT queries
    initSql.split('\n').forEach(function(i){
      connection.query(i,function(err,res){
        if(err){
          console.log(chalk.red("Failed to initialize database: ") + chalk.bold(err));
          process.exit(-1)
        }
      })
    })
} else connection.query('use calendar;');

// This function executes a query and when it's done replies
// to the HTTP request with the results 
function execute(query,res,code,onSuccess){
  console.log(chalk.green('Querying: ') + chalk.inverse(query))
  connection.query(query, function(err,rows){
    // Query finished
    if(err){
      if(res) res.status(400).json(err);
      console.log(chalk.red('Replying: ') + chalk.underline(400) + chalk.red(' With Error: ') + chalk.inverse(err))
    } else {
      if(res) res.status(code || 200).json(rows);
      console.log(chalk.green('Replying: ') + chalk.underline(code || 200) + chalk.green(' With Data: ') + chalk.bold(JSON.stringify(rows)))
      if(onSuccess && onSuccess.call){
        onSuccess(rows)
      }
    }
  });
}

// "ADD EVENT" api definition
app.post('/events',function(req,res){
  var query = "insert into events (description,startDate,endDate) values ('";
  query += req.body.description+"','"+req.body.startDate+"','"+req.body.endDate+"');"
  execute(query,res,200,function(){
    if(usingio) io.emit('new-event',req.body)
  });
});

// "PUT EVENT" api definition
app.put('/events/:id',function(req,res){
  var arr = []
  for(var o in req.body){
    arr.push(o+'="'+req.body[o]+'"')
  } 
  var query = "update events set "+arr.join(', ')+' where id = '+req.params.id+';'
  execute(query,res,200,function(){
    if(!usingio) return;
    var obj = req.body
    obj.oldId = req.params.id
    io.emit('updated-event',obj)
  })
})

// "DAY" api definition
function dayQuery(date){
 return " from events where ((startDate between '"+date+" 00:00:00.000' and '"+date+" 23.59.59.000') or startDate < '"+date+"') and (endDate > '"+date+"' or (endDate between '"+date+" 00:00:00.000' and '"+date+" 23.59.59.000'));";
};

app.get('/events/day/:date',function(req,res){
  execute("select *" + dayQuery(req.params.date),res);
});

app.delete('/events/day/:date',function(req,res){
  execute("delete" + dayQuery(req.params.date),res,200,function(){
    if(usingio) io.emit('deleted-events', { day: req.params.date })
  });
});

// "ID" api definition
app.delete('/events/:id',function(req,res){
  var query = "delete from events where id = "+req.params.id+";";
  execute(query,res,200,function(){
    if(usingio) io.emit('deleted-event', req.params.id)
  });
});

app.get('/events/:id',function(req,res){
  var query = "select * from events where id = "+req.params.id+";";
  execute(query,res);
});

// "GET ALL" api definition
app.get('/events',function(req,res){
  execute("select * from events;",res);
});

// "TIMESPAN" api definition
function timespanQuery(date1,date2){
  return ' from events where ((startDate <= "'+date2+'" and startDate >= "'+date1+'") or (endDate >= "'+date1+'" and endDate <= "'+date2+'") or (startDate <= "'+date1+'" and endDate >= "'+date2+'"));';
};

app.get('/events/:date1/:date2',function(req,res){
  execute("select *" + timespanQuery(req.params.date1,req.params.date2),res);
});

app.delete('/events/:date1/:date2',function(req,res){
  execute("delete" + timespanQuery(req.params.date1,req.params.date2),res,200,function(){
    if(usingio) io.emit('deleted-events', { from: req.params.date1, to: req.params.date2 })
  });
});

app.use(function(req,res,next){
  console.log(chalk.green('Replying: ') + chalk.underline(res.code) + chalk.green(' With Data: ') + chalk.bold(JSON.stringify(res.body)))
  next()
});

// Socket.io
io.on('connection',function(socket){
  console.log(chalk.green("WebSocket has connected"))
  socket.on('get-events', function(data){
    if(data.day){
      execute("select *" + dayQuery(data.day),null,200,function(res){
        socket.emit('events',res)
      });
    } else if(data.start && data.end){
      execute("select *" + timespanQuery(data.start,data.end),null,200,function(res){
        socket.emit('events',res)
      });
    }
  })
  socket.on('disconnect', function(data){
    console.log(chalk.yellow("WebSocket has disconnected"))
  })
})


// Start the service
app.listen(settings.port,function(){
  if(secondaryApp && settings.forcehttps && settings.enableGui && settings.port != 80){
    secondaryApp.listen(80);
    console.log(chalk.green('Calendar redirect app started on port ' + chalk.bold.underline(80)));
  }
  console.log(chalk.green('Calendar started on port ' + chalk.bold.underline(settings.port)));
});
