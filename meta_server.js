var express = require('express');
var app = express();
var cors = require('cors');
const fs = require('fs')
app.use(cors())

app.get('/', function (req, res) {
    res.send("meta server reached.");
})

app.get('/meta', function (req, res) {
    fs.readFile('meta_data.meta', 'utf8', function (err, data) {
        if (err) throw err;
        res.send(JSON.parse(data));
    });
})

app.listen(8001, function () {
    console.log('App running on port 8001');
});