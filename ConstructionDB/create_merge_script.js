// This script is intended to be run after the insert_script.js file
// has been run. That script grabs information from the construction
// database on sql2014, and inserts it into the construction.projects
// collection. That collection has a place for lat long, but no info
// is in it. This script grabs the latitude and longitude information
// from the property master, and creates an update script that can be
// used to populate the lat long values in the projects table.

var fs = require('fs');

const config = {
   host: '172.16.204.148',
   user: 'datauser',
   password: 'java12',
   "translate binary": "true"
}

var outFile = fs.openSync('merge_script.js', 'w');

const pool = require('node-jt400').pool(config);

pool.query('SELECT TRIM(MCMCU) AS Property,MCTOU / 1000000 AS Latitude,MCPCC / 1000000 AS Longitude FROM DATALIB7R.F0006')
   .then(function (result) {
      //console.log('result: ' + JSON.stringify(result));

      result.forEach(function (element) {
         console.log('   element:' + JSON.stringify(element));

         var output = 'db.generalProjects.updateMany( { PropertyNo: \'' +
            element.PROPERTY.substring(0, 4) + '\' }, { $set: { "location.coordinates": [' + element.LONGITUDE + ', ' + element.LATITUDE + '] } } );';

         console.log('update query: \'' + output + '\'');

         fs.write(outFile, output + '\n', function (err, written, str) {
            if (err) {
               console.error(err);
            }
         });
      });

      fs.close(outFile);
   })
   .fail(function (error) {
      console.log('error: ' + error);
   });