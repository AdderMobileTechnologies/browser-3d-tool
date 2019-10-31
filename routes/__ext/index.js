const express = require('express');
const router = express.Router();

router.use('/impressions', require('./impressions'));

module.exports = router;