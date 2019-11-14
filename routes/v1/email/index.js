const express = require("express");
const router = express.Router();
var nodemailer = require("nodemailer");

const {
  NODEMAILER_SMTP_HOST,
  NODEMAILER_SMTP_PORT,
  NODEMAILER_USER,
  NODEMAILER_PASS
} = require("../../../config");

router.post("/send/", function(req, res) {
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
});

module.exports = router;
