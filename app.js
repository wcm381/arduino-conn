
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
        host     : 'XXXXXXX',
        user     : 'XXXXX',
        password : 'XXXXXX',
        port     : '3306',
        database : 'XXXXX'
});


// Create HTTP Server for Arduino Connection
server = http.createServer( function(req,res){
   // Get URL Path of Request
   var path = url.parse(req.url).pathname;
   //Get Current Time; the Approximate Time of POST Request
   var timeVal = getDataTime();
   // Check For Correct URL Path
   switch (path){
    case '/':
      // Check for Proper Request Method
      if (req.method == 'POST') {
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
        // Acknowledge POST Request Method in Console
        console.log("POST");
        //  Initialize Variable to Store POST Data 
        var body = "";
        // If Data and No 'end' Received
        req.on('data', function(data) {
            body += data;
        });
        // Received 'end' of POST Request
        req.on('end', function () {
            // Display Received Request Data
            console.log("Body: " + body);
            // Pasre JSON Packet Received From Arduino
            var obj = JSON.parse(body);
            // Get Components of Parsed JSON Packet
            var tempVal = obj.temp;
            // Create SET to Insert Into Table
            var dataSet = { Time: timeVal, Temperature: tempVal };
            // Insert the SET to Table
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
// Set Port Number for HTTP Server to Listen To  
server.listen(HTTP_PORT);

// Get the Current Date and Time and Return in MySQL Date Data Type Format
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

