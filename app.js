// This version of the app uses the native Neo4j built-in REST interface

var express = require('express');
var request = require('request'); // the request module is a Node.JS module to make REST calls
var path = require('path');
var http = require('http');
var fs = require('fs');
var dbapi = require('./lib/dbapi.js');

// Instantiate the Express.JS application
var app = express();

// Define a directory from which to serve static files
app.use(express.static(path.join(__dirname + '/data')));

// Define the host and port.
// This is where your database is running. Here it is defined on localhost.
var host = 'localhost';
var port = 7474; // <-- default Neo4j port

// This is the URL where we will POST our data to fire the cypher query.
// This is specified in Neo4j docs.
// Is this SAFE? Seems like anyone could use this route.
// Right now I've set up the Neo4j database to not require authentication for testing purposes
// (auth set in neo4j-server.properties file in /conf)
var httpUrlForTransaction = 'http://' + host + ':' + port + '/db/data/transaction/commit';

var datafile = './data/learning_threads_001.json';

// Read the test data
// @TODO: Turn this into a function with the filename as a parameter
fs.readFile(datafile,'UTF-8', function(err,data) {
  if (err) {
    return console.log(err);
  }
  // console.log(data);
  var testData = JSON.parse(data);
  console.log(testData);
});

// Define a function which fires the cypher query.
function runCypherQuery(query, params, callback) {
  request.post({
      uri: httpUrlForTransaction,
      json: {statements: [{statement: query, parameters: params}]}
    },
    function (err, res, body) {
      callback(err, body);
    });  //.auth('neo4j', 'neo4j', true);  // Here's how to add an authentication header with the request Node module

}

/**
 * Let’s fire some queries below.
 * */
// runCypherQuery(
//   'CREATE (somebody:Person { name: {name}, from: {company}, age: {age} }) RETURN somebody', {
//     name: 'Ghuffran',
//     company: 'Modulus',
//     age: 44
//   }, function (err, resp) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(resp);
//     }
//   }
// );
