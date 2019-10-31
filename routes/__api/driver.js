const router = require('express').Router();
const passport = require('passport');
const jwt = require('jwt-simple');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require("adder-models").User;
const Driver = require("adder-models").Driver;
const Campaign = require("adder-models").Campaign;

router.get ('/', function(req, res) {
    console.log("HIT SUCCESS");
    return res.status(200).send({success: true});
});
router.post('/register', passport.authenticate('jwt', {session: false}), function(req, res) {
  var newDriver = new Driver(req.body);
  newDriver.email = req.user.email;

  newDriver.save(function(err, driver) {
    if (err) {
      res.statusMessage = err.message;
      return res.status(500).json({success: false, msg: err.message});
    }

    User.findById(req.user._id, function(err, user) {
      if (err) {
        res.statusMessage = err.message;
        return res.status(500).json({success: false, msg: err.message});
      }

      user.driver_id = driver._id;
      user.device_id = req.body.device_id;
      user.is_registered = true;
      user.save(function(err, newUser) {
        if (err) {
          res.statusMessage = err.message;
          return res.status(500).json({success: false, msg: err.message});
        }

        if (newUser) {
          var token = jwt.encode(newUser, "key");
          
          res.status(200).json({success: true, msg: "Driver successfully created for email: " + driver.email, token: token});
        } else {
          return res.status(400).json({success: false, msg: "Could not save user."});
        }
      });
    });
  });
});

router.post('/mileage', passport.authenticate('jwt', {session: false}), function(req, res) {
    Driver.findById(req.user.driver_id, function(err, driver) {
      if (err) {
        res.statusMessage = err.message;
        return res.json({success: false, msg: err.message});
      }

      if (driver) {
        driver.current_miles = req.body;
        driver.save(function(err, newDriver) {
          if (err) {
            res.statusMessage = err.message;
            return res.json({success: false, msg: err.message});
          }

          res.json({success: true, msg: "Driver mileage info updated!"});
        });
      } else {
        res.json({success: false, msg: "Could not find driver."});
      }
    });
});

router.get('/mileage', passport.authenticate('jwt', {session: false}), function(req, res) {
    Driver.findById(req.user.driver_id, function(err, driver) {
      if (err) {
        res.statusMessage = err.message;
        return res.json({success: false, msg: err.message});
      }

      if (driver) {
        res.json({success: true, msg: "Found driver mileage.", current_miles: driver.current_miles});
      } else {
        res.json({success: false, msg: "Could not find driver."});
      }
    })
});

router.post('/reset-dates', passport.authenticate('jwt', {session: false}), function(req, res) {
  Driver.findById(req.user.driver_id, function(err, driver) {
    if (err) {
      res.statusMessage = err.message;
      return res.json({success: false, msg: err.message});
    }

    if (driver) {
      driver.mile_reset_dates = req.body;
      driver.save(function(err, newDriver) {
        if (err) {
          console.log(err);
          return res.json({success: false, msg: err.message});
        }

        res.json({success: true, msg: "Driver mileage info updated!"});
      });
    } else {
      res.json({success: false, msg: "Could not find driver."});
    }
  });
});

router.get('/info', passport.authenticate('jwt', {session: false}), function(req, res) {
    Driver.findOne({'device_id': req.user.device_id}, function(err, driver) {
        if (err) {
            res.statusMessage = err.message;
            return res.status(500).json({success: false, msg: err.message, err: "INTERNAL"});
        }

        if (!driver) {
	          console.log("DRIVER NOT FOUND");
            return res.status(401).json({success: false, msg: "No driver found for device id: " + req.query.device_id, err: "NOT_FOUND"});
        }

        res.status(200).json({success: true, msg: "Found driver", driver_info: driver});
    })
});

router.get('/campaign', passport.authenticate('jwt', {session: false}), function(req, res) {
  if (!req.user.driver_id) {
    return res.status(400).json({success: false, msg: "This user is not a driver.", err: "USER_NOT_DRIVER"});
  }


  Driver.findById(req.user.driver_id, function(err, driver) {
    if (err) {
        res.statusMessage = err.message;
        return res.status(400).json({success: false, msg: err.message, err: "MONGOOSE_ERROR"});
    }

    if (!driver.current_campaign) {
      return res.status(400).json({success: false, msg: "No current campaign for the driver.", err: "NO_CAMPAIGN_ASSIGNED"});
    }

    Campaign.findById(driver.current_campaign, function(err, campaign) {
      if (err) {
          res.statusMessage = err.message;
          return res.status(400).json({success: false, msg: err.message, err: "MONGOOSE_ERROR"});
      }

      res.status(200).json({success: true, msg: "Found the campaign.", campaign: campaign});
    })
  })
});

router.post('/campaign', passport.authenticate('jwt', {session: false}), function(req, res) {
  if (!req.body.driverId || !req.body.campaignId) {
    return res.status(400).json({success: false, msg: "Please send a campaignId and driverId with your request."});
  } 

  Driver.findById(req.body.driverId, function(err, driver) {
    if (err) {
      res.statusMessage = err.message;
      return res.status(400).json({success: false, msg: err.message});
    }

    driver.current_campaign = req.body.campaignId;
    driver.save(function(err, newDriver) {
      if (err) {
        res.statusMessage = err.message;
        return res.status(400).json({success: false, msg: err.message});
      }

      res.status(200).json({success: true, msg: "Assigned the campaign to the driver."});
    });
  });
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log(req.body);
        if (!fs.existsSync('./images')) {
            console.log("Creating images folder");
            fs.mkdirSync('./images');
        }

        var dir = "./images/" + req.user._id;
        if (!fs.existsSync(dir)) {
            console.log("Creating file: " + dir);
            fs.mkdirSync(dir)
        }

        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, req.body.type + ".png");
    }
});

var upload = multer({ 
    storage: storage,
    onError: function(err, next) {
        console.log(err);
        next(err);
    }
});

router.post('/image', passport.authenticate('jwt', {session: false}), upload.single('image'), function(req, res) {
    res.json({success: true, msg: "Image succesfully uploaded."});
});

router.get('/image', passport.authenticate('jwt', {session: false}), function(req, res) {
    console.log("---------------------------------");
    console.log("USER: ", req.user);
    console.log("IMAGE REQUEST: ", req.query.type);
    var query = req.query;

    if (!query.type) {
        console.log("NO TYPE");
        return res.json({success: false, msg: "Please make sure you are sending type in the query params."});
    }

    var dir = './images/' + req.user._id + "/" + query.type + ".png";
    // var rootDir = '/Users/bradleyhoffman/Desktop/Adder/web_api/images/' + query.device_id + "/" + query.type + ".png";
    var rootDir = path.join(__dirname, '../../images', String(req.user._id), query.type + ".png");
    console.log("ROOT_DIR", rootDir);
    if (!fs.existsSync(dir)) {
        console.log("dir", dir, "DOES NOT EXIST");
        res.json({
            success: false, msg: "Image of type (" + query.type + ") does not exist for device_id: " + req.user.device_id,
            path: dir
        });
    } else {
        //console.log(rootDir)
        res.sendFile(rootDir, {success: true, msg: "Found image for device_id: " + req.user.device_id}, function(err) {
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
