const express = require("express");
const router = express.Router();
const User = require("adder-models").User;
const jwt = require("jwt-simple");

const ImmutableTagLogger = require("node-common-utility").Logging
  .ImmutableTagLogger;
const Client = require("adder-models").Client;

const HTTPStatusCodes = require("node-common-utility").Constants
  .HTTPStatusCodes;

router.post("/client", async function(req, res, next) {
  console.log("routes/v1/auth/login .... req.body:", req.body);

  let user = null;
  //let client = null;
  let { email, password } = req.body;

  //region Validate Input
  //TODO: REGEX TEST FOR EMAIL AND PASSWORD!
  if (!email) {
    res.status(HTTPStatusCodes.BAD_REQUEST).end();
    return next(new Error(`Email was missing from request.`));
  }
  if (!password) {
    res.status(HTTPStatusCodes.BAD_REQUEST).end();
    return next(new Error(`Password was missing from request.`));
  }
  //endregion

  //region Find User
  try {
    user = await User.findOne({ email: email }); //TypeError: User.findOne is not a function.
  } catch (err) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(
      new Error(
        `An error occurred while retrieving user entry from database:\n${err.stack}`
      )
    );
  }
  if (!user) {
    res.status(HTTPStatusCodes.NOT_FOUND).end();
    return next();
  }
  //endregion

  //region Check if Users Password Is Correct
  try {
    let isMatch = await user.isCorrectClientPassword(password);
    if (!isMatch) {
      res.status(HTTPStatusCodes.FORBIDDEN).end();
      return next();
    }
  } catch (err) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(
      new Error(
        `An error occurred while comparing client password:\n${err.stack}`
      )
    );
  }
  //endregion

  //region Create Token and Return Driver Data
  let token = jwt.encode(
    {
      _id: user._id,
      time: new Date().getTime() / 1000
    },
    process.env.JWT_SIGNING_KEY
  );

  //region TODO: REFACTOR THIS TO ONLY RETURN TOKEN. DRIVER INFO SHOULD BE RETRIEVED IN SEPARATE ENDPOINT
  let returnObject = {
    token: token,
    clientid: user._id
  };
  //endregion
  res.status(HTTPStatusCodes.OK).json(returnObject);
  return next();
});

router.post("/login", function(req, res) {
  const logger = new ImmutableTagLogger(
    `POST /v1/auth/login<${req.body.email}`
  );
  logger.debug("Beginning login request");
  if (typeof req.body.email === "undefined" || !req.body.email) {
    logger.error("No email was provided!");
    return res.status(400).json({ err: "NO_EMAIL_PROVIDED" });
  }

  if (typeof req.body.role === "undefined" || !req.body.role) {
    logger.error("No role was provided!");
    return res.status(400).json({ err: "NO_ROLE_PROVIDED" });
  }

  if (req.body.role !== "client" && req.body.role !== "driver") {
    logger.error("Invalid role " + req.body.role + " was provided!");
    return res.status(400).json({ err: "INVALID_ROLE_PROVIDED" });
  }

  const email = String(req.body.email);
  const role = String(req.body.role);

  let hashedPass = null;
  if (typeof req.body.hashed_pass !== "undefined" && req.body.hashed_pass) {
    hashedPass = req.body.hashed_pass;
  }
  logger.debug("Required fields are present.");

  User.findOne({ email: email }, function(err, user) {
    if (err) {
      res.statusMessage = err.message;
      logger.error(
        "A " +
          err.constructor.name +
          " error occurred while retrieving User with email: " +
          email
      );
      logger.error(JSON.stringify(err, null, 4));
      return res.status(500).json({ err: "MONGOOSE_ERROR" });
    }

    if (!user) {
      return res.status(404).json({ err: "USER_NOT_FOUND" });
    }

    logger.debug("Found user with _id: " + user._id);

    user.comparePassword(
      user._id,
      req.body.password,
      role,
      hashedPass,
      async function(err, isMatch) {
        logger.debug("Compare password has completed.");
        if (err) {
          res.statusMessage = err.message;
          logger.error(
            `An error occurred while comparing passed password to stored password:\n${err.stack}`
          );
          return res.status(500).json({ err: "MONGOOSE_ERROR" });
        }

        if (isMatch) {
          logger.debug("Correct password was provided.");
          const token = jwt.encode(user, "key");
          if (role === "client") {
            if (typeof user.client_id === "undefined" || !user.client_id) {
              logger.error(
                "Passed role was client, but user has no client_id!"
              );
              return res.status(400).json({ msg: "USER_IS_NOT_CLIENT" });
            }

            if (!user.is_registered) {
              logger.error(
                "User for email " +
                  email +
                  " has a user account, but is not fully registered" +
                  " as a client!"
              );
              return res.status(200).json({
                msg: "FINISH_CLIENT_REGISTER",
                token: token,
                is_verified: user.is_verified
              });
            }

            await Client.findOne({ email: req.body.email }, function(
              err,
              client
            ) {
              if (err) {
                res.statusMessage = err.message;
                logger.error(
                  "A " +
                    err.constructor.namespace +
                    " error occurred while retrieving" +
                    " client account."
                );
                logger.error(JSON.stringify(err, null, 4));
                return res.status(500).json({ err: "MONGOOSE_ERROR" });
              }

              if (!client) {
                logger.error(
                  "Client retrieval completed successfully, but no client entry was found!"
                );
                return res.status(401).json({ err: "CLIENT_NOT_FOUND" });
              }

              logger.debug("Client " + client._id + " successfully retrieved.");
              let clientId = client._id;
              //TODO: AFTER REFACTOR, ADD IN PROFILING MIDDLEWARE TO LOG REQUEST STATUS
              return res.status(200).json({
                token: token,
                clientId: clientId,
                is_verified: user.is_verified
              });
            });
          } else if (role === "driver") {
            if (typeof user.driver_id === "undefined" || !user.driver_id) {
              logger.error(
                "Passed role was driver, but user has no driver_id!"
              );
              return res.status(400).json({ err: "USER_IS_NOT_DRIVER" });
            }

            if (user.is_registered) {
              logger.debug("Returning token for driver.");
              return res.status(200).json({ token: token });
            } else {
              logger.error(
                "User for email " +
                  email +
                  " has a user account, but is not fully registered" +
                  " as a driver!"
              );
              return res.status(200).json({
                msg: "FINISH_DRIVER_REGISTER",
                token: token,
                is_verified: user.is_verified
              });
            }
          }
        } else {
          logger.debug("Wrong password provided.");
          res
            .status(400)
            .json({ msg: "WRONG_PASSWORD", err: "WRONG_PASSWORD" });
        }
      }
    );
  });
});

module.exports = router;
