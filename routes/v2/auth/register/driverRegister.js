/*
 * Copyright (C) 2019 Adder Mobile Technologies, Inc.
 * All Rights Reserved
 *
 * This file and its contents are the exclusive property of Adder Mobile Technologies, Inc.
 * Only approved personal are authorized to view, modify, distribute, discuss, execute, or otherwise
 * utilize or manipulate this file in any capacity, including but not limited to personal or commercial
 * use, distribution via any combination of physical or digital means, and physical reproduction
 * of this files contents or any of its associated metadata.
 *
 * Any questions may be directed to Brandon Bush<b.bush@adder.io>, CTO
 *
 * Project: web-api
 * Module: <INSERT_MODULE_NAME>
 * Original Filename: driverRegister.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 8/14/19, 12:35 AM
 */

const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const freshDir = path.join(process.env.ROOT_DIR, "images", "driver", "fresh");

const storage = multer.diskStorage({
    destination: function (req, files, cb) {
        try {
            fs.ensureDirSync(freshDir);
        } catch (err) {
            return cb(err);
        }
        cb(null, freshDir);
    },
    filename: function (req, file, cb) {
        let prefix = String(new Date().getTime());
        const filename = prefix + file.originalname;
        if (file.originalname === "vehicle.png") {
            if (req.vehiclePic != null) {
                return cb(new Error("Vehicle picture has already been uploaded, but has been received by multer again."));
            }
            req.vehiclePic = filename;
        } else {
            return cb(new Error(`Picture name did not match any valid names: ${file.originalname}`));
        }
        return cb(null, filename);
    }
});
const upload = multer({
    storage: storage,
    onError: function (err, next) {
        return next(err);
    }
});

async function execute(req, res, next) {
}


router.post("/driver",
    upload,
    execute
);

module.exports = router;