const express = require("express");
const router = express.Router();
const FRONTEND_HOST = process.env.FRONTEND_HOST;
const HTTPStatusCodes = require("node-common-utility").Constants
  .HTTPStatusCodes;
const User = require("adder-models").User;

router.get("/change-password/:URL", function(req, res) {
  //TODO: CHECK THIS URL ..../#/authentication/verify-recovered-password?URL=" +
  res.redirect(
    FRONTEND_HOST +
      "/#/authentication/verify-recovered-password?URL=" +
      req.params.URL
  );
});

router.post("/change-password/:token", async function(req, res, next) {
  const { token } = req.params;
  const { password } = req.body;

  let user = null;

  if (!token) {
    res.status(HTTPStatusCodes.BAD_REQUEST).end();
    return next(new Error(`Request URL was missing 'token'`));
  }

  if (!password) {
    res
      .status(HTTPStatusCodes.BAD_REQUEST)
      .json({ msg: "Please send attributes: 'password'" });
    return next(new Error(`Request body was missing 'password'`));
  }

  try {
    user = await User.findOne({ password_token: token });
  } catch (err) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(new Error(`Failed to retrieve User document:\n${err.stack}`));
  }

  if (!user) {
    res.status(HTTPStatusCodes.NOT_FOUND).end();
    return next(
      new Error(`User with password_token ${token} could not be found.`)
    );
  }

  user.password_token = undefined;
  user.hash = password;

  try {
    user = await user.save();
  } catch (err) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(
      new Error(
        `An error occurred while attempting to save updated User document to DB:\n${err.stack}`
      )
    );
  }

  res.status(HTTPStatusCodes.OK).end();
  return next();
});
//--- additional routes
//router.use("/xyz", require("./xyz"));
//----

module.exports = router;
