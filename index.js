var express = require('express');
var path = require('path');
var walk = require('walk');
var Table = require('cli-table');
var colors = require('colors');

require('dotenv').config();

var app = express();

function errorRequestHandler(req, res) {
  console.log(`${colors.yellow(getTime())} ${colors.red.bold(req.method)} ${colors.red(req.url)} - ${colors.italic.red("Has been requested but the endpoint is missing")}`);
  setCORSHeadersToResult(res);
  res.sendStatus(404);
}

function getTime() {
  return new Date().toLocaleTimeString('sv-SE');
}

function setCORSHeadersToResult(res){
  res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
}

// console.log('Terminal size: ' + process.stdout.columns + 'x' + process.stdout.rows);

// Walker options
var walker  = walk.walk('./api', { followLinks: false });
var files = [];

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    files.push(root + '/' + stat.name);
    next();
});

walker.on('end', function() {
  const routeTable = new Table({
    head: [
      colors.bold.white("Routes/Available endpoints"), 
      colors.bold.white("GET"), 
      colors.bold.white("POST"), 
      colors.bold.white("DELETE")
    ]
  });

  console.log(`
     _______________ 
    |               |  
    |     GREAT     |  
    |      API      |  
    |   DATA-MOCK   |
    |  ,   ^_^   ,  |  
    |_/(_________)\\_|  
      \\ _/     \\_ /    
      //         \\\\    
      \\\\ (@) (@) //    
       \\'=""=""='/     
   ,===/         \\===,
 "",===\\         /===,""
 "" ,==='-------'===, ""
  ""                 ""`);

  //Sort files without response.json ending in filename

  for (let i = 0; i < files.length; i++) {
    let filePath = files[i];
    
    if (filePath.indexOf("response.json") === -1) {
      continue;
    }

    filePath = filePath.replace(/\\/g, "/");
    filePath = filePath.replace("/response.json", "");
    filePath = filePath.replace("./", "/");

    app.get(filePath, (req, res) => {
      console.log(`${colors.yellow(getTime())} ${colors.green.bold(req.method)} ${req.route.path}`);
    
      setCORSHeadersToResult(res);
      res.header("Content-Type",'application/json');
      res.sendFile(path.join(__dirname, filePath, "response.json"));
    })
  }

  for (let i = 0; i < app._router.stack.length; i++) {
    const r = app._router.stack[i];
    if(r.route && r.route.path){
      routeTable.push([
          `http://localhost:${process.env.PORT}${r.route.path}`, 
          r.route.methods.get ? colors.green("Yes") : colors.red("No"),
          r.route.methods.post ? colors.green("Yes") : colors.red("No"),
          r.route.methods.delete ? colors.green("Yes") : colors.red("No"),
        ])
    }      
  }
  
  // Handle unmapped requests with errorRequestHandler
  app.get("*", errorRequestHandler);
  app.post("*", errorRequestHandler);
  app.options("*", errorRequestHandler);
  app.delete("*", errorRequestHandler);

  // Print the route-table
  console.log(routeTable.toString());

  // Start the server
  app.listen(process.env.PORT);
  console.log(`${colors.yellow(getTime())} ${colors.bgWhite.black.bold(" Server ")} Application is up and running on http://localhost:${process.env.PORT}`);

});
