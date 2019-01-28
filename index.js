var express = require('express')
var app = express()
var path = require('path')
var walk = require('walk');

require('dotenv').config()

// Walker options
var walker  = walk.walk('./api', { followLinks: false });
var files = [];

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    files.push(root + '/' + stat.name);
    next();
});

walker.on('end', function() {
  console.log(`- - - - - - - - - - - - - - - - - - - - - - - - - `)
  console.log("");
  console.log(`🐙 Great API Mock!`)
  console.log("");
  console.log(`- - - - - - - - - - - - - - - - - - - - - - - - - `)
  console.log(`Available endpoints:`)

  for (let i = 0; i < files.length; i++) {
    let filePath = files[i];
    
    if (filePath.indexOf("response.json") === -1) {
      continue;
    }

    filePath = filePath.replace("/response.json", "");
    filePath = filePath.replace("./", "/");

    app.get(filePath, (req, res) => {
      console.log(`Request: ${req.route.path}`);
      res.header("Content-Type",'application/json');
      res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN)
      res.header("Access-Control-Allow-Credentials", "true")
      res.header("Status", 200)
      res.sendFile(path.join(__dirname, filePath, "response.json"));
    })
  }

  for (let i = 0; i < app._router.stack.length; i++) {
    const r = app._router.stack[i];
    if(r.route && r.route.path){
        var methods = r.route.methods.get ? "[GET]" : "";
        console.log(`${methods} http://localhost:${process.env.PORT}${r.route.path}`)
    }      
  }
console.log(`- - - - - - - - - - - - - - - - - - - - - - - - - `)
    
  app.get("*", (req, res) => {
    console.log(`\x1b[31mMISSING: ${req.url}\x1b[0m`);
    res.sendStatus(404)
  })

  // Start the server
  app.listen(process.env.PORT)
  console.log(`Server is up and running on http://localhost:${process.env.PORT}`)
});
