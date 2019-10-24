const express = require('express');
const router = express.Router();

//TEST COMMENT

router.use('/api', require('./api'));
router.use('/ext', require('./ext'));
router.use('/auth', require('./auth/auth'));
router.use('/v2', require('./v2'));
module.exports = router;
