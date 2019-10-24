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
 * Original Filename: driverLogin.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 8/14/19, 3:18 PM
 */

const router = require('express').Router();
const jwt = require("jwt-simple");
const rand = require('rand-token');

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const User = require("adder-models").User;
const Driver = require("adder-models").Driver;
const nodemailer = require('nodemailer');

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


router.post('/', async function (req, res, next) {
    let user;

    if (typeof req.body.email === 'undefined' || !req.body.email) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request was missing email in query.`));
    }

    const email = req.body.email;

    try {
        user = await User.findOne({email: email});
    } catch (err) {
        console.log("ERROR FINDING USER");
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(err);
    }

    if (user === null) {
        // Wait a for some time before returning, to help prevent timing attacks.
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, (1000 + Math.random() * (2000)));
        });
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({err: "USER_DOES_NOT_EXIST"});
        return next();
    }

    let token = rand.generate(6, "0123456789");
    user.password_token = token;
    user.change_attempts = 0;

    try {
        await user.save();
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(err);
    }

    let mailOptions = {
        from: 'Do Not Reply <no-reply@addermobile.com>',
        to: email,
        subject: 'Forgot Password',
        html: 'Please enter the following code into your app: </p><p>' + token + '</p>',
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
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(err);
    }

    res.status(HTTPStatusCodes.OK).json({});
    return next();
});

router.post('/verify-token', function(req, res) {
  if (!req.body.email || !req.body.token) {
    return res.status(400).json({success: false, msg: "Please send attributes: 'email' and 'token'"});
  }

  User.findOne({
    email: req.body.email
  }).exec(function (err, user) {
    if (err) {
      res.statusMessage = err.message;
      return res.status(500).json({success: false, msg: err.message});
    }

    if (user) {
      if (user.password_token === req.body.token) {
	return res.status(200).json({success: true, msg: "Tokens match."});
      } else {
	return res.status(200).json({success: false, msg: "Incorrect token."});
      }
    } else {
      return res.status(400).json({success: false, msg: "User is nil"});
    }
  });
});

router.post('/change-password', function (req, res) {
    if (!req.body.password || !req.body.email || !req.body.token) {
        return res.status(400).json({msg: "Please send attributes: 'password', 'token', and 'email'"});
    }

    User.findOne({
        email: req.body.email 
    }).exec(function (err, user) {
        if (err) {
            res.statusMessage = err.message;
            return res.status(500).json({success: false, msg: err.message});
        }

	console.log("found user");

        if (user) {
          if (user.password_token == req.body.token) {
            user.password_token = undefined;
            user.driver_hash = req.body.password;

            user.save(function (err, savedUser) {
                if (err) {
                    res.statusMessage = err.message;
                    return res.status(500).json({success: false, msg: err.message});
                }

		console.log("user saved");

                if (savedUser) {
                    return res.status(200).json({success: true, msg: "Password was changed succesfully"});
                } else {
                    return res.status(400).json({
                        success: false,
                        msg: "No user was returned. Ensure proper formatting."
                    });
                }
            });
          } else {
	    return res.status(400).json({success: false, msg: "Tokens do not match."});
	  }
        } else {
            return res.status(400).json({success: false, msg: "Problem finding user"});
        }
    });
});

module.exports = router;
