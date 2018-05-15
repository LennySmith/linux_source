const express = require('express');
const router = express.Router();

const mongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

// Note: This one takes a really long time...
router.get('/generalProjects', function (req, res) {
   console.log('/generalProjects');

   mongoClient.connect(url, function (err, client) {
      if (err) {
         console.error('error:' + err);

         return res.json({ error: err });
      } else {
         var db = client.db('construction');

         db.collection('generalProjects')
            .find({})
            .toArray(function (err, results) {
               if (err) {
                  console.error('error:' + err);

                  res.json({ error: err });
               } else {
                  //console.log('results: ' + JSON.stringify(results));

                  client.close();

                  res.json(results);
               }
            });
      }
   });
});

// Note: This one doesn't return every column in the generalProjects table, just the
// _id, location, PropertyNo, Region, RegionSite, Project, Property, ExactTTAddress, and ProjectType
router.get('/generalProjectsInBox/:bottomLeftLat/:bottomLeftLong/:upperRightLat/:upperRightLong', function (req, res) {
   console.log('/generalProjectsInBox:' + req.params.bottomLeftLat + ',' +
      req.params.bottomLeftLong + ',' + req.params.upperRightLat + ',' + req.params.upperRightLong);

   mongoClient.connect(url, function (err, client) {
      if (err) {
         return res.json({ error: err });
      } else {
         var db = client.db('construction');

         db.collection('generalProjects').find(
            {
               location: {
                  $geoWithin: {
                     $box: [
                        [ Number(req.params.bottomLeftLong), Number(req.params.bottomLeftLat) ],
                        [ Number(req.params.upperRightLong), Number(req.params.upperRightLat) ]
                     ]
                  }
               }
            })
            .project({ _id: 1, location: 1, PropertyNo: 1, Region: 1, RegionSite: 1, Project: 1, Property: 1, })
            .toArray(function (err, results) {
               if (err) {
                  res.json({ error: err });
               } else {
                  //console.log('results: ' + JSON.stringify(results));

                  client.close();

                  res.json(results);
               }
            });
      }
   });
});
//       // See the models/generalProject.js file
//    generalProject.find({
//       location: {
//          $geoWithin: {
//             $box: [
//                [req.params.bottomLeftLong, req.params.bottomLeftLat],
//                [req.params.upperRightLong, req.params.upperRightLat]
//             ]
//          }
//       }
//    },
//       {
//          _id: 1,
//          location: 1,
//          PropertyNo: 1,
//          Region: 1,
//          RegionSite: 1,
//          Project: 1,
//          Property: 1,
//          ExactTTAddress: 1,
//          ProjectType: 1
//       })
//       .exec(function (err, infos) {
//          if (err) {
//             console.error('Error getting the infos: ' + err);
//          } else {
//             res.json(infos);
//             //console.log('infos: ' + JSON.stringify(infos));
//          }
//       })
// });

module.exports = router;
