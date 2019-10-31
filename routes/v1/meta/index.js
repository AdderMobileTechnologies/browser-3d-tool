const express = require("express");
const router = express.Router();
//--- additional routes
router.use("/xyz", require("./xyz"));
//----

module.exports = router;
