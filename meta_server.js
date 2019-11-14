require("dotenv").config();

var express = require("express");
var app = express();
var cors = require("cors");
var nodemailer = require("nodemailer");
var bodyParser = require("body-parser");
const router = require("express").Router();

const User = require("adder-models").User;
const compression = require("compression");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

//region Adder Module Imports
const Stopwatch = require("node-common-utility").Profiling.Stopwatch;
const Regex = require("node-common-utility").Regex;
//endregion

//const FRONTEND_HOST = process.env.FRONTEND_HOST;
app.use(cors());
app.use(router);

app.use(bodyParser.json({ limit: "50mb", extended: true })); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
    limit: "50mb"
  })
);

//BREAKING CHANGE:
app.use("/", require("./routes"));

//region Configure Middleware
app.disable("etag");
app.use(compression());
app.use(cors());

//endregion

//region Global Endpoint Initializer
app.use(function(req, res, next) {
  res.locals.__runtimeStopwatch = new Stopwatch();
  res.locals.__runtimeStopwatch.start();
  return next();
});
//endregion
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

app.use(passport.initialize({ userProperty: "user" }));
//endregion

app.get("/", function(req, res) {
  res.send("meta server reached.");
});

// app.post("/email/send/", function(req, res) {
//   var transport = nodemailer.createTransport({
//     host: NODEMAILER_SMTP_HOST,
//     port: NODEMAILER_SMTP_PORT,
//     auth: {
//       user: NODEMAILER_USER,
//       pass: NODEMAILER_PASS
//     }
//   });

//   var mailOptions = {
//     from: req.body.from,
//     to: req.body.to,
//     subject: req.body.subject,
//     html: req.body.html,
//     attachments: req.body.attachments
//   };

//   transport.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return console.log(error);
//     }
//     console.log("Email sent: " + info.response);
//   });

//  });

app.listen(8001, function() {
  console.log("App running on port 8001");
});

module.exports = router;
