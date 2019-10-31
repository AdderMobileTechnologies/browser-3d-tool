const router = require('express').Router();

router.use('/auth', require("./auth"));
router.use('/webhook', require("./webhook"));
router.use('/analytics', require("./analytics"));
router.use('/driver', require("./driver"));
router.use('/asset', require("./asset"));
router.use('/client', require("./client"));
module.exports = router;