
/**
 *  primary file for the api
 *  GET http://localhost:3000/hello
 *  GET https://localhost:3000/hello
 * 
 */

// Dependencies
const http        = require('http');
const https       = require('https');
const url         = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config        = require('./lib/config');
var fs            = require('fs');
//var data         = require('./lib/data'); // solo para test
var handlers      = require('./lib/handlers');
var helpers       = require('./lib/helpers');


//*******************  TESTING  *****************************************************************
//@create. this is a way to test funcionalities
// data.create('test', 'newFile', {'name': 'yorsh'}, function(err) {
//    console.log('this was the error', err);
// });

//testing
//@read
// data.read('users', '2233362389', function(err, data) {
//    console.log(`this was the error ${err}, and this was the data`);
//    console.log(data);
// });

//testing
//@update
// data.update('test', 'newFile', {'name' : 'lizzy'}, function(err) {
//    console.log(`The error is ${err}`);
// });

//TESTING
//@delete
// data.delete('test', 'newFile', (err) => {
//    console.log(`The error was ${err}`);
// })
/************************************************************************************************* */


//the server should respond to all request with a string
//instantiate the HTTP server
var httpServer = http.createServer((req, res) => {
   unifiedServer(req, res);
});

//instantiate the HTTPS server
var httpsServerOptions = {
   'key' : fs.readFileSync('./https/key.pem'),
   'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, (req, res) => {
   unifiedServer(req, res);
});

//Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
   console.log(`the server is listening on port ${config.httpsPort} in config ${config.envName} mode`);
});

//start the server, and have it listen on port 3000 if its development
httpServer.listen(config.httpPort, () => {
   console.log(`the server is listening on port ${config.httpPort} in config ${config.envName} mode`);
});

// All the server logic for both the http and https server
var unifiedServer = (req, res) => {
   // get url and parse it
   var parsedUrl = url.parse(req.url, true)


   // get the path
   var path = parsedUrl.pathname; //get the path that the user send as url example htpp://localhost:3000/hola 
   var trimmedPath = path.replace(/^\/+|\/+$/g , ''); // users

   // Get the query string as an object, parametersf
   var queryStringObject = parsedUrl.query; //localhost:3000/hola?yorsh=lizzy
   // console.log(queryStringObject);
   //get HTTP method
   var method = req.method.toLowerCase();

   //get the headers as an object
   var headers = req.headers; // 'accept-encoding': 'gzip, deflate, br', 'content-type': 'text/plain',

   //get the payload, if any
   var decoder = new StringDecoder('utf-8');    //using with post, to get data objects or something
   var buffer  = '';

   req.on('data', function(data){
      buffer += decoder.write(data);
   });

   //this function is called on every request
   req.on('end', function() {
      buffer += decoder.end();
      
      // choose the handler this request should go to
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
      // construct the data object to send to the handler
      // var data = {
      //    'trimmedPath': trimmedPath,
      //    'queryStringObject': queryStringObject,
      //    'method': method,
      //    'headers': headers,
      //    payload: buffer
      // }
      var data = {
         trimmedPath,
         queryStringObject,
         method,
         headers,
         payload: helpers.parseJsonToObject(buffer)
      }
      //route the request to the handler specified in the router
      chosenHandler(data, function (statusCode, payload) {
         //use the status code callback by the handler, or default to 200
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

         // use the pyaload back by the handler, or default to an empty object
         payload = typeof(payload) == 'object' ? payload : {};

         //convert the payload to a string
         var payloadString = JSON.stringify(payload);

         //return the response
         res.setHeader('Content-Type', 'application/json'); //set that we are going to send is a json type
         res.writeHead(statusCode);
         res.end(payloadString);
         
         //log the request path
         console.log(`returning this response: ${statusCode}, ${payloadString}`);
      });

      //log the request path
      // console.log(`Request received on path: ${trimmedPath} with method ${method} and with these query string parameters`);

      // console.log(queryStringObject);
      // console.log(headers);

      // console.log(`received with this payload`);
      // console.log(buffer);

   }); 
}

//we should add to the route the name that we want, if not, we will return a 404
var router = {                //http://localhost:3000/sample   using post, devuelve este objecto
   'ping' : handlers.ping,
   'hello': handlers.hello,
   'users': handlers.users
}