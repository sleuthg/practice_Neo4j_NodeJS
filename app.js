// This version of the app uses the native Neo4j built-in REST interface

var express = require('express');
var request = require('request'); // the request module is a Node.JS module to make REST calls
var path = require('path');
var http = require('http');
var fs = require('fs');
var dbapi = require('./lib/dbapi.js');
//var async = require("async");

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

// Clear the database of Stitches and Yarn
dbapi.clearDB(runCypherQuery);

var dataFile = './data/learning_threads_001.json';
//dbapi.loadFile(fs,dataFile, dbapi.printData);
dbapi.loadFile(fs,dataFile,dbapi.addDataToDB);
