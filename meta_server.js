var express = require("express");
var app = express();
var cors = require("cors");
const fs = require("fs");
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

app.listen(8001, function() {
  console.log("App running on port 8001");
});
