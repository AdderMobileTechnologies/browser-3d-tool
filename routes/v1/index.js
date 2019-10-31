const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/design", require("./design"));
router.use("/meta", require("./meta"));

/*
////////////////////////////////////////////////
// index setup:
const express = require("express");
const router = express.Router();
//--- additional routes
    router.use('/xyz', require('./xyz'));
//----

module.exports = router;
///////////////////////////////////////////////////
*/

module.exports = router;
