// Find all properties that are within 5,000 meters of Buffalo

db.generalProjects.find(
   {
      location:
      {
         $near:
         {
            $geometry: { type: "Point", coordinates: [ -78.9344822, 42.8962176]},
            $minDistance: 0,
            $maxDistance: 5000
         }
      }
   }
).forEach(printjson)