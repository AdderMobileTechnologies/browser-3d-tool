var express = require("express");
var app = express();
var cors = require("cors");
const fs = require("fs");
var nodemailer = require("nodemailer");

app.use(cors());

var bodyParser = require("body-parser");

const {
  NODEMAILER_SMTP_HOST,
  NODEMAILER_SMTP_PORT,
  NODEMAILER_USER,
  NODEMAILER_PASS,
  META_URL,
  API_URL
} = require("./config");
console.log(`Your env var is ${NODEMAILER_SMTP_HOST}`); // whatever

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
  //console.log("req:", req);
  //console.log("req.body", req.body);
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
    res.send(JSON.parse(data));
  });
});
app.listen(8001, function() {
  console.log("App running on port 8001");
});
