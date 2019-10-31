const router = require('express').Router();
const Geofence = require("adder-models").MAFTIGERGeofence;

router.post('/meta/maximp', function(req, res) {

    const coords = req.body[0];

    // Find all geofences intersecting with input that are block groups and have population data attached
    Geofence.find({geometry: {$geoIntersects: {$geometry: {type: "Polygon", coordinates: coords}}}, "properties.BLKGRPCE": {$exists: true}, "properties.population": {$exists: true}}, function(err, docs) {
        if(err) {
            return res.status(500).send({success: false, err: err});
        }

        var totalPop = 0;
        docs.forEach((doc) => {
            totalPop += Number(doc.properties.population.population);
        });

        return res.status(200).send({success: true, count: totalPop});
    });
});

module.exports = router;