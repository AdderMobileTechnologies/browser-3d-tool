const path = require("path");
const fs = require("fs-extra");
const router = require('express').Router();
const passport = require('passport');
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const Campaign = require("adder-models").Campaign;
const { User } = require(path.join(process.env.ROOT_DIR, "modules", "adder-models"));

router.get('/', passport.authenticate('DriverStrategy', {session: false}), async function(req, res) {
    console.log("---------------------------------");
    console.log("USER: ", req.user);
  
    var account = await User.findOne({driver_id: req.user._id});
    console.log(account); 

    const destDir = path.join(process.env.ROOT_DIR, "images", String(account._id), "vehicle.png");
    console.log("ROOT_DIR", destDir);
    if (!fs.existsSync(destDir)) {
        console.log("dir", destDir, "DOES NOT EXIST");
        res.json({
            success: false, msg: "Image of type (vehicle) does not exist for email: " + req.user.email
        });
    } else {
        //console.log(rootDir)
        res.sendFile(destDir, {success: true, msg: "Found image for user: " + req.user.email}, function(err) {
            if (err) {
                res.statusMessage = err.message;
                res.json({success: false, msg: "Could not send file.", err: err});
            } else {
                console.log("Image sent!");
            }
        });
    }
});

module.exports = router;
