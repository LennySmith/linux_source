var fs = require('fs');

var Connection = require('tedious').Connection;

var Request = require('tedious').Request;

var config = {
   userName: 'sa',
   password: 'bdci911',
   server: 'sql2014.benderson.com',
   options: {
      database: 'ProjectInformationSQL2',
      connectTimeout: 60000
   }
}

var outFile = fs.openSync('insert_general_project_dates_script.js', 'w');

var conn = new Connection(config);

conn.on('connect', function (err) {
   if (err) {
      console.error('There was an error:' + err);
      process.exit(1);
   }

   getProjectDates(conn, outFile);
});

conn.on('end', endGetProjectDates);

function getProjectDates(conn, outFile) {
   var query =
      'SELECT [Property/Job#] AS generalProjects_id,' +
      'CONVERT(varchar(50),[Blackout Penalty Date],126) AS BlackoutPenalty,' +
      'CONVERT(varchar(50),[Bldg Permit Applied Date],126) AS BldgPermitApplied,' +
      'CONVERT(varchar(50),[Bldg Permit Check Date],126) AS BldgPermitCheckDate,' +
      'CONVERT(varchar(50),[Bldg Permit Issue Date],126) AS BldgPermitIssued,' +
      'CONVERT(varchar(50),[Bldg Permit Expires],126) AS BldgPermitExpires,' +
      'CONVERT(varchar(50),[Coming Soon Sign Installed],126) AS ComingSoonSignInstalled,' +
      'CONVERT(varchar(50),[Demo Permit Applied Date],126) AS DemoPermitAppliedDate,' +
      'CONVERT(varchar(50),[Demo Permit Issue Date],126) AS DemoPermitIssueDate,' +
      'CONVERT(varchar(50),[Demo Permit Expiration Date],126) AS DemoPermitExpirationDate,' +
      'CONVERT(varchar(50),[DS Date Removed from Job List],126) AS DSDateRemovedFromJobList,' +
      'CONVERT(varchar(50),[DS Rec\'d],126) AS DSReceived,' +
      'CONVERT(varchar(50),[FFE Date],126) AS FFE,' +
      'CONVERT(varchar(50),[Lease Execution],126) AS LeaseExecutionDate,' +
      'CONVERT(varchar(50),[LW_Issue_Date],126) AS LWIssue,' +
      'CONVERT(varchar(50),NOC_Date,126) AS NOC,' +
      'CONVERT(varchar(50),[NOC TT Date],126) AS NOCTT,' +
      'CONVERT(varchar(50),[Prop Mgmt Punch List Approved],126) AS PropMgmtPunchListApproved,' +
      'CONVERT(varchar(50),[Roofing Permit Applied],126) AS RoofingPermitApplied,' +
      'CONVERT(varchar(50),[Roofing Permit Issued],126) AS RoofingPermitIssued,' +
      'CONVERT(varchar(50),[Roofing Permit Expires],126) AS RoofingPermitExpires,' +
      'CONVERT(varchar(50),[RTB DOT],126) AS RTBDotDate,' +
      'CONVERT(varchar(50),[RTB Signage],126) AS RTBSignageDate,' +
      'CONVERT(varchar(50),[RTB Survey Boundary],126) AS RTBSurveyBoundary,' +
      'CONVERT(varchar(50),[RTB Survey Topo],126) AS RTBSurveyTopo,' +
      'CONVERT(varchar(50),[RTB Zoning],126) AS RTBZoningDate,' +
      'CONVERT(varchar(50),[Shell Special Project Completion Date],126) AS ShellSpecialProjectCompletion,' +
      'CONVERT(varchar(50),[Shell Special Project CDs],126) AS ShellSpecialProjectCDs,' +
      'CONVERT(varchar(50),[Shell Special Project Permit Issue Date],126) AS ShellSpecialProjectPermitIssue,' +
      'CONVERT(varchar(50),[Signage Date],126) AS Signage,' +
      'CONVERT(varchar(50),[Signage Submitted for Approval],126) AS SignageSubmittedForApproval,' +
      'CONVERT(varchar(50),[Turnover Date],126) AS Turnover' +
      ' FROM [T - Project Info: General]';

   var req = new Request(query, function (err, rowCount) {
      if (err) {
         console.error('Request error:' + err);
      } else {
         console.log("rowCount: " + rowCount);
         conn.close();
         fs.close(outFile);
      }
   });

   req.on('done', function (rowCount, more) {
      console.log('dates done: rowCount: ' + rowCount);
   });

   req.on('row', function (columns) {
      var output = '';

      output += 'db.generalProjectDates.insertOne( { ';

      columns.forEach(function (column) {
         output = addToOutput(output, column);
      });

      output += ' } );'

      output = output.replace(/(?:\r\n|\r|\n)/g, ' ');

      fs.write(outFile, output + '\n', function (err, written, str) {
         if (err) {
            console.error(err);
         }
      });
   });

   conn.execSql(req);
}

function addToOutput(output, column) {
   output += column.metadata.colName + ': ';

   switch (column.metadata.type.type) {
      case 'BIGVARCHR':
      case 'NCHAR':
      case 'NTEXT':
      case 'NVARCHAR':
         output += (column.value !== null) ? '\'' + column.value.replace(/'/g, '').replace(/\\/g, '\\\\').replace(/:\s*/g, '\:') + '\'' : 'null';
         break;

      default:
         output += (column.value !== null) ? column.value : 'null';
         break;
   }

   output += ', ';

   //console.log(output);
   return output;
}

function endGetProjectDates() {
   console.log('Done getting project dates...');
}
