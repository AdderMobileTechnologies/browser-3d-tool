var express = require("express");
var app = express();
var cors = require("cors");
const fs = require("fs");
var nodemailer = require("nodemailer");

app.use(cors());

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
  console.log("/email/send/");
  console.log("req:", req);
  //------------------------------------
  var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "no-reply@addermobile.com",
      pass: "Sharedacces$1"
    }
  });

  var mailOptions = {
    from: "from@example.com",
    to: "b.forte@addermobile.com",
    subject: "Wrap Plug Image",

    html: "<h1>Attachments</h1>",
    attachments: [
      {
        // utf-8 string as an attachment
        filename: "mail_test.txt",
        content: "Attachments"
      },
      {
        filename: "logo",
        path: "public/logo512.png"
      }
    ]
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });
  /*
  NODEMAILER_SMTP_HOST=smtp.gmail.com
  NODEMAILER_SMTP_PORT=465
  NODEMAILER_USER=no-reply@addermobile.com
  NODEMAILER_PASS=Sharedacces$1
  */
  //------------------------------------
});

app.listen(8001, function() {
  console.log("App running on port 8001");
});
