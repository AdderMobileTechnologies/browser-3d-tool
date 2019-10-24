const User = require("adder-models").User;
const Client = require('adder-models').Client;
const TempUser = require("adder-models").TempUser;
const router = require('express').Router();
const rand = require('rand-token');
const nodemailer = require('nodemailer');
const jwt = require('jwt-simple');
const API_HOST = process.env.PORTAL_API_HOST;
const FRONTEND_HOST = process.env.FRONTEND_HOST;


const nodemailerOptions = {
    host: process.env.NODEMAILER_SMTP_HOST,
    port: Number(process.env.NODEMAILER_SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
};

const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;

let transporter = nodemailer.createTransport(nodemailerOptions);

router.post("/exists", async function (req, res, next) {
    const email = String(req.body.email);

    let user = null;

    if(typeof email === "undefined" || email === null) {
        res.status(HTTPStatusCodes.BAD_REQUEST).end();
        return next(new Error("Request was missing email in body."));
    }

    try {
        user = User.findOne({email: email});
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(err);
    }
    if(user === null) {
        res.status(HTTPStatusCodes.OK).end();
    } else {
        res.status(HTTPStatusCodes.NOT_FOUND).end();
    }
});

router.post("/register", async function (req, res) {
    const logger = new ImmutableTagLogger("POST /auth/register<" + req.body.email + ">");


    let userLookupResult = null;
    // console.log("REGISTER BODY: ", req.body);

    // First we want to check and see if the user is already registered as something else.
    // If the user is registered as something else, we want to update the temp user verification and
    // update the existing user doc, rather than attempt to create new ones.

    logger.debug("Checking to see if user already exists in database.");
    try {
        userLookupResult = await User.findOne({email: req.body.email});
    } catch (err) {
        logger.error("A(n) " + err.constructor.name + " error occurred while attempting user lookup. No rollback is" +
            " needed. Returning.");
        logger.error(JSON.stringify(err, null, 4));
        res.statusMessage = err.message;
        return res.status(500).json({err: err});
    }

    if (userLookupResult) {
        logger.debug("Found existing user.");

        // A user was found. Update the docs here.
        if (req.body.role === 'client' && typeof userLookupResult.client_id !== 'undefined' && userLookupResult.client_id) {
            logger.debug("Attempting to create client account for email, but client account already exists!");
            return res.status(400).json({success: false, msg: "ALREADY_REGISTERED"});
        }

        if (req.body.role === 'driver' && typeof userLookupResult.driver_id !== 'undefined' && userLookupResult.driver_id) {
            logger.debug("Attempting to create driver account for email, but driver account already exists!");
            return res.status(400).json({success: false, msg: "ALREADY_REGISTERED"});
        }

        const token = jwt.encode(userLookupResult, "key");


        if (req.body.role === 'driver' && (typeof userLookupResult.driver_id === 'undefined' || !userLookupResult.driver_id)) {
            logger.debug("Attempting to register as driver.");
            logger.debug("Assigning driver hash to user.");
            userLookupResult.driver_hash = req.body.password;
            try {
                await userLookupResult.save();
                logger.debug("Successfully saved driver hash to user. Returning.");
                return res.status(200).json({
                    success: true,
                    msg: "CONTINUE_REGISTER",
                    token: token,
                    clientId: userLookupResult._id,
                    isVerified: userLookupResult.is_verified
                });
            } catch (err) {
                logger.error("A(n) " + err.constructor.name + " occurred while attempting to update User document" +
                    " with driver hash. No rollback is needed.");
                res.statusMessage = err.message;
                return res.status(500).json({err: err});
            }
        }

        if (req.body.role === 'client' && (typeof userLookupResult.client_id === 'undefined' || !userLookupResult.client_id)) {
            logger.debug("Attempting to register as client.");
            logger.debug("Assigning hash to user.");
            userLookupResult.hash = req.body.password;
            try {
                await userLookupResult.save();
                logger.debug("Successfully saved hash to user. Returning.");
                return res.json({
                    success: true,
                    msg: "CONTINUE_REGISTER",
                    token: token,
                    clientId: userLookupResult._id,
                    isVerified: userLookupResult.is_verified
                });
            } catch (err) {
                logger.error("A(n) " + err.constructor.name + " occurred while attempting to update User document" +
                    " with hash. No rollback is needed.");
                res.statusMessage = err.message;
                return res.status(500).json({err: err});
            }
        }
    }

    let vtoken = rand.generate(16);

    const tempUser = new TempUser({
        email: req.body.email,
        verification_token: vtoken,
        role: req.body.role,
        created_at: Date.now()
    });
    logger.debug("Created TempUser document.");

    let newUser = null;
    if (req.body.role === 'client') {
        newUser = new User({
            email: req.body.email,
            hash: req.body.password,
            role: req.body.role,
            is_verified: false,
            is_registered: false,
            created_at: Date.now()
        });
    } else if (req.body.role === 'driver') {
        newUser = new User({
            email: req.body.email,
            driver_hash: req.body.password,
            role: req.body.role,
            is_verified: false,
            is_registered: false,
            created_at: Date.now()
        });
    }
    logger.debug("Created User document");

    tempUser.save(function (err, tempUser) {
        if (err) {
            logger.error("A(n) " + err.constructor.name + " occurred while attempting to save new TempUser document." +
                " No rollback is needed.");
            logger.error(JSON.stringify(err, null, 4));
            res.statusMessage = err.message;
            return res.status(500).json({success: false, msg: err.message});
        }

        logger.debug("Successfully saved TempUser document " + tempUser._id);

        newUser.save(function (err, user) {
            if (err) {
                //TODO: ROLLBACK LOGIC
                logger.error("A(n) " + err.constructor.name + " occurred while attempting to save new User document." +
                    " Rollback is needed.");
                res.statusMessage = err.message;
                return res.status(500).json({success: false, msg: err.message});
            }

            logger.debug("Successfully saved User document " + user._id);

            logger.debug("Attempting to send verification email.");

            let url = API_HOST + '/auth/email-verification/' + vtoken;

            let mailOptions = {
                from: 'Do Not Reply <no-reply@addermobile.com>',
                to: req.body.email,
                subject: 'Please confirm account',
                html: 'Click the following link to confirm your account: </p><p>' + url + '</p>',
                text: 'Please confirm your account by clicking the following link: ' + url
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    //TODO: ROLLBACK LOGIC
                    logger.error("A(n) " + err.constructor.name + " error occurred while attempting to send" +
                        " verification email. Rollback is required.");
                    res.statusMessage = err.message;
                    return res.status(500).json({msg: err.message});
                }

                const token = jwt.encode(user, "key");
                return res.status(200).json({
                    success: true,
                    msg: 'Successfully created new user with email:' + user.email,
                    token: token,
                    clientId: user._id,
                    isVerified: user.is_verified
                });
            });
        });
    });
});

router.get('/email-verification/:URL', function (req, res) {
    var token = req.params.URL;

    TempUser.findOne({
        verification_token: token
    }, function (err, user) {
        if (err) {
            res.statusMessage = err.message;
            return res.redirect(FRONTEND_HOST);
        }

        if (user) {
            User.findOne({
                email: user.email
            }, function (err, actual_user) {
                user.remove();

                actual_user.is_verified = true;
                actual_user.save(function (err, updatedUser) {
                    if (err) {
                        res.statusMessage = err.message;
                        return res.status(500).json({success: false, msg: err.message})
                    }

                    let mailOptions = {
                        from: 'Do Not Reply <no-reply@addermobile.com>',
                        to: user.email,
                        subject: 'Account Verified!',
                        text: 'Your account has been verified. Thank you!'
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            res.statusMessage = err.message;
                            return res.status(500).json({msg: err.message});
                        }

                        console.log('Message sent!: %s, %s', info.messageId, info.response);
                    });

                    //res.json({success: true, msg: 'User successfully verified: ' + actual_user.email});
                    res.redirect(FRONTEND_HOST);
                });
            });
        } else {
            return res.redirect(FRONTEND_HOST);
        }
    });
});

router.post('/login', function (req, res) {
    const logger = new ImmutableTagLogger(`POST /auth/login<${req.body.email}`);
    logger.debug("Beginning login request");
    if (typeof req.body.email === 'undefined' || !req.body.email) {
        logger.error("No email was provided!");
        return res.status(400).json({err: "NO_EMAIL_PROVIDED"});
    }

    if (typeof req.body.role === 'undefined' || !req.body.role) {
        logger.error("No role was provided!");
        return res.status(400).json({err: "NO_ROLE_PROVIDED"});
    }

    if (req.body.role !== "client" && req.body.role !== "driver") {
        logger.error("Invalid role " + req.body.role + " was provided!");
        return res.status(400).json({err: "INVALID_ROLE_PROVIDED"});
    }

    const email = String(req.body.email);
    const role = String(req.body.role);

    let hashedPass = null;
    if (typeof req.body.hashed_pass !== 'undefined' && req.body.hashed_pass) {
        hashedPass = req.body.hashed_pass;
    }
    logger.debug("Required fields are present.");

    User.findOne({email: email}, function (err, user) {
        if (err) {
            res.statusMessage = err.message;
            logger.error("A " + err.constructor.name + " error occurred while retrieving User with email: " + email);
            logger.error(JSON.stringify(err, null, 4));
            return res.status(500).json({err: "MONGOOSE_ERROR"});
        }

        if (!user) {
            return res.status(404).json({err: "USER_NOT_FOUND"});
        }

        logger.debug("Found user with _id: " + user._id);

        user.comparePassword(user._id, req.body.password, role, hashedPass, async function (err, isMatch) {
            logger.debug("Compare password has completed.");
            if (err) {
                res.statusMessage = err.message;
                logger.error(`An error occurred while comparing passed password to stored password:\n${err.stack}`);
                return res.status(500).json({err: "MONGOOSE_ERROR"});
            }

            if (isMatch) {
                logger.debug("Correct password was provided.");
                const token = jwt.encode(user, "key");
                if (role === "client") {
                    if (typeof user.client_id === 'undefined' || !user.client_id) {
                        logger.error("Passed role was client, but user has no client_id!");
                        return res.status(400).json({msg: "USER_IS_NOT_CLIENT"});
                    }

                    if (!user.is_registered) {
                        logger.error("User for email " + email + " has a user account, but is not fully registered" +
                            " as a client!");
                        return res.status(200).json({
                            msg: 'FINISH_CLIENT_REGISTER',
                            token: token,
                            is_verified: user.is_verified
                        });
                    }

                    await Client.findOne({email: req.body.email}, function (err, client) {
                        if (err) {
                            res.statusMessage = err.message;
                            logger.error("A " + err.constructor.namespace + " error occurred while retrieving" +
                                " client account.");
                            logger.error(JSON.stringify(err, null, 4));
                            return res.status(500).json({err: "MONGOOSE_ERROR"});
                        }

                        if (!client) {
                            logger.error("Client retrieval completed successfully, but no client entry was found!");
                            return res.status(401).json({err: "CLIENT_NOT_FOUND"});
                        }

                        logger.debug("Client " + client._id + " successfully retrieved.");
                        let clientId = client._id;
                        //TODO: AFTER REFACTOR, ADD IN PROFILING MIDDLEWARE TO LOG REQUEST STATUS
                        return res.status(200).json({token: token, clientId: clientId, is_verified: user.is_verified});
                    });
                } else if (role === "driver") {
                    if (typeof user.driver_id === 'undefined' || !user.driver_id) {
                        logger.error("Passed role was driver, but user has no driver_id!");
                        return res.status(400).json({err: "USER_IS_NOT_DRIVER"});
                    }

                    if (user.is_registered) {
                        logger.debug("Returning token for driver.");
                        return res.status(200).json({token: token});
                    } else {
                        logger.error("User for email " + email + " has a user account, but is not fully registered" +
                            " as a driver!");
                        return res.status(200).json({
                            msg: 'FINISH_DRIVER_REGISTER',
                            token: token,
                            is_verified: user.is_verified
                        });
                    }
                }
            } else {
                logger.debug("Wrong password provided.");
                res.status(400).json({msg: 'WRONG_PASSWORD', err: "WRONG_PASSWORD"});
            }
        });
    });
});

router.get('/forgot-password', async function (req, res, next) {
    let user;

    if (typeof req.query.email === 'undefined' || !req.query.email) {
        res.status(HTTPStatusCodes.BAD_REQUEST).end();
        return next(new Error(`Request was missing email in query.`));
    }

    const email = req.query.email;

    try {
        user = await User.findOne({email: email});
    } catch (err) {
        console.error(err);
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(err);
    }

    if (user === null) {

        // Wait a for some time before returning, to help prevent timing attacks.
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, (1000 + Math.random() * (2000)));
        });
        res.status(HTTPStatusCodes.OK).end();
        return next();
    }

    let token = rand.generate(16);
    user.password_token = token;

    try {
        await user.save();
    } catch(err) {
        console.error(err);
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(err);
    }

    let url = API_HOST + "/auth/change-password/" + token;

    let mailOptions = {
        from: 'Do Not Reply <no-reply@addermobile.com>',
        to: email,
        subject: 'Forgot Password',
        html: 'Click the following link to change your password: </p><p>' + url + '</p>',
        text: 'Please change your password by clicking the following link: ' + url
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
        console.error(err);
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(err);
    }

    res.status(HTTPStatusCodes.OK).end();
    return next();
});

router.get('/change-password/:URL', function (req, res) {
    res.redirect(FRONTEND_HOST + "/#/authentication/verify-recovered-password?URL=" + req.params.URL);
});

router.post('/change-password/:token', async function (req, res, next) {
    const { token } = req.params;
    const { password } = req.body;

    let user = null;

    if(!token) {
        res.status(HTTPStatusCodes.BAD_REQUEST).end();
        return next(new Error(`Request URL was missing 'token'`));
    }

    if(!password) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({msg: "Please send attributes: 'password'"});
        return next(new Error(`Request body was missing 'password'`));
    }

    try {
        user = await User.findOne({password_token: token});
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`Failed to retrieve User document:\n${err.stack}`));
    }

    if(!user) {
        res.status(HTTPStatusCodes.NOT_FOUND).end();
        return next(new Error(`User with password_token ${token} could not be found.`));
    }

    console.log("Provided password", password);
    console.log("Hash (Pre-Updated)", user.hash);

    user.password_token = undefined;
    user.hash = password;

    console.log("Updated Hash (Pre-Save)", user.hash);

    try {
        user = await user.save();
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error occurred while attempting to save updated User document to DB:\n${err.stack}`));
    }
    console.log("Updated Hash (Post-Save)", user.hash);

    res.status(HTTPStatusCodes.OK).end();
    return next();
});

module.exports = router;