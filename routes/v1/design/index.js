const express = require("express");
const router = express.Router();

router.use("/design", require("./design"));
router.use("/email", require("./email"));

module.exports = router;
