const express = require("express");
const router = express.Router();

const HTTPStatusCodes = require("node-common-utility").Constants
  .HTTPStatusCodes;
const User = require("adder-models").User;

router.post("/exists", async function(req, res, next) {
  const email = String(req.body.email);

  let user = null;

  if (typeof email === "undefined" || email === null) {
    res.status(HTTPStatusCodes.BAD_REQUEST).end();
    return next(new Error("Request was missing email in body."));
  }

  try {
    user = User.findOne({ email: email });
  } catch (err) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(err);
  }
  if (user === null) {
    res.status(HTTPStatusCodes.OK).end();
  } else {
    res.status(HTTPStatusCodes.NOT_FOUND).end();
  }
});

//--- additional routes
//router.use("/xyz", require("./xyz"));
//----

module.exports = router;

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
