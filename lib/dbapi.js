// This is the application program interface (API) for the underlying database.

// @TODO figure out why I need to put these variables here... I thought they were already in the global space
var request = require('request'); // the request module is a Node.JS module to make REST calls
var host = 'localhost';
var port = 7474; // <-- default Neo4j port
var httpUrlForTransaction = 'http://' + host + ':' + port + '/db/data/transaction/commit';

exports.loadFile = function loadFile (fs, datafile, callback) {
  fs.readFile(datafile,'UTF-8', function(err,data) {  // data is a string
    if (err) { return console.log(err);}
    var testData = JSON.parse(data);
    if (callback) { callback(null, testData); } // processes the testData; has to be INSIDE the readFile callback
  });
};

exports.printData = function printData (err, testData) {

  function printGraph (graph){
    console.log('  ID: ' + graph.threadID);
    console.log('  Title: ' + graph.title);
    console.log('  Description: ' + graph.description);
    console.log('  Author ID: ' + graph.author.userid);
    var nodeIDstrings = '';
    graph.nodes.forEach(function(node) {
      nodeIDstrings = nodeIDstrings + ' ' + node.nodeID;
    });
    console.log('  node IDs:' + nodeIDstrings);
    var relIDstrings = '';
    graph.relationships.forEach(function(rel) {
      relIDstrings = relIDstrings + ' ' + rel.relationshipID;
    });
    console.log('  relationship IDs:' + relIDstrings);
  }

  function printGraphs(graphs) {

    console.log('Graphs:');
    graphs.forEach(function(graph){
      printGraph(graph);
      console.log('');
    });

  }

  function printUser(user) {
    console.log('  ID: ' + user.userid);
    console.log('  Name: ' + user.firstName + ' ' + user.lastName);
    console.log('  userName: '+ user.userName);

    // Thread Ratings
    var threadStrings = '';
    user.threads.forEach(function(thread) {
      threadStrings += ' ' + thread.threadID + '(' + thread.rating + ')';
    });
    console.log('  thread ratings:' + threadStrings);

    // Node Ratings and Taggings
    var nodeStrings = '';
    user.nodes.forEach(function(node) {
      nodeStrings += ' ' + node.nodeID + '(' + node.rating + ')';
      // ... need to add on tags
    });
    console.log('  node ratings and taggings:' + nodeStrings);

    // Relationship Ratings
    var relStrings = '';
    user.relationships.forEach(function(rel) {
      relStrings += ' ' + rel.relationshipID + '(' + rel.rating + ')';
    });
    console.log('  relationship ratings:' + relStrings);
  }

  function printUsers (users) {
    console.log('Users:');
    users.forEach(function(user){
      printUser(user);
      console.log('');
    });
  }

  function printNode (node) {
    console.log('  ID: ' + node.nodeID);
    console.log('  link: ' + node.link);
    console.log('  name: ' + node.name);
    console.log('  type: ' + node.type);
    console.log('  rating: ' + node.rating.weightedRating + ' (' + node.rating.numberOfRatings + ' user ratings)');

    // Tags
    var tagsString = '';
    node.tags.forEach(function(tag) {
      tagsString += ' ' + tag.tag + '(' + tag.rank + ')';
    });
    console.log('  tags:' + tagsString);

    // Auto Tags (from pre-processing of link)
    tagsString = '';
    node.autoTags.forEach(function(tag) {
      tagsString += ' ' + tag.autoTag;
    });
    console.log('  autoTags:' + tagsString);
  }

  function printNodes(nodes) {
    console.log('Nodes:');
    nodes.forEach(function(node) {
      printNode(node);
      console.log('');
    });
  }

  function printRelationship(rel) {
    console.log('  ID: ' + rel.relationshipID);
    console.log('  from: ' + rel.fromNodeID);
    console.log('  to: ' + rel.toNodeID);
    console.log('  type: ' + rel.type);
    console.log('  rating: ' + rel.rating.weightedRating + ' (' + rel.rating.numberOfRatings + ' user ratings)');
  }

  function printRelationships(rels) {
    console.log('Relationships:');
    rels.forEach(function(rel){
      printRelationship(rel);
      console.log('');
    });
  }

  // Test data should have nodes, relationships, graphs and users
  // @TODO test for existence of main properties

  console.log('');

  printNodes(testData.nodes);
  printRelationships(testData.relationships);
  printGraphs(testData.graphs);
  printUsers(testData.users);

};

exports.addDataToDB = function addDataToDB(err, testData) {

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

  function addNodes(nodes) {
    console.log('Adding nodes from test data to database...');
    nodes.forEach(function(node) {
      addNode(node);
    });
  }

  function addNode(node) {
    console.log('  ' + node.nodeID);

    runCypherQuery(
      'CREATE (n:Node { link: {link}, name: {name}, type: {type}, rating: {rating}, nRatings: {nRatings} }) RETURN n', {
        name: node.name,
        link: node.link,
        type: node.type,
        rating: node.rating.weightedRating,
        nRatings: node.rating.numberOfRatings
      }, function (err,resp) {
        if (err) {
          console.log(err);
        } else {
          // console.log(resp);
        }
      }
    );
  }

  function addRelationships(rels) {
    console.log('Adding relationships from test data to database...');
    rels.forEach(function(rel) {
      addRelationship(rel);
    });
  }

  function addRelationship(rel) {
    console.log('  ' + rel.relationshipID);
    runCypherQuery(
      'CREATE (r:Relationship { type: {type}, rating: {rating}, nRatings: {nRatings} }) RETURN r', {
        type: rel.type,
        rating: rel.rating.weightedRating,
        nRatings: rel.rating.numberOfRatings
      }, function (err,resp) {
        if (err) {
          console.log(err);
        } else {
          // @TODO create the graph relationships based on fromNodeID and toNodeID properties
        }
      }
    );
  }

  addNodes(testData.nodes);
  addRelationships(testData.relationships);

};

exports.clearDB = function clearDB(runCQ) {

  console.log('Clearing the stitches and yarn...');
  runCQ('MATCH (n:Node),(r:Relationship) DELETE n,r',{}, function cb(){});

};




// How to use async.each
//
// // Include the async package
// // Make sure you add "async" to your package.json
// async = require("async");
//
// // 1st para in async.each() is the array of items
// async.each(items,
//   // 2nd param is the function that each item is passed to
//   function(item, callback){
//     // Call an asynchronous function, often a save() to DB
//     item.someAsyncCall(function (){
//       // Async call is done, alert via callback
//       callback();
//     });
//   },
//   // 3rd param is the function to call when everything's done
//   function(err){
//     // All tasks are done now
//     doSomethingOnceAllAreDone();
//   }
// );

// How to use async.parallel
//
// // Include the async package
// // Make sure you add "async" to your package.json
// async = require("async");
//
// // Array to hold async tasks
// var asyncTasks = [];
//
// // Loop through some items
// items.forEach(function(item){
//   // We don't actually execute the async action here
//   // We add a function containing it to an array of "tasks"
//   asyncTasks.push(function(callback){
//     // Call an async function, often a save() to DB
//     item.someAsyncCall(function(){
//       // Async call is done, alert via callback
//       callback();
//     });
//   });
// });
//
// // At this point, nothing has been executed.
// // We just pushed all the async tasks into an array.
//
// // To move beyond the iteration example, let's add
// // another (different) async task for proof of concept
// asyncTasks.push(function(callback){
//   // Set a timeout for 3 seconds
//   setTimeout(function(){
//     // It's been 3 seconds, alert via callback
//     callback();
//   }, 3000);
// });
//
// // Now we have an array of functions doing async tasks
// // Execute all async tasks in the asyncTasks array
// async.parallel(asyncTasks, function(){
//   // All tasks are done now
//   doSomethingOnceAllAreDone();
// });
