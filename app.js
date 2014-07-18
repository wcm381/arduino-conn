
// Load Modules
var http = require('http'),
    net = require('net'),
    url = require('url'),
    fs = require('fs'),
    io = require('socket.io'),
    server;

var mysql = require('mysql2');

// HTTP Port Number for HTTP Server
var HTTP_PORT = 8080;


// Configure Connection to SQL Database
var connection = mysql.createConnection({
        host     : 'dbinstancesql.c7tazdmnvenv.us-east-1.rds.amazonaws.com',
        user     : 'userWill',
        password : 'mci84177',
        port     : '3306',
        database : 'mydbSQL1'
});


// Connect to SQL Database
connection.connect(function(err) {
if (err) {
   console.log("ERROR: " + err.message);
   throw err;
}
});


// Create Table
connection.query( 'CREATE TABLE IF NOT EXISTS sampleTbl (' +
  'P_Id INT NOT NULL AUTO_INCREMENT,' +
  'Time DATETIME NOT NULL,' +
  'Temp FLOAT NOT NULL,' +
  'PRIMARY KEY(P_Id)'	+
  ')', function( err ){
     if ( err ) {
      console.log("ERROR: " + err.message);	
      throw err;
     }
     console.log( 'Table created.' );
});


//
server = http.createServer( function(req,res){
   // 
   var path = url.parse(req.url).pathname;
   //
   var timeVal = getDataTime();
   
   //
   switch (path){
    case '/':
      //
      if (req.method == 'POST') {
        //
        console.log("POST");
        //  
        var body = "";
        //
        req.on('data', function(data) {
            body += data;
        });
        //
        req.on('end', function () {
            console.log("Body: " + body);
            // 
            var obj = JSON.parse(body);
            
            
            //
            var dataSet = { Time: timeVal, 
            //
            connection.query( 'INSERT INTO sampleTbl SET ?', sampleSet, function(err, result) {
                if ( err ) {
                    console.log("ERROR: " + err.message);	
                    throw err;
                }
                console.log(result);
            });
            
            
            //
            
            
            // DEBUGGING: Check Table Rows
            connection.query('SELECT * FROM sampleTbl', function (err, rows, result) {
                if ( err ) throw err;
                    for (var i in rows) {
                        console.log('Temp Values: ', rows[i].Temp);	
                    }
            });
            
            
            // End Connection to Database
            connection.end();	
            
            
            
            
            
            
            
        });
      } else {
        // Should Not Reach Here
        console.log(req.method);
      }
      break;
    default:
        res.writeHead(404);
        res.write("ops this doesn't exist - 404")
        res.end();
        break;
    }
});
  
  
server.listen(HTTP_PORT);








function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + " " + hour + "-" + min + "-" + sec;
}

