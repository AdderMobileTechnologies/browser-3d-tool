const express = require("express");
const router = express.Router();
const fs = require("fs");

router.post("/save/", function(req, res) {
  let dataString = JSON.stringify(req.body.saved_designs_array);
  fs.writeFile("SavedDesignActions.js", dataString, err => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log("data saved!");
  });
});
router.get("/get/", function(req, res) {
  fs.readFile("SavedDesignActions.js", "utf8", function(err, data) {
    if (err) throw err;

    if (data === "") {
      data = `{ foo: "bar" }`;
      res.send({ data: "empty" });
    } else {
      res.send(JSON.parse(data));
    }
  });
});

module.exports = router;
