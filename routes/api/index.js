const express = require('express');
const router = express.Router();

router.use('/client', require('./client'));
router.use('/driver', require('./driver'));
router.use('/campaign', require('./campaign'));
router.use('/route', require('./route'));
router.use('/impressions', require('./impressions'));
router.use('/analytics', require('./analytics'));
router.use('/geofence', require('./geofence'));
router.use('/billing', require('./billing'));
router.use('/v2', require('./v2'));

module.exports = router;
