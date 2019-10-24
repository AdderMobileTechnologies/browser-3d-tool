const router = require('express').Router();
const jwt = require('jwt-simple');

// const Geofence = require("adder-models").ClientGeofence;
const Geofence = require("adder-models").MAFTIGERGeofence;

router.post('/client', /*passport.authenticate('jwt', { session: false }, null),*/ (req, res) => {
    return res.status(200).send({success: true, msg: "Working"});
});

router.get("/", /*passport.authenticate('jwt', { session: false }, null),*/ function (req, res) {
    const keyword = req.query.keyword;

    if(!keyword) {
        return res.status(400).json({success: false, err: "Invalid Keyword"});
    }

    Geofence.find({'properties.NAMELSAD': {$regex: new RegExp(keyword), $options: 'i'}}, function(err, result) {
        if (err) {
            res.statusMessage = err.message;
            return res.status(500).json({err: err.message});
        }

	if(result.length !== 0) {
		var resultObj = [];
		result.forEach(r => {
			var display = "";
			var geoid = "";
			if(!r.properties.DISPLAY_NAME) {
				console.log("MISSING DISPLAY_NAME FOR OBJ: " + r._id);
				//return res.status(500).send({success:false, err: "Internal Server Error"});
			} else {
				id = r._id;
				display = r.properties.DISPLAY_NAME;
				var obj = {
					display: display,
					id: id
				};

				resultObj.push(obj);
			}
		});

		return res.status(200).send({success: true, result: resultObj});
	}
    });
});

router.get("/:id", function(req, res) {
	const geofenceId = req.params.id;
	

	Geofence.findOne({"_id": geofenceId}, function(err, result) {
		if(err) {
      res.statusMessage = err.message;
			return res.status(500).send({success: false, err: err});
		}		

		if(!result || result.length === 0) {
			return res.status(200).send({success: true, geo: []});
		}

		return res.status(200).send({success: true, geo: result});
	});
});

module.exports = router;
