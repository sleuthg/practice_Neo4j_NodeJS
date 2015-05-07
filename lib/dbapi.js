// This is the application program interface (API) for the underlying database.

exports.loadFile = function(fs, datafile) {
  var testData;
  fs.readFile(datafile,'UTF-8', function(err,data) {  // data is a string
    if (err) {
      return console.log(err);
    }
    // console.log(data);
    testData = JSON.parse(data);
    console.log(testData);
  });
	return testData;
};

exports.printData = function(testData) {
  //console.log(testData);
};
