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

var outFile = fs.openSync('insert_general_project_flags_script.js', 'w');

var conn = new Connection(config);

conn.on('connect', function (err) {
   if (err) {
      console.error('There was an error:' + err);
      process.exit(1);
   }

   process.stdin.on('end', function () {
      console.log("The connection function is done");
      process.exit(0);
   });

   getGeneralProjectFlags(conn, outFile);
});

conn.on('end', endGetProjects);

function getGeneralProjectFlags(conn, outFile) {
   // Wanted to try and start some conventions, such as bit fields being named XXXFlag,
   // dates having Date as a suffix, to try and pull out into separate tables maybe.
   var query = 'SELECT ' +
      '[Property/Job#] AS generalProjects_id,SUBSTRING([Property/Job#],1,4) AS PropertyNo,' +
      'DDR,[Move to Prop Mgmt Punch List Report] AS MoveToPropMgmtPunchListReport,' +
      '[Dead Project] AS DeadProject,[Hard Turnover Date] AS HardTurnoverDate,' +
      '[Signage Approved] AS SignageApproved,' +
      '[Signage Date Confirmed] AS SignageDateConfirmed,' +
      '[Storage Pros] AS StoragePros,' +
      '[Cannot Build] AS CannotBuild,[Out of State Project] AS OutOfStateProject,' +
      '[Satellite Office] AS SatelliteOffice,' +
      '[RTB Approval Date SHADE] AS RTBApprovalDateShade,' +
      'BuildingDemoShade,' +
      'BuildingDemoCompletedShade,' +
      'ConstStartDateShade,' +
      'PadReadyShade,' +
      'OpeningDateShade,' +
      'SiteCompletionDateShade,' +
      'Billable,' +
      '[As_Built] AS AsBuilt,' +
      '[Facade_Plaza_Remodel] AS FacadePlazaRemodel,' +
      '[NOC_Date_Confirmed] AS NOCDateConfirmed,' +
      '[FFE Date: Confirmed] AS FFEDateConfirmed,' +
      '[DS Remove from Job List] AS DSRemoveFromJobList,' +
      '[RTB Variance] AS RTBVariance,' +
      'WaterSubMeter,' +
      'Awning,' +
      '[Site/Bldg Meeting] AS SiteBldgMeeting,' +
      '[Coming Soon Sign Needed] AS ComingSoonSignNeeded,' +
      '[Coming Soon Sign Ordered] AS ComingSoonSignOrdered,' +
      '[NOC TT Date Confirmed] AS NOCTTDateConfirmed,' +
      '[Shell Special Project] AS ShellSpecialProject,' +
      '[Shell Special Project CDs Complete] AS ShellSpecialProjectCDsComplete,' +
      '[Shell Special Project COMPLETE] AS ShellSpecialProjectComplete,' +
      '[Shell Special Project RTB Complete] AS ShellSpecialProjectRTBComplete,' +
      '[Shell Special Project Civils Complete] AS ShellSpecialProjectCivilsComplete,' +
      '[Shell Special Project Permit Issue Date Complete] AS ShellSpecialProjectPermitIssueDateCompleteFlag,' +
      '[Shell Project Construction Complete] AS ShellProjectConstructionCompleteFlags,' +
      '[2014 Shell List] AS ShellList2014,' +
      '[Utilities Relocation] AS UtilitiesRelocation,' +
      '[Pylon Signage] AS PylonSignage,' +
      '[Ground Sign] AS GroundSign,' +
      '[Building Signage] AS BuildingSignage,' +
      '[Town Engineer Sign Off] AS TownEngineerSignOff,' +
      '[Approved Elevation] AS ApprovedElevation,' +
      '[DOT Permit] AS DOTPermit,' +
      'Submeter AS Submeter,' +
      '[Coordinate Meeting] AS CoordinateMeeting,' +
      '[Sidewalk Plan Check] AS SidewalkPlanCheck,' +
      'PunchListShaded AS PunchListShaded,' +
      'AsBuiltShaded AS AsBuiltShaded' +
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
      console.log('done: rowCount: ' + rowCount);
   });

   req.on('row', function (columns) {
      var output = '';

      output += 'db.generalProjectFlags.insertOne( { ';

      output += 'location\:\{ coordinates:[0,0],type:"Point" \},';

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

function endGetProjects() {
   console.log('Done getting project flags...');
}
