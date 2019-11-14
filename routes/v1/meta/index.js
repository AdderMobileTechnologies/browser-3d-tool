const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/environment2/", function(req, res) {
  console.log("meta/environment2 reached....req.body:", req.body);
  fs.readFile("meta_data/environment2.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

router.get("/environment/", function(req, res) {
  fs.readFile("meta_data/environment.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

router.get("/", function(req, res) {
  fs.readFile("meta_data.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

router.get("/ad_types/", function(req, res) {
  fs.readFile("meta_data/ad_types.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

router.get("/design/", function(req, res) {
  fs.readFile("meta_data/design.meta", "utf8", function(err, data) {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

module.exports = router;
