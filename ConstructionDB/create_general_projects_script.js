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

var outFile = fs.openSync('insert_general_projects_script.js', 'w');

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

   getGeneralProjects(conn, outFile);
});

conn.on('end', endGetProjects);

function getGeneralProjects(conn, outFile) {
   // Wanted to try and start some conventions, such as bit fields being named XXXFlag,
   // dates having Date as a suffix, to try and pull out into separate tables maybe.
   var query = 'SELECT ' +
      '[Property/Job#] AS _id,SUBSTRING([Property/Job#],1,4) AS PropertyNo,' +
      'Region,[Region:Site] AS RegionSite,Project,Property,' +
      '[Exact TT Address] AS ExactTTAddress,[Project Type] AS ProjectType,' +
      '[Property Manager] AS PropertyManager,' +
      '[SitePMuserID],[SiteSPRUserID],[RoofPM],[Leasing Agent] AS LeasingAgent,' +
      '[Updates],[UserID for Update] AS UserIDForUpdate,[Attorney],[Planning Lead] AS PlanningLead,' +
      '[Architect ID Code] AS ArchitectIDCode,' +
      '[Signage Type] AS SignageType,' +
      '[Bldg Permit Notes] AS BldgPermitNotes,[Bldg Permit (View)] AS BldgPermitView,' +
      '[Bldg Permit Check Amount] AS BldgPermitCheckAmount,[Township ID#] AS TownshipIDNo,' +
      '[Projected Turnover Date] AS ProjectedTurnoverDate,[Projected Applied Date] AS ProjectedAppliedDate,' +
      '[Projected Issue Date] AS ProjectedIssueDate,LW,[State],[Lease#] AS LeaseNo,' +
      '[Signed Lease Date] AS SignedLeaseDate,[Signed Lease Notes] AS SignedLeaseNotes,' +
      '[Satellite Office Locations] AS SatelliteOfficeLocations,[Permit #] AS PermitNo,[Square Footage] AS SquareFootage,' +
      '[# of Floors] AS NumFloors,[TTAddressBook#] AS TTAddressBookNo,[Use],[Builders Risk Comments] AS BuildersRiskComments,' +
      '[RTB Approval Date] AS RTBApprovalDate,BuildingDemo,' +
      '[BuildingDemoCompleted],ConstStartDate,PadReady,' +
      'OpeningDate,' +
      '[Demo Permit Applied Projected] AS DemoPermitAppliedProjected,' +
      '[Demo Permit Issue Projected] AS DemoPermitIssueProjected,' +
      '[Demo Permit #] AS DemoPermitNo,[Demo Permit VIEW] AS DemoPermitView,[Demo Permit Notes] AS DemoPermitNotes,' +
      '[Township ID] AS TownshipID,SiteCompletionDate,' +
      '[Roofing Permit Applied Projected] AS RoofingPermitAppliedProjected,' +
      '[Roofing Permit Issued Projected] AS RoofingPermitIssuedProjected,' +
      '[Roofing Permit Notes] AS RoofingPermitNotes,[Roofing Permit #] AS RoofingPermitNo,[Roofing Permit View] AS RoofingPermitView,' +
      '[Roof_Work_Status] AS RoofWorkStatus,[NOC_Text] AS NOCText,' +
      '[LW_Hyperlink] AS LWHyperlink,' +
      '[Existing_Conditions_Survey] AS ExistingConditionsSurvey,[Owner],' +
      '[FFE Date: Projected] AS FFEDateProjected,' +
      '[Civils % Complete] AS CivilsPercentComplete,' +
      '[DS Comments] AS DSComments,' +
      '[RTB Zoning Text] AS RTBZoningText,' +
      '[RTB DOT Text] AS RTBDOTText,' +
      '[RTB Signage Text] AS RTBSignageText,' +
      '[RTB Survey Boundary Text] AS RTBSurveyBoundaryText,' +
      '[RTB Survey Topo Text] AS RTBSurveyTopoText,' +
      '[Site/Bldg Meeting Notes] AS SiteBldgMeetingNotes,' +
      '[Sign Approval] AS SignApproval,[NOC TT Text] AS NOCTTText,' +
      '[Shell Special Project Comments] AS ShellSpecialProjectComments,' +
      '[Shell Special Project Civils] AS ShellSpecialProjectCivils,[Shell Special Project Civil Engineer] AS ShellSpecialProjectCivilEngineer,' +
      '[Con Assistant PM] AS ConAssistantPM,' +
      '[Shell Group Description] AS ShellGroupDescription,[Environmental Issues] AS EnvironmentalIssues,' +
      '[Utility Agencies Involved] AS UtilityAgenciesInvolved,' +
      '[Sidewalk Plan] AS SidewalkPlan,[Legal Easements] AS LegalEasements,[Legal Restrictions] AS LegalRestrictions,' +
      '[RTB Description] AS RTBDescription,' +
      '[Electrical Easement] AS ElectricalEasement,' +
      '[Gas Easement] AS GasEasement,[Phone Easement] AS PhoneEasement,Landscaping,Fencing,Lighting,' +
      'PunchList,AsBuilt AS AsBuiltText,' +
      '[Shell Special Project Year] AS ShellSpecialProjectYear' +
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

      output += 'db.generalProjects.insertOne( { ';

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
   console.log('Done getting projects...');
}
