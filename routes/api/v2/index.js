const express = require('express');
const router = express.Router();

router.use('/reports', require('./reports'));

module.exports = router;
