console.log("meta_server: spot 1");
var express = require("express");
var app = express();
var cors = require("cors");
const fs = require("fs");
var nodemailer = require("nodemailer");

app.use(cors());

var bodyParser = require("body-parser");
//const router = require('express').Router();
const {
  NODEMAILER_SMTP_HOST,
  NODEMAILER_SMTP_PORT,
  NODEMAILER_USER,
  NODEMAILER_PASS,
  META_URL,
  API_URL
} = require("./config");
console.log("meta_server: spot 1.1");
/////////////--------------------------------------------------------------------------------------------------------XXX
console.log(`Your env var is ${NODEMAILER_SMTP_HOST}`); // whatever
console.log("meta_server: spot 1.1.1");
////////////////////
/*
Do I Need These in package-json? 
 "express": "^4.17.1",
    "express-jwt": "^5.3.1",
    "express-session": "^1.16.2",


*/
//-o-o-o-o-o-o FROM auth.js
/////////////////////////////////////////////////////////////////////////////////////////////
//const TempUser = require("adder-models").TempUser; // STARTS WILD GOOSE CHASE:
//////////////////////////////////////////////////////////////////////////////////////////////
console.log("meta_server: spot 1.1.2");

const rand = require("rand-token");
console.log("meta_server: spot 1.1.3");
//const nodemailer = require('nodemailer');
const jwt = require("jwt-simple");
console.log("meta_server: spot 1.1.4");
//const API_HOST = process.env.PORTAL_API_HOST;
const API_HOST = "http://locahost:8001";
console.log("meta_server: spot 1.1.4");
//const FRONTEND_HOST = process.env.FRONTEND_HOST;
//---------------------------------------------------------------------------------------------------------------------XXX
console.log("meta_server: spot 1.2");
const nodemailerOptions = {
  host: process.env.NODEMAILER_SMTP_HOST,
  port: Number(process.env.NODEMAILER_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
};

//const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const HTTPStatusCodes = require("node-common-utility").Constants
  .HTTPStatusCodes;

let transporter = nodemailer.createTransport(nodemailerOptions);
console.log("meta_server: spot 1.3");
//-o-o-o-o-o-o-o

//authentication
//const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
//ok
// noT OK: const User = require("adder-models").User;
const APIKey = require("adder-models").APIKey;
const User = require("adder-models").User;
const Client = require("adder-models").Client;
//const jwt = require("jwt-simple");

//-------------------
const compression = require("compression");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

//region Adder Module Imports
const ImmutableTagLogger = require("node-common-utility").Logging
  .ImmutableTagLogger;
const Ports = require("node-common-utility").Constants.Ports;
const HTTPCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const Stopwatch = require("node-common-utility").Profiling.Stopwatch;
const Regex = require("node-common-utility").Regex;
//endregion
console.log("meta_server: spot 1.4");
//region Initialize Utilities
const logger = new ImmutableTagLogger("SYSTEM");
//endregion
console.log("meta_server: spot 2");
//region Configure Middleware
app.disable("etag");
app.use(compression());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));
//endregion

//region Global Endpoint Initializer
app.use(function(req, res, next) {
  res.locals.__runtimeStopwatch = new Stopwatch();
  res.locals.__runtimeStopwatch.start();
  return next();
});
//endregion
console.log("meta_server: spot 1.5");
//region Configure Passport
const isObjectIDValid = id => {
  if (typeof id === "undefined" || id === null) {
    return new Error(`Decoded JWT Payload did not contain an _id field!`);
  } else if (!Regex.mongoDBObjectIDRegex.test(id)) {
    return new Error(
      `Decoded JWT Payload contained an _id that failed regex test!`
    );
  } else {
    return true;
  }
};
// noinspection JSCheckFunctionSignatures
passport.use(
  "jwt",
  new JwtStrategy(
    {
      secretOrKey: "key",
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt")
    },
    function(jwt_payload, done) {
      User.findById(jwt_payload._id, function(err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    }
  )
);
// noinspection JSCheckFunctionSignatures
/*
// noinspection JSCheckFunctionSignatures
passport.use("ClientStrategy", new JwtStrategy({
    secretOrKey: process.env.JWT_SIGNING_KEY,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt")
}, function(jwt_payload, done) {
    //TODO: ADD IN STATEFUL LOGIC TO CHECK IF A JWT KEY HAS BEEN REVOKED! DO THIS IN THE METADB!
    let valid = isObjectIDValid(jwt_payload._id);
    if(!valid) {
        logger.error(`An error has occurred in passport ClientStrategy strategy (in server.js):\n${valid.stack}`);
        return done(valid, false);
    }

    Client.findById(jwt_payload._id, function(err, client) {
        if(err) {
            logger.error(`An error has occurred in passport ClientStrategy strategy (in server.js):\n${err.stack}`);
            return done(err, false);
        }

        if(!client) {
            logger.info(`(401) -- PASSPORT ClientStrategy REJECTION: ${jwt_payload._id}`);
            return done(null, false);
        }

        return done(null, client);
    });
}));
*/

app.use(passport.initialize({ userProperty: "user" }));
//endregion

//---------

/////////////////
//body-parser parameters to allow larger files:
// bodyParser = {
//   json: { limit: "50mb", extended: true },
//   urlencoded: { limit: "10mb", extended: true }
// };

app.use(bodyParser.json({ limit: "50mb", extended: true })); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
    limit: "50mb"
  })
);
console.log("meta_server: spot 3");

app.get("/", function(req, res) {
  res.send("meta server reached.");
});

app.get("/meta", function(req, res) {
  console.log("/meta/");
  fs.readFile("meta_data.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

app.get("/meta/ad_types/", function(req, res) {
  console.log("/meta/ad_types/");
  fs.readFile("meta_data/ad_types.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

app.get("/meta/environment/", function(req, res) {
  console.log("/meta/environment/");
  fs.readFile("meta_data/environment.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

app.get("/meta/environment2/", function(req, res) {
  console.log("/meta/environment2/");
  fs.readFile("meta_data/environment2.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

app.get("/meta/design/", function(req, res) {
  console.log("/meta/design/");
  fs.readFile("meta_data/design.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

app.post("/email/send/", function(req, res) {
  //console.log("/email/send/");
  /*console.log("req.query:", req.query);
  console.log("req.params:", req.params);
  console.log("req.body", req.body);
  console.log(`Your env var is ${NODEMAILER_SMTP_HOST}`); // whatever
  console.log(`Your env var is ${NODEMAILER_USER}`); // whatever
  console.log(`Your env var is ${NODEMAILER_PASS}`); // whatever
  console.log(`Your env var is ${NODEMAILER_SMTP_PORT}`); // whatever
  */
  //------------------------------------
  var transport = nodemailer.createTransport({
    host: NODEMAILER_SMTP_HOST,
    port: NODEMAILER_SMTP_PORT,
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS
    }
  });

  var mailOptions = {
    from: req.body.from,
    to: req.body.to,
    subject: req.body.subject,
    html: req.body.html,
    attachments: req.body.attachments
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });

  //------------------------------------
});
app.post("/design/save/", function(req, res) {
  console.log("post: /design/save/");
  let dataString = JSON.stringify(req.body.saved_designs_array);
  fs.writeFile("SavedDesignActions.js", dataString, err => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log("data saved!");
  });
});
app.get("/design/get/", function(req, res) {
  console.log("get: /design/get/");
  fs.readFile("SavedDesignActions.js", "utf8", function(err, data) {
    if (err) throw err;
    console.log("data:", data);
    console.log("type of data:", typeof data);
    if (data === "") {
      data = `{ foo: "bar" }`;
      res.send({ data: "empty" });
    } else {
      res.send(JSON.parse(data));
    }
  });
});
//authentication
// post :: "/v2/auth/login/client";

// TRIED TO USE THIS:
// router.use("/client", require("./routes/v2/auth/login/clientLogin"));

// app.post("/v2/auth/login/client", function(req, res) {
//   console.log("post: /v2/auth/login/client");
//   console.log("req.body",req.body);

//    /* so far so good.
//    req.body { email: 'bayon_forte@yahoo.com',
//   password: 'password123',
//   role: 'client' }
//   ::now: what does it doe in the real api?

//   */

//   /*let dataString = JSON.stringify(req.body.saved_designs_array);
//   fs.writeFile("SavedDesignActions.js", dataString, err => {
//     // throws an error, you could also catch it here
//     if (err) throw err;

//     // success case, the file was saved
//     console.log("data saved!");
//   });*/
// });
console.log("meta_server: spot 4");
app.post("/v2/auth/login/client", async function(req, res, next) {
  console.log("post: /v2/auth/login/client");
  console.log("req.body", req.body);
  let user = null;
  let client = null;
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
    user = await User.findOne({ email: email }); //TypeError: User.findOne is not a function
  } catch (err) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(
      new Error(
        `An error occurred while retrieving user entry from database:\n${err.stack}`
      )
    );
  }
  if (!user || !user.client_id) {
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

  //region Find Driver
  try {
    client = await Client.findById(user.client_id);
  } catch (err) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(
      new Error(
        `An error occurred while retrieving client entry from database:\n${err.stack}`
      )
    );
  }
  if (!client) {
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(
      new Error(
        `Retrieved User entry has an id listed for client_id, but client document ${user.client_id} could not be found!`
      )
    );
  }
  //endregion

  //region Create Token and Return Driver Data
  let token = jwt.encode(
    {
      _id: client._id,
      time: new Date().getTime() / 1000
    },
    process.env.JWT_SIGNING_KEY
  );

  //region TODO: REFACTOR THIS TO ONLY RETURN TOKEN. DRIVER INFO SHOULD BE RETRIEVED IN SEPARATE ENDPOINT
  let returnObject = {
    token: token,
    clientid: client._id
  };
  //endregion

  res.status(HTTPStatusCodes.OK).json(returnObject);
  return next();
});

/////// /auth/register

//. . . .
/* THIS WORKED for create user .
app.post("/auth/register", function(req,res) {
  console.log("meta_server.js: .../auth/register:")
  console.log("req:",req);
})
*/
app.post("/auth/register", async function(req, res) {
  const logger = new ImmutableTagLogger(
    "POST /auth/register<" + req.body.email + ">"
  );

  console.log("meta_server.js : app.post-> /auth/register  ");
  console.log("spot 1");
  let userLookupResult = null;
  // console.log("REGISTER BODY: ", req.body);

  // First we want to check and see if the user is already registered as something else.
  // If the user is registered as something else, we want to update the temp user verification and
  // update the existing user doc, rather than attempt to create new ones.

  logger.debug("Checking to see if user already exists in database.");
  console.log("spot 1.1");
  try {
    console.log("User model: User: Does Exist: yes");
    console.log(
      "spot 1.2 not returning await User.findOne({email: req.body.email});"
    );
    try {
      userLookupResult = await User.findOne({ email: req.body.email });
    } catch (err) {
      console.log("try catch err for User.findOne: err:", err);
    }

    console.log("spot 1.2.1");
    console.log("userLookupResult:", userLookupResult);
  } catch (err) {
    console.log("spot 1.3");
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
  console.log("spot 2");
  if (userLookupResult) {
    logger.debug("Found existing user.");
    console.log("spot 2.1");
    // A user was found. Update the docs here.
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
    console.log("spot 2.2");
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

    console.log("spot 2.3");
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
      console.log("spot 2.4");
      logger.debug("Attempting to register as client.");
      logger.debug("Assigning hash to user.");
      userLookupResult.hash = req.body.password;
      try {
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
  console.log("spot 3");
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
    console.log("spot 3.1");
    newUser = new User({
      email: req.body.email,
      hash: req.body.password,
      role: req.body.role,
      is_verified: false,
      is_registered: false,
      created_at: Date.now()
    });
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
  console.log("spot 3.2");
  tempUser.save(function(err, tempUser) {
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
      if (err) {
        //TODO: ROLLBACK LOGIC
        console.log("spot 4");
        logger.error(
          "A(n) " +
            err.constructor.name +
            " occurred while attempting to save new User document." +
            " Rollback is needed."
        );
        res.statusMessage = err.message;
        return res.status(500).json({ success: false, msg: err.message });
      }

      logger.debug("Successfully saved User document " + user._id);

      logger.debug("Attempting to send verification email.");

      let url = API_HOST + "/auth/email-verification/" + vtoken;

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
        if (err) {
          //TODO: ROLLBACK LOGIC
          logger.error(
            "A(n) " +
              err.constructor.name +
              " error occurred while attempting to send" +
              " verification email. Rollback is required."
          );
          res.statusMessage = err.message;
          return res.status(500).json({ msg: err.message });
        }

        const token = jwt.encode(user, "key");
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
  console.log("spot last");
});

//. . . .
//-o-o-o-o-o-o-o-o
// additional auth.js endpoints ::

app.post("/exists", async function(req, res, next) {
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
/* A DUPLICATE I THINK: 
router.post("/register", async function (req, res) {
  const logger = new ImmutableTagLogger("POST /auth/register<" + req.body.email + ">");


  let userLookupResult = null;
  // console.log("REGISTER BODY: ", req.body);

  // First we want to check and see if the user is already registered as something else.
  // If the user is registered as something else, we want to update the temp user verification and
  // update the existing user doc, rather than attempt to create new ones.

  logger.debug("Checking to see if user already exists in database.");
  try {
      userLookupResult = await User.findOne({email: req.body.email});
  } catch (err) {
      logger.error("A(n) " + err.constructor.name + " error occurred while attempting user lookup. No rollback is" +
          " needed. Returning.");
      logger.error(JSON.stringify(err, null, 4));
      res.statusMessage = err.message;
      return res.status(500).json({err: err});
  }

  if (userLookupResult) {
      logger.debug("Found existing user.");

      // A user was found. Update the docs here.
      if (req.body.role === 'client' && typeof userLookupResult.client_id !== 'undefined' && userLookupResult.client_id) {
          logger.debug("Attempting to create client account for email, but client account already exists!");
          return res.status(400).json({success: false, msg: "ALREADY_REGISTERED"});
      }

      if (req.body.role === 'driver' && typeof userLookupResult.driver_id !== 'undefined' && userLookupResult.driver_id) {
          logger.debug("Attempting to create driver account for email, but driver account already exists!");
          return res.status(400).json({success: false, msg: "ALREADY_REGISTERED"});
      }

      const token = jwt.encode(userLookupResult, "key");


      if (req.body.role === 'driver' && (typeof userLookupResult.driver_id === 'undefined' || !userLookupResult.driver_id)) {
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
              logger.error("A(n) " + err.constructor.name + " occurred while attempting to update User document" +
                  " with driver hash. No rollback is needed.");
              res.statusMessage = err.message;
              return res.status(500).json({err: err});
          }
      }

      if (req.body.role === 'client' && (typeof userLookupResult.client_id === 'undefined' || !userLookupResult.client_id)) {
          logger.debug("Attempting to register as client.");
          logger.debug("Assigning hash to user.");
          userLookupResult.hash = req.body.password;
          try {
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
              logger.error("A(n) " + err.constructor.name + " occurred while attempting to update User document" +
                  " with hash. No rollback is needed.");
              res.statusMessage = err.message;
              return res.status(500).json({err: err});
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
  if (req.body.role === 'client') {
      newUser = new User({
          email: req.body.email,
          hash: req.body.password,
          role: req.body.role,
          is_verified: false,
          is_registered: false,
          created_at: Date.now()
      });
  } else if (req.body.role === 'driver') {
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

  tempUser.save(function (err, tempUser) {
      if (err) {
          logger.error("A(n) " + err.constructor.name + " occurred while attempting to save new TempUser document." +
              " No rollback is needed.");
          logger.error(JSON.stringify(err, null, 4));
          res.statusMessage = err.message;
          return res.status(500).json({success: false, msg: err.message});
      }

      logger.debug("Successfully saved TempUser document " + tempUser._id);

      newUser.save(function (err, user) {
          if (err) {
              //TODO: ROLLBACK LOGIC
              logger.error("A(n) " + err.constructor.name + " occurred while attempting to save new User document." +
                  " Rollback is needed.");
              res.statusMessage = err.message;
              return res.status(500).json({success: false, msg: err.message});
          }

          logger.debug("Successfully saved User document " + user._id);

          logger.debug("Attempting to send verification email.");

          let url = API_HOST + '/auth/email-verification/' + vtoken;

          let mailOptions = {
              from: 'Do Not Reply <no-reply@addermobile.com>',
              to: req.body.email,
              subject: 'Please confirm account',
              html: 'Click the following link to confirm your account: </p><p>' + url + '</p>',
              text: 'Please confirm your account by clicking the following link: ' + url
          };

          transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                  //TODO: ROLLBACK LOGIC
                  logger.error("A(n) " + err.constructor.name + " error occurred while attempting to send" +
                      " verification email. Rollback is required.");
                  res.statusMessage = err.message;
                  return res.status(500).json({msg: err.message});
              }

              const token = jwt.encode(user, "key");
              return res.status(200).json({
                  success: true,
                  msg: 'Successfully created new user with email:' + user.email,
                  token: token,
                  clientId: user._id,
                  isVerified: user.is_verified
              });
          });
      });
  });
});
*/
app.get("/email-verification/:URL", function(req, res) {
  var token = req.params.URL;

  TempUser.findOne(
    {
      verification_token: token
    },
    function(err, user) {
      if (err) {
        res.statusMessage = err.message;
        return res.redirect(FRONTEND_HOST);
      }

      if (user) {
        User.findOne(
          {
            email: user.email
          },
          function(err, actual_user) {
            user.remove();

            actual_user.is_verified = true;
            actual_user.save(function(err, updatedUser) {
              if (err) {
                res.statusMessage = err.message;
                return res
                  .status(500)
                  .json({ success: false, msg: err.message });
              }

              let mailOptions = {
                from: "Do Not Reply <no-reply@addermobile.com>",
                to: user.email,
                subject: "Account Verified!",
                text: "Your account has been verified. Thank you!"
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  res.statusMessage = err.message;
                  return res.status(500).json({ msg: err.message });
                }

                console.log(
                  "Message sent!: %s, %s",
                  info.messageId,
                  info.response
                );
              });

              //res.json({success: true, msg: 'User successfully verified: ' + actual_user.email});
              res.redirect(FRONTEND_HOST);
            });
          }
        );
      } else {
        return res.redirect(FRONTEND_HOST);
      }
    }
  );
});

app.post("/login", function(req, res) {
  const logger = new ImmutableTagLogger(`POST /auth/login<${req.body.email}`);
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

app.get("/forgot-password", async function(req, res, next) {
  let user;

  if (typeof req.query.email === "undefined" || !req.query.email) {
    res.status(HTTPStatusCodes.BAD_REQUEST).end();
    return next(new Error(`Request was missing email in query.`));
  }

  const email = req.query.email;

  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    console.error(err);
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(err);
  }

  if (user === null) {
    // Wait a for some time before returning, to help prevent timing attacks.
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000 + Math.random() * 2000);
    });
    res.status(HTTPStatusCodes.OK).end();
    return next();
  }

  let token = rand.generate(16);
  user.password_token = token;

  try {
    await user.save();
  } catch (err) {
    console.error(err);
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(err);
  }

  let url = API_HOST + "/auth/change-password/" + token;

  let mailOptions = {
    from: "Do Not Reply <no-reply@addermobile.com>",
    to: email,
    subject: "Forgot Password",
    html:
      "Click the following link to change your password: </p><p>" +
      url +
      "</p>",
    text: "Please change your password by clicking the following link: " + url
  };

  try {
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  } catch (err) {
    console.error(err);
    res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
    return next(err);
  }

  res.status(HTTPStatusCodes.OK).end();
  return next();
});

app.get("/change-password/:URL", function(req, res) {
  res.redirect(
    FRONTEND_HOST +
      "/#/authentication/verify-recovered-password?URL=" +
      req.params.URL
  );
});

app.post("/change-password/:token", async function(req, res, next) {
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

  console.log("Provided password", password);
  console.log("Hash (Pre-Updated)", user.hash);

  user.password_token = undefined;
  user.hash = password;

  console.log("Updated Hash (Pre-Save)", user.hash);

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
  console.log("Updated Hash (Post-Save)", user.hash);

  res.status(HTTPStatusCodes.OK).end();
  return next();
});

//-o-o-o-o-o-o-o-o-o
console.log("meta_server: spot 5");
app.listen(8001, function() {
  console.log("App running on port 8001");
});
console.log("meta_server: spot 6");
//module.exports = router;
