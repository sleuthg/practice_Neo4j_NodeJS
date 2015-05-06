You can use several modules to interface with the Neo4j in Node.js, but node-neo4j (Thingdom) and node-neo4j (philipkueng) are the ones which are most widely used. They both work well and it’s generally a personal choice between these two. But in the following examples, we will be using the node-neo4j (philippkueng) module because it seems to have better documentation.

We can install the module using npm by issuing the following command:

> npm install node-neo4j
Now let’s see how we can use the node-neo4j module to fire some cypher queries as well as use their object interface. Running Cypher queries using the node-neo4j module Let’s now try to run the same query we ran above using the node-neo4j module. Our code will look like:

//Require the Neo4J module
var neo4j = require('node-neo4j');

//Create a db object. We will using this object to work on the DB.
db = new neo4j('http://localhost:7474');

//Run raw cypher with params
db.cypherQuery(
  'CREATE (somebody:Person { name: {name}, from: {company}, age: {age} }) RETURN somebody',
  {
    name: 'Ghuffran',
    company: 'Modulus',
    age: ~~(Math.random() * 100) //generate random age
  }, function (err, result) {
    if (err) {
      return console.log(err);
    }
    console.log(result.data); // delivers an array of query results
    console.log(result.columns); // delivers an array of names of objects getting returned
  }
);
In the preceding code we used the method db.cypherQuery(query, [params|Optional], [include_stats|Optional], callback) provided by the module to run our cypher query. Using helper methods in the node-neo4j module The node-neo4j module provides a list of helper methods to work with neo4j. Let’s see how we can save our node using the helper method:

//Require the Neo4J module
var neo4j = require('node-neo4j');

//Create a db object. We will using this object to work on the DB.
db = new neo4j('http://localhost:7474');

//Let’s create a node
db.insertNode({
  name: 'Ghuffran',
  company: 'Modulus',
  age: ~~(Math.random() * 100)
}, function (err, node) {
  if (err) {
    return console.log(err);
  }

  // Output node data.
  console.log(node);
});
In the preceding code we used the db.insertNode method to help us create the specified node. There are methods to update, read, delete etc that you can use to perform your basic interactions with the Neo4J database without dealing with the cypher query. You can read in detail about them in the API Documentation.
