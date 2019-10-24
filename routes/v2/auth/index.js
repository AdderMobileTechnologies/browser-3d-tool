const router = require('express').Router();

router.use('/register', require("./register"));
router.use('/login', require("./login"));
router.use('/forgot-password', require("./forgot-password"));

module.exports = router;
