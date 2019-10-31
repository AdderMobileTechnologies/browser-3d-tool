const express = require("express");
const router = express.Router();

router.use("/exists", require("./exists"));
router.use("/email-verification", require("./email-verification"));
router.use("/login", require("./login"));
router.use("/forgot-password", require("./forgot-password"));
router.use("/change-password", require("./change-password"));
router.use("/verify-token", require("./verify-token"));
router.use("/register", require("./register"));

module.exports = router;
