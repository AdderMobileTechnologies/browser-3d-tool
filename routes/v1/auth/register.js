const express = require("express");
const router = express.Router();

const User = require("adder-models").User;
const TempUser = require("adder-models").TempUser;
const rand = require("rand-token");
const jwt = require("jwt-simple");
var nodemailer = require("nodemailer");
const { META_URL } = require("../../../config");
const nodemailerOptions = {
  host: process.env.NODEMAILER_SMTP_HOST,
  port: Number(process.env.NODEMAILER_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
};

//const META_URL = process.env.META_URL;
const ImmutableTagLogger = require("node-common-utility").Logging
  .ImmutableTagLogger;

let transporter = nodemailer.createTransport(nodemailerOptions);

router.get("/", function(req, res) {
  console.log("req.body:", req.body);
  console.log("req.query:", req.query);
  res.send("test get");
});
router.post("/", async function(req, res, next) {
  console.log("API: DATA 1 req.body:", req.body);
  console.log("req:", req);

  const logger = new ImmutableTagLogger(
    "POST /v1/auth/register<" + req.body.email + ">"
  );
  //console.log("meta_server:/auth/register/:email:", req.body.email);
  let userLookupResult = null;

  // First we want to check and see if the user is already registered as something else.
  // If the user is registered as something else, we want to update the temp user verification and
  // update the existing user doc, rather than attempt to create new ones.

  logger.debug("Checking to see if user already exists in database.");

  try {
    //console.log("API: TRY 1");
    try {
      //console.log("API: TRY 1.1");
      userLookupResult = await User.findOne({ email: req.body.email });
    } catch (err) {
      console.log("try catch err for User.findOne: err:", err);
      //console.log("API: Catch 1.1");
    }
  } catch (err) {
    //console.log("API: Catch 1");
    logger.error(
      "A(n) " +
        err.constructor.name +
        " error occurred while attempting user lookup. No rollback is" +
        " needed. Returning."
    );
    logger.error(JSON.stringify(err, null, 4));
    res.statusMessage = err.message;
    return res.status(500).json({ err: err });
  }
  if (userLookupResult) {
    //console.log("API: DATA 2 userLookupResult:", userLookupResult);
    logger.debug("Found existing user.");
    // A user was found. Update the docs here.
    //console.log("API: DATA 3 req.body.role:", req.body.role);
    if (
      req.body.role === "client" &&
      typeof userLookupResult.client_id !== "undefined" &&
      userLookupResult.client_id
    ) {
      logger.debug(
        "Attempting to create client account for email, but client account already exists!"
      );
      return res
        .status(400)
        .json({ success: false, msg: "ALREADY_REGISTERED" });
    }
    if (
      req.body.role === "driver" &&
      typeof userLookupResult.driver_id !== "undefined" &&
      userLookupResult.driver_id
    ) {
      logger.debug(
        "Attempting to create driver account for email, but driver account already exists!"
      );
      return res
        .status(400)
        .json({ success: false, msg: "ALREADY_REGISTERED" });
    }

    const token = jwt.encode(userLookupResult, "key");

    if (
      req.body.role === "driver" &&
      (typeof userLookupResult.driver_id === "undefined" ||
        !userLookupResult.driver_id)
    ) {
      logger.debug("Attempting to register as driver.");
      logger.debug("Assigning driver hash to user.");
      userLookupResult.driver_hash = req.body.password;
      try {
        await userLookupResult.save();
        logger.debug("Successfully saved driver hash to user. Returning.");
        return res.status(200).json({
          success: true,
          msg: "CONTINUE_REGISTER",
          token: token,
          clientId: userLookupResult._id,
          isVerified: userLookupResult.is_verified
        });
      } catch (err) {
        logger.error(
          "A(n) " +
            err.constructor.name +
            " occurred while attempting to update User document" +
            " with driver hash. No rollback is needed."
        );
        res.statusMessage = err.message;
        return res.status(500).json({ err: err });
      }
    }

    if (
      req.body.role === "client" &&
      (typeof userLookupResult.client_id === "undefined" ||
        !userLookupResult.client_id)
    ) {
      //console.log("API : DATA 4: role of client condition.");
      logger.debug("Attempting to register as client.");
      logger.debug("Assigning hash to user.");
      userLookupResult.hash = req.body.password;
      try {
        //console.log("API:  Try: await userLookupResult");
        await userLookupResult.save();
        logger.debug("Successfully saved hash to user. Returning.");
        return res.json({
          success: true,
          msg: "CONTINUE_REGISTER",
          token: token,
          clientId: userLookupResult._id,
          isVerified: userLookupResult.is_verified
        });
      } catch (err) {
        //console.log("API:  Catch: await err", err);
        logger.error(
          "A(n) " +
            err.constructor.name +
            " occurred while attempting to update User document" +
            " with hash. No rollback is needed."
        );
        res.statusMessage = err.message;
        return res.status(500).json({ err: err });
      }
    }
  }
  let vtoken = rand.generate(16);

  const tempUser = new TempUser({
    email: req.body.email,
    verification_token: vtoken,
    role: req.body.role,
    created_at: Date.now()
  });
  logger.debug("Created TempUser document.");

  let newUser = null;
  if (req.body.role === "client") {
    console.log(" req.body.role == 'client' newUser:"); //YES
    newUser = new User({
      email: req.body.email,
      hash: req.body.password,
      role: req.body.role,
      is_verified: false,
      is_registered: false,
      created_at: Date.now()
    });
    console.log("API DATA: newUser:", newUser); //YES
  } else if (req.body.role === "driver") {
    newUser = new User({
      email: req.body.email,
      driver_hash: req.body.password,
      role: req.body.role,
      is_verified: false,
      is_registered: false,
      created_at: Date.now()
    });
  }
  logger.debug("Created User document");
  //console.log("API: tempUser.save(err, tempUser)");
  tempUser.save(function(err, tempUser) {
    //console.log("API: tempUser.save(err, tempUser)");
    console.log("err:", err);
    console.log("tempUser:", tempUser);
    if (err) {
      logger.error(
        "A(n) " +
          err.constructor.name +
          " occurred while attempting to save new TempUser document." +
          " No rollback is needed."
      );
      logger.error(JSON.stringify(err, null, 4));
      res.statusMessage = err.message;
      return res.status(500).json({ success: false, msg: err.message });
    }

    logger.debug("Successfully saved TempUser document " + tempUser._id);

    newUser.save(function(err, user) {
      console.log("meta_server.js :: newUser.save(function(err, user)){}");
      console.log("user:", user); //undefined
      if (err) {
        //TODO: ROLLBACK LOGIC
        console.error(err);
        logger.error(
          "A(n) (meta_server.js)" +
            err.constructor.name +
            " occurred while attempting to save new User document." +
            " Rollback is needed."
        );
        res.statusMessage = err.message;
        return res.status(500).json({ success: false, msg: err.message });
      }

      logger.debug("Successfully saved User document " + user._id);

      logger.debug("1 Attempting to send verification email.");

      let url = META_URL + "/auth/email-verification/" + vtoken;

      let mailOptions = {
        from: "Do Not Reply <no-reply@addermobile.com>",
        to: req.body.email,
        subject: "Please confirm account",
        html:
          "Click the following link to confirm your account: </p><p>" +
          url +
          "</p>",
        text:
          "Please confirm your account by clicking the following link: " + url
      };

      transporter.sendMail(mailOptions, (err, info) => {
        console.log("transporter: sendMail: ");
        if (err) {
          //TODO: ROLLBACK LOGIC
          console.log("transporter spot 1");
          logger.error(
            "A(n) " +
              err.constructor.name +
              " error occurred while attempting to send" +
              " verification email. Rollback is required."
          );
          /*
              //DEV ONLY:  COMMENTED OUT THESE LINES FOR DEV ONLY::: 
              I THINK the IP address has to be registered with GOOGLE in order to use SMTP.
              res.statusMessage = err.message;
              return res.status(500).json({ msg: err.message });
           
              by-passing this allowed a user to get created but it was hotwiring the code and causing the header to get set twice...
              crashing the app.
           */

          res.statusMessage = err.message;
          return res.status(500).json({ msg: err.message });
        }

        const token = jwt.encode(user, "key");
        console.log("transporter spot 4");
        return res.status(200).json({
          success: true,
          msg: "Successfully created new user with email:" + user.email,
          token: token,
          clientId: user._id,
          isVerified: user.is_verified
        });
      });
    });
  });
  console.log("transporter spot 5 -> next...");
  next();
});

module.exports = router;
