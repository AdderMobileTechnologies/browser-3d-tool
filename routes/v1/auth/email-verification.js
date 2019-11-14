const express = require("express");
const router = express.Router();
const TempUser = require("adder-models").TempUser;
const FRONTEND_HOST = process.env.FRONTEND_HOST;
const User = require("adder-models").User;

//
var nodemailer = require("nodemailer");
const {
  NODEMAILER_SMTP_HOST,
  NODEMAILER_SMTP_PORT,
  NODEMAILER_USER,
  NODEMAILER_PASS,
  META_URL
} = require("../../../config");
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
//
router.get("/email-verification/:URL", function(req, res) {
  var token = req.params.URL;

  TempUser.findOne(
    {
      verification_token: token
    },
    function(err, user) {
      if (err) {
        res.statusMessage = err.message;
        console.log("auth: email-verification: redirect");
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
                console.log(
                  "email-verification:: return err in User.findOne..."
                );
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
              console.log("redirect ....1");
              res.redirect(FRONTEND_HOST);
            });
          }
        );
      } else {
        console.log("redirect ....2");
        return res.redirect(FRONTEND_HOST);
      }
    }
  );
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
