// NOTE: This one isn't started, it's still basically the same as the create_insert_script.js
// file. I want to find out how the two tables relate, if at all.
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

var outFile = fs.openSync('insert_construction_script.js', 'w');

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

   executeStatement();
});

conn.on('end', endGetProjects);

function executeStatement() {
   // Wanted to try and start some conventions, such as bit fields being named XXXFlag,
   // dates having Date as a suffix, to try and pull out into separate tables maybe.
   var query = 'SELECT ' +
      '[Property/Job#] AS _id,SUBSTRING([Property/Job#],1,4) AS PropertyNo,Region,[Region:Site] AS RegionSite,Project,Property,' +
      '[Exact TT Address] AS ExactTTAddress,DDR,[Project Type] AS ProjectType,[Property Manager] AS PropertyManager,' +
      '[Move to Prop Mgmt Punch List Report] AS MoveToPropMgmtPunchListReport,' +
      'CONVERT(varchar(50),[Prop Mgmt Punch List Approved],126) AS PropMgmtPunchListApproved,' +
      '[SitePMuserID],[SiteSPRUserID],[RoofPM],[Leasing Agent] AS LeasingAgent,' +
      'CONVERT(varchar(50),[Blackout Penalty Date],126) AS BlackoutPenaltyDate,' +
      '[Updates],[UserID for Update] AS UserIDForUpdate,[Attorney],[Planning Lead] AS PlanningLead,[Dead Project] AS DeadProject,' +
      '[Architect ID Code] AS ArchitectIDCode,[Hard Turnover Date] AS HardTurnoverDate,' +
      'CONVERT(varchar(50),[Signage Submitted for Approval],126) AS SignageSubmittedForApproval,' +
      '[Signage Approved] AS SignageApproved,[Signage Type] AS SignageType,' +
      'CONVERT(varchar(50),[Signage Date],126) AS SignageDate,[Signage Date Confirmed] AS SignageDateConfirmed,' +
      'CONVERT(varchar(50),[Turnover Date],126) AS TurnoverDate,' +
      'CONVERT(varchar(50),[Bldg Permit Applied Date],126) AS BldgPermitAppliedDate,' +
      'CONVERT(varchar(50),[Bldg Permit Issue Date],126) AS BldgPermitIssueDate,' +
      'CONVERT(varchar(50),[Bldg Permit Expires],126) AS BldgPermitExpires,[Bldg Permit Notes] AS BldgPermitNotes,[Bldg Permit (View)] AS BldgPermitView,' +
      'CONVERT(varchar(50),[Bldg Permit Check Date],126) AS BldgPermitCheckDate,[Bldg Permit Check Amount] AS BldgPermitCheckAmount,[Township ID#] AS TownshipIDNo,' +
      '[Storage Pros] AS StoragePros,[Projected Turnover Date] AS ProjectedTurnoverDate,[Projected Applied Date] AS ProjectedAppliedDate,' +
      '[Projected Issue Date] AS ProjectedIssueDate,[Cannot Build] AS CannotBuild,LW,[State],[Out of State Project] AS OutOfStateProject,[Lease#] AS LeaseNo,' +
      '[Signed Lease Date] AS SignedLeaseDate,[Signed Lease Notes] AS SignedLeaseNotes,[Satellite Office] AS SatelliteOffice,' +
      '[Satellite Office Locations] AS SatelliteOfficeLocations,[Permit #] AS PermitNo,[Square Footage] AS SquareFootage,' +
      '[# of Floors] AS NumFloors,[TTAddressBook#] AS TTAddressBookNo,[Use],[Builders Risk Comments] AS BuildersRiskComments,' +
      '[RTB Approval Date] AS RTBApprovalDate,[RTB Approval Date SHADE] AS RTBApprovalDateShade,BuildingDemo,BuildingDemoShade,' +
      '[BuildingDemoCompleted],BuildingDemoCompletedShade,ConstStartDate,ConstStartDateShade,PadReady,' +
      'PadReadyShade,OpeningDate,OpeningDateShade,CONVERT(varchar(50),[Demo Permit Applied Date],126) AS DemoPermitAppliedDate,' +
      '[Demo Permit Applied Projected] AS DemoPermitAppliedProjected,CONVERT(varchar(50),[Demo Permit Issue Date],126) AS DemoPermitIssueDate,' +
      '[Demo Permit Issue Projected] AS DemoPermitIssueProjected,CONVERT(varchar(50),[Demo Permit Expiration Date],126) AS DemoPermitExpirationDate,' +
      '[Demo Permit #] AS DemoPermitNo,[Demo Permit VIEW] AS DemoPermitView,[Demo Permit Notes] AS DemoPermitNotes,' +
      '[Township ID] AS TownshipID,SiteCompletionDate,SiteCompletionDateShade,CONVERT(varchar(50),[Roofing Permit Applied],126) AS RoofingPermitAppliedDate,' +
      '[Roofing Permit Applied Projected] AS RoofingPermitAppliedProjected,CONVERT(varchar(50),[Roofing Permit Issued],126) AS RoofingPermitIssuedDate,' +
      '[Roofing Permit Issued Projected] AS RoofingPermitIssuedProjected,CONVERT(varchar(50),[Roofing Permit Expires],126) AS RoofingPermitExpiresDate,' +
      '[Roofing Permit Notes] AS RoofingPermitNotes,[Roofing Permit #] AS RoofingPermitNo,[Roofing Permit View] AS RoofingPermitView,' +
      'Billable,[As_Built] AS AsBuilt,[Roof_Work_Status] AS RoofWorkStatus,[Facade_Plaza_Remodel] AS FacadePlazaRemodel,[NOC_Text] AS NOCText,' +
      'CONVERT(varchar(50),NOC_Date,126) AS NOCDate,[NOC_Date_Confirmed] AS NOCDateConfirmed,[LW_Hyperlink] AS LWHyperlink,' +
      'CONVERT(varchar(50),[LW_Issue_Date],126) AS LWIssueDate,[Existing_Conditions_Survey] AS ExistingConditionsSurvey,[Owner],' +
      'CONVERT(varchar(50),[FFE Date],126) AS FFEDate,[FFE Date: Projected] AS FFEDateProjected,[FFE Date: Confirmed] AS FFEDateConfirmed,' +
      '[Civils % Complete] AS CivilsPercentComplete,CONVERT(varchar(50),[DS Rec\'d],126) AS DSReceived,[DS Remove from Job List] AS DSRemoveFromJobList,' +
      'CONVERT(varchar(50),[DS Date Removed from Job List],126) AS DSDateRemovedFromJobList,[DS Comments] AS DSComments,' +
      'CONVERT(varchar(50),[RTB Zoning],126) AS RTBZoningDate,[RTB Zoning Text] AS RTBZoningText,' +
      'CONVERT(varchar(50),[RTB DOT],126) AS RTBDotDate,[RTB DOT Text] AS RTBDOTText,[RTB Variance] AS RTBVariance,' +
      'CONVERT(varchar(50),[RTB Signage],126) AS RTBSignageDate,[RTB Signage Text] AS RTBSignageText,' +
      'CONVERT(varchar(50),[RTB Survey Boundary],126) AS RTBSurveyBoundaryDate,[RTB Survey Boundary Text] AS RTBSurveyBoundaryText,' +
      'CONVERT(varchar(50),[RTB Survey Topo],126) AS RTBSurveyTopoDate,[RTB Survey Topo Text] AS RTBSurveyTopoText,' +
      'WaterSubMeter,Awning,[Site/Bldg Meeting] AS SiteBldgMeeting,[Site/Bldg Meeting Notes] AS SiteBldgMeetingNotes,' +
      '[Coming Soon Sign Needed] AS ComingSoonSignNeeded,CONVERT(varchar(50),[Coming Soon Sign Installed],126) AS ComingSoonSignInstalledDate,' +
      '[Coming Soon Sign Ordered] AS ComingSoonSignOrdered,[Sign Approval] AS SignApproval,[NOC TT Text] AS NOCTTText,' +
      'CONVERT(varchar(50),[NOC TT Date],126) AS NOCTTDate,[NOC TT Date Confirmed] AS NOCTTDateConfirmed,' +
      '[Shell Special Project] AS ShellSpecialProjectFlag,[Shell Special Project Comments] AS ShellSpecialProjectComments,' +
      'CONVERT(varchar(50),[Shell Special Project Completion Date],126) AS ShellSpecialProjectCompletionDate,' +
      'CONVERT(varchar(50),[Shell Special Project CDs],126) AS ShellSpecialProjectCDsDate,' +
      '[Shell Special Project CDs Complete] AS ShellSpecialProjectCDsCompleteFlag,' +
      '[Shell Special Project COMPLETE] AS ShellSpecialProjectCompleteFlag,' +
      '[Shell Special Project RTB Complete] AS ShellSpecialProjectRTBCompleteFlag,' +
      '[Shell Special Project Civils Complete] AS ShellSpecialProjectCivilsCompleteFlag,' +
      'CONVERT(varchar(50),[Shell Special Project Permit Issue Date],126) AS ShellSpecialProjectPermitIssueDate,' +
      '[Shell Special Project Permit Issue Date Complete] AS ShellSpecialProjectPermitIssueDateCompleteFlag,' +
      '[Shell Project Construction Complete] AS ShellProjectConstructionCompleteFlags,' +
      '[Shell Special Project Civils] AS ShellSpecialProjectCivils,[Shell Special Project Civil Engineer] AS ShellSpecialProjectCivilEngineer,' +
      '[Con Assistant PM] AS ConAssistantPM,[2014 Shell List] AS ShellList2014Flag,' +
      '[Shell Group Description] AS ShellGroupDescription,[Environmental Issues] AS EnvironmentalIssues,' +
      '[Utilities Relocation] AS UtilitiesRelocationFlag,[Utility Agencies Involved] AS UtilityAgenciesInvolved,' +
      '[Sidewalk Plan] AS SidewalkPlan,[Legal Easements] AS LegalEasements,[Legal Restrictions] AS LegalRestrictions,' +
      '[Pylon Signage] AS PylonSignageFlag,[Ground Sign] AS GroundSignFlag,[Building Signage] AS BuildingSignageFlag,' +
      '[RTB Description] AS RTBDescription,[Town Engineer Sign Off] AS TownEngineerSignOffFlag,' +
      '[Approved Elevation] AS ApprovedElevationFlag,[DOT Permit] AS DOTPermitFlag,[Electrical Easement] AS ElectricalEasement,' +
      '[Gas Easement] AS GasEasement,[Phone Easement] AS PhoneEasement,Landscaping,Fencing,Lighting,Submeter AS SubmeterFlag,' +
      'CONVERT(varchar(50),[Lease Execution],126) AS LeaseExecutionDate,[Coordinate Meeting] AS CoordinateMeetingFlag,' +
      '[Sidewalk Plan Check] AS SidewalkPlanCheckFlag,PunchList,AsBuilt AS AsBuiltText,PunchListShaded AS PunchListShadedFlag,' +
      'AsBuiltShaded AS AsBuiltShadedFlag,[Shell Special Project Year] AS ShellSpecialProjectYear' +
      ' FROM [T - Project Info: General]';

   var req = new Request(query, function (err, rowCount) {
      if (err) {
         console.error('Request error:' + err);
      } else {
         console.log("rowCount: " + rowCount);
         conn.close();
      }
   });

   req.on('done', function (rowCount, more) {
      console.log('done: rowCount: ' + rowCount);
   });

   req.on('row', function (columns) {
      var output = '';

      output += 'db.projects.insertOne( { ';

      output += 'location\:\{ coordinates:[0,0],type:"Point" \},';

      columns.forEach(function (column) {
         //console.log('column type is: ' + column.metadata.type.type);

         output += column.metadata.colName + ': ';

         //console.log(column.metadata.colName + ':' + column.metadata.type.type + ': ' + column.value);

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
      });

      //output = output.substring(0, output.length - 2);

      output += ' Property: "" } );' // This will be the placeholder for the 4-character property value

      output = output.replace(/(?:\r\n|\r|\n)/g, ' ');

      //console.log(output);

      fs.write(outFile, output + '\n', function (err, written, str) {
         if (err) {
            console.error(err);
         }
      });
   });

   conn.execSql(req);
}

function endGetProjects() {
   fs.close(outFile);

   console.log('I\'m done...');

   process.exit(0);
}
