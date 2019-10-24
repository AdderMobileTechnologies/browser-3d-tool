const router = require('express').Router();
const path = require('path');
const passport = require('passport');
const jwt = require('jwt-simple');
const fork = require('child_process').fork;
const User = require("adder-models").User;
const Client = require('adder-models').Client;

const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;

router.post('/register', passport.authenticate('jwt', {session: false}), async function(req, res) {
    const logger = new ImmutableTagLogger("/api/client/register<" + req.user.email + ">");

    const newClient = new Client({
        email: req.user.email,
        primary_contact: req.body
    });

    try {
        await newClient.save();
        logger.debug("Successfully created new client account " + newClient._id);
    } catch(err) {
        logger.error("Failed to save new client. Error was: " + JSON.stringify(err, null, 4));
        res.statusMessage = err.message;
        return res.status(500).json({success: false, msg: err.message});
    }

    logger.debug("Attempting to retrieve User document for " + req.user._id);
    let user = null;
    try {
        user = await User.findById(req.user._id);
        logger.debug("Successfully retrieved User document for " + user._id);
    } catch(err) {
        //TODO: ROLLBACK LOGIC HERE
        logger.error("Failed to find User entry. Error was: " + JSON.stringify(err, null, 4));
        res.statusMessage = err.message;
        return res.status(500).json({success: false, err: "USER_NOT_FOUND"});
    }

    user.client_id = newClient._id;
    user.is_registered = true;

    try {
        await user.save();
    } catch(err) {
        logger.error("Failed to save updated user document (updated with client_id). Error was: " + JSON.stringify(err, null, 4));
        res.statusMessage = err.message;
        return res.status(500).json({success: false, err: err.message});
    }

    const token = jwt.encode(user, "key");

    const assignCampaignFork = fork(path.join(process.env.ROOT_DIR, "modules", "portal-api-scripts", "create-example-billboard-campaign-for-client"));
    assignCampaignFork.send('id: ' + newClient._id);
    assignCampaignFork.send('start');
    assignCampaignFork.on('message', (msg) => {
        if(msg === "SUCCESS") {
            logger.info("Billboard campaign successfully created for client " + newClient._id);
            res.status(200).json({success: true, token: token});
            assignCampaignFork.kill();
        } else if(msg === "FAILURE") {
            logger.error("Failed to assign eg billboard campaign to client " + newClient._id);
            res.status(200).json({success: true, token: token});
            assignCampaignFork.kill();
        } else {
            logger.info(msg);
        }
    })
});

module.exports = router;
