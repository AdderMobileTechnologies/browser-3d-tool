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
console.log(`Your env var is ${NODEMAILER_SMTP_HOST}`); // whatever
////////////////////
//authentication 
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
//ok 
// noT OK: const User = require("adder-models").User;
const User = require("adder-models").User;
const Client = require("adder-models").Client;
/*
const router = require('express').Router();
const jwt = require("jwt-simple");

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const User = require("adder-models").User;
const Client = require("adder-models").Client;

*/





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
app.post("/v2/auth/login/client", async function(req, res, next) {
  console.log("post: /v2/auth/login/client");
  console.log("req.body",req.body);
  let user = null;
  let client = null;
  let { email, password } = req.body;

  //region Validate Input
  //TODO: REGEX TEST FOR EMAIL AND PASSWORD!
  if(!email) {
      res.status(HTTPStatusCodes.BAD_REQUEST).end();
      return next(new Error(`Email was missing from request.`));
  }
  if(!password) {
      res.status(HTTPStatusCodes.BAD_REQUEST).end();
      return next(new Error(`Password was missing from request.`));
  }
  //endregion

  //region Find User
  try {
      user = await User.findOne({email: email});
  } catch(err) {
      res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
      return next(new Error(`An error occurred while retrieving user entry from database:\n${err.stack}`));
  }
  if(!user || !user.client_id) {
      res.status(HTTPStatusCodes.NOT_FOUND).end();
      return next();
  }
  //endregion

  //region Check if Users Password Is Correct
  try {
      let isMatch = await user.isCorrectClientPassword(password);
      if(!isMatch) {
          res.status(HTTPStatusCodes.FORBIDDEN).end();
          return next();
      }
  } catch(err) {
      res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
      return next(new Error(`An error occurred while comparing client password:\n${err.stack}`));
  }
  //endregion


  //region Find Driver
  try {
      client = await Client.findById(user.client_id);
  } catch(err) {
      res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
      return next(new Error(`An error occurred while retrieving client entry from database:\n${err.stack}`));
  }
  if(!client) {
      res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
      return next(new Error(`Retrieved User entry has an id listed for client_id, but client document ${user.client_id} could not be found!`));
  }
  //endregion

  //region Create Token and Return Driver Data
  let token = jwt.encode({
      _id: client._id,
      time: new Date().getTime() / 1000
  }, process.env.JWT_SIGNING_KEY);

  //region TODO: REFACTOR THIS TO ONLY RETURN TOKEN. DRIVER INFO SHOULD BE RETRIEVED IN SEPARATE ENDPOINT
  let returnObject = {
      token: token,
      clientid: client._id
  };
  //endregion


  res.status(HTTPStatusCodes.OK).json(returnObject);
  return next();
});

///////




app.listen(8001, function() {
  console.log("App running on port 8001");
});


//module.exports = router;