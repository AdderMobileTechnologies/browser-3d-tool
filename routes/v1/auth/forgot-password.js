const express = require("express");
const router = express.Router();
const HTTPStatusCodes = require("node-common-utility").Constants
  .HTTPStatusCodes;
const rand = require("rand-token");
const User = require("adder-models").User;
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
let transporter = nodemailer.createTransport(nodemailerOptions);

////missing dependencies abover here....

router.get("/forgot-password", async function(req, res, next) {
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

  let url = META_URL + "/v1/auth/change-password/" + token;
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
