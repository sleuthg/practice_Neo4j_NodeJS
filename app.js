// This version of the app uses the native Neo4j built-in REST interface

var request = require('request'); // the request module is a Node.JS module to make REST calls

// Define your host and port. This is where your database is running. Here it is defined on localhost.
var host = 'localhost';
var port = 7474;

// This is the URL where we will POST our data to fire the cypher query.
// This is specified in Neo4j docs.
// Is this SAFE? Seems like anyone could use this route.
var httpUrlForTransaction = 'http://' + host + ':' + port + '/db/data/transaction/commit';

// Define a function which fires the cypher query.
function runCypherQuery(query, params, callback) {
  request.post({
      uri: httpUrlForTransaction,
      json: {statements: [{statement: query, parameters: params}]}
    },
    function (err, res, body) {
      callback(err, body);
    });
}
