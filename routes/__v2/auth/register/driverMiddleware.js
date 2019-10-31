const path = require("path");
const rand = require("rand-token");
const fs = require("fs-extra");
const jwt = require("jwt-simple");
const multer = require('multer');

const nodemailer = require("nodemailer");
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const { User, TempUser, Driver } = require(path.join(process.env.ROOT_DIR, "modules", "adder-models"));

const freshDir = path.join(process.env.ROOT_DIR, "images", "driver", "fresh");

const storage = multer.diskStorage({
    destination: function(req, files, cb) {
        try {
            fs.ensureDirSync(freshDir);
        } catch(err) {
            return cb("COULD_NOT_CREATE_IMAGE_DIR")
        }
        cb(null, freshDir);
    },
    filename: function(req, file, cb) {
        let prefix = String(new Date().getTime());
        const fname = prefix + file.originalname;
        if(file.originalname === "vehicle.png") {
            if(req.vehiclePic != null) {
                return cb("VEHICLE_PIC_DUPLICATE");
            }
            req.vehiclePic = fname;
        } else {
            return cb("UNRECOGNIZED_PICTURE_NAME");
        }
        return cb(null, fname);
    }
});
const upload = multer({
    storage: storage,
    onError: function(err, next) {
        return next(err);
    }
});

const _flowUserExists = async (req, res, next) => {
    res.locals.logger.info("User Entry existed, adding driver entry");

    //region Create Driver Entry
    try {
        await res.locals.driver.save();
        res.locals.logger.info("Successfully created Driver Entry: " + res.locals.driver._id);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to save driver entry to database: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
        return next("COULD_NOT_SAVE_DRIVER_ENTRY");
    }
    //endregion

    //region Update User Entry
    try {
        res.locals.userLookup.driver_id = res.locals.driver._id;
        res.locals.userLookup.device_id = res.locals.driver.device_id;
        res.locals.userLookup.driver_hash = res.locals.password;
        await res.locals.userLookup.save();
        res.locals.logger.info("Successfully updated User Entry: " + res.locals.userLookup._id);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to update user entry in database: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.respone = {err: "INTERNAL_SERVER_ERROR"};
        return next("COULD_NOT_UPDATE_DRIVER_ENTRY");
    }
    //endregion

    //region Move Multer Images To Proper Directory
    const destDir = path.join(process.env.ROOT_DIR, "images", String(res.locals.userLookup._id));

    try {
        fs.ensureDirSync(destDir);
        res.locals.logger.info("Successfully created destination image directory: " + destDir);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to create destination directory " + freshDir);
        res.locals.logger.error(JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {};
        return next("COULD_NOT_CREATE_IMAGE_DESTINATION_DIR");
    }

    try {
        await fs.move(path.join(freshDir, req.vehiclePic), path.join(destDir, "vehicle.png"));
        res.locals.logger.info("Successfully moved driver images from " + freshDir + " to " + destDir);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to move images from fresh directory " + freshDir +
            " to final directory " + destDir);
        res.locals.logger.error(JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {};
        return next("COULD_NOT_MOVE_IMAGES_TO_FINAL_DIR");
    }
    //endregion

    //region Create TempUser Entry and Send Verification Email (If Not Already Verified)
    if(!res.locals.userLookup.isVerified) {
        res.locals.logger.info("Retrieved User is not verified. Creating TempUser entry.");
        res.locals.verificationToken = rand.generate(16);

        try {
            res.locals.tempUserLookup = await TempUser.findOne({email: res.locals.email});
        } catch(err) {
            res.locals.logger.error("An error occurred while attempting to retrieve an existing TempUser entry.");
            res.locals.logger.error(JSON.stringify(err, null, 4));
            res.locals.code = 500;
            res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
            return next("COULD_NOT_LOOKUP_EXISTING_TEMP_USER");
        }

        if(res.locals.tempUserLookup == null) {
            res.locals.tempUser = new TempUser({
                email: res.locals.email,
                verification_token: res.locals.verificationToken,
                role: "driver",
                created_at: Date.now()
            });

            try {
                await res.locals.tempUser.save();
                res.locals.logger.info("Successfully saved TempUser entry: " + res.locals.tempUser._id);
            } catch(err) {
                res.locals.logger.error("An error occurred while attempting to save temp user entry to database: " + JSON.stringify(err, null, 4));
                res.locals.code = 500;
                res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
                return next("COULD_NOT_SAVE_TEMP_USER");
            }
        } else {
            try {
                res.locals.oldVerificationToken = res.locals.tempUserLookup.verification_token;
                res.locals.oldTempUserRole = res.locals.tempUserLookup.role;
                res.locals.tempUserLookup.verification_token = res.locals.verificationToken;
                res.locals.tempUserLookup.role = "driver";
                await res.locals.tempUserLookup.save();
                res.locals.logger.info("Successfully updated existing TempUser entry!");
            } catch(err) {
                console.log(err);
                res.locals.logger.error("An error occurred while attempting to update existing TempUser entry. Error" +
                    " was: " + JSON.stringify(err, null, 4));
                res.locals.code = 500;
                res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
                return next("COULD_NOT_UPDATE_TEMP_USER");
            }
        }
    }


    let url = process.env.PORTAL_API_HOST + '/auth/email-verification/' + res.locals.verificationToken;
    let mailOptions = {
        from: 'Do Not Reply <no-reply@addermobile.com>',
        to: res.locals.email,
        subject: 'Adder Account Verification.',
        html: 'Please click the following link to confirm your account: </p><p>' + url + '</p>',
        text: 'Please confirm your account by clicking the following link: ' + url
    };
    const nodemailerOptions = {
        host: process.env.NODEMAILER_SMTP_HOST,
        port: Number(process.env.NODEMAILER_SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    };

    res.locals.logger.debug("In _flowUserDoesNotExist(), before nodemailer send, res.locals.requestWasCancelled:" +
        " " + res.locals.requestWasCancelled);
    if(res.locals.requestWasCancelled) {
        return next("CONNECTION_CLOSED");
    }
    let transporter = nodemailer.createTransport(nodemailerOptions);
    let transporterPromise = new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return reject(err);
            }

            return resolve(info);
        });
    });

    try {
        res.locals.logger.info("Sending verification email.");
        await transporterPromise;
        res.locals.logger.info("Successfully sent verification email!");
    } catch(err) {
        res.locals.logger.error("An error occurred while waiting for verification email to send! Error was: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {};
        return next("NODEMAILER_TRANSPORT_FAILURE");
    }
    //endregion

    res.locals.code = 200;
    res.locals.response = {
        token: jwt.encode({
            _id: res.locals.driver._id,
            time: new Date().getTime() / 1000
        }, process.env.JWT_SIGNING_KEY)
    };

    if(res.locals.requestWasCancelled) {
        next("CONNECTION_CLOSED");
    } else {
        next();
    }
};
const _flowUserDoesNotExist = async (req, res, next) => {
    res.locals.logger.info("User Entry did not exist, creating account.");
    //region Create Driver Entry
    try {
        await res.locals.driver.save();
        res.locals.logger.info("Successfully created Driver Entry: " + res.locals.driver._id);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to save driver entry to database: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
        return next("COULD_NOT_SAVE_DRIVER_ENTRY");
    }
    //endregion
    //region Create User Entry
    res.locals.user = new User({
        email: res.locals.email,
        driver_hash: res.locals.password,
        is_verified: false,
        is_registered: true,
        created_at: Date.now(),
        driver_id: res.locals.driver._id,
        device_id: res.locals.driver.device_id
    });

    try {
        await res.locals.user.save();
        res.locals.logger.info("Successfully saved User entry to database: " + res.locals.user._id);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to save user entry to database: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
        return next("COULD_NOT_SAVE_USER_ENTRY");
    }
    //endregion

    //region Create the TempUser Entry (With Verification Token)
    res.locals.verificationToken = rand.generate(16);

    res.locals.tempUser = new TempUser({
        email: res.locals.email,
        verification_token: res.locals.verificationToken,
        role: "driver",
        created_at: Date.now()
    });

    try {
        await res.locals.tempUser.save();
        res.locals.logger.info("Successfully saved TempUser entry to database: " + res.locals.tempUser._id);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to save temp user entry to database: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
        return next("COULD_NOT_SAVE_TEMP_USER");
    }
    //endregion

    //region Move Multer Images To Proper Directory
    const destDir = path.join(process.env.ROOT_DIR, "images", String(res.locals.user._id));

    try {
        fs.ensureDirSync(destDir);
        res.locals.logger.info("Successfully created destination image directory: " + destDir);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to create destination directory " + freshDir);
        res.locals.logger.error(JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {};
        return next("COULD_NOT_CREATE_IMAGE_DESTINATION_DIR");
    }

    try {
        await fs.move(path.join(freshDir, req.vehiclePic), path.join(destDir, "vehicle.png"));
        res.locals.logger.info("Successfully moved driver images from " + freshDir + " to " + destDir);
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting to move images from fresh directory " + freshDir +
        " to final directory " + destDir);
        res.locals.logger.error(JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {};
        return next("COULD_NOT_MOVE_IMAGES_TO_FINAL_DIR");
    }
    //endregion

    //region Send Verification Email
    let url = process.env.PORTAL_API_HOST + '/auth/email-verification/' + res.locals.verificationToken;
    let mailOptions = {
        from: 'Do Not Reply <no-reply@addermobile.com>',
        to: res.locals.email,
        subject: 'Adder Account Verification.',
        html: 'Please click the following link to confirm your account: </p><p>' + url + '</p>',
        text: 'Please confirm your account by clicking the following link: ' + url
    };
    const nodemailerOptions = {
        host: process.env.NODEMAILER_SMTP_HOST,
        port: Number(process.env.NODEMAILER_SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    };
    res.locals.logger.debug("In _flowUserDoesNotExist(), before nodemailer send, res.locals.requestWasCancelled:" +
        " " + res.locals.requestWasCancelled);
    if(res.locals.requestWasCancelled) {
        return next("CONNECTION_CLOSED");
    }

    let transporter = nodemailer.createTransport(nodemailerOptions);
    let transporterPromise = new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return reject(err);
            }

            return resolve(info);
        });
    });

    try {
        res.locals.logger.info("Sending verification email.");
        await transporterPromise;
        res.locals.logger.info("Successfully sent verification email!");
    } catch(err) {
        res.locals.logger.error("An error occurred while waiting for verification email to send!");
        res.locals.logger.error(JSON.stringify(err));
        res.locals.code = 500;
        res.locals.response = {};
        return next("NODEMAILER_TRANSPORT_FAILURE");
    }
    //endregion

    res.locals.code = 200;
    res.locals.response = {
        token: jwt.encode({
            _id: res.locals.driver._id,
            time: new Date().getTime() / 1000
        }, process.env.JWT_SIGNING_KEY)
    };

    if(res.locals.requestWasCancelled) {
        next("CONNECTION_CLOSED");
    } else {
        next();
    }
};

const initialize = (req, res, next) => {
    req.profilePic = null;
    req.vehiclePic = null;
    req.licensePic = null;
    res.locals.userLookup = null;
    res.locals.user = null;
    res.locals.tempUserLookup = null;
    res.locals.tempUser = null;
    res.locals.oldVerificationToken = null;
    res.locals.oldTempUserRole = null;
    res.locals.driver = null;
    res.locals.code = null;
    res.locals.data = null;
    res.locals.verificationToken = null;
    res.locals.jwtToken = null;
    res.locals.runtime = new Date().getTime();
    res.locals.requestWasCancelled = false;
    res.locals.logger = new ImmutableTagLogger("/auth/register/driver");
    req.on("close", function(err) {
        res.locals.logger.error("Connection was closed early with err: " + JSON.stringify(err));
        res.locals.requestWasCancelled = true;
    });

    next();

};
const validate = (req, res, next) => {
    //region Double Check Multer Stuff
    if(!req.vehiclePic) {
        res.locals.logger.error("An error occurred during validation. Multer returned successfully, but image path" +
            " was missing for one or more images.");
        res.locals.code = 500;
        res.locals.response = {};
        return next("MULTER_CHECK_FAILED");
    }
    //endregion

    const email = String(req.body.email);
    const password = String(req.body.password);

    console.log(JSON.stringify(req.body, null, 4));
    let driver = {
        device_id: req.body.device_id,
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        street_address: req.body.street_address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        mobile_pic_path: req.body.p_mobile_pic_path,
        vehicle: {
            year: req.body.vehicle_year,
            make: req.body.vehicle_make,
            model: req.body.vehicle_model,
            vtrim: req.body.vehicle_trim,
            notes: req.body.vehicle_notes,
            mobile_pic_path: req.body.v_mobile_pic_path
        },
        insurance: {
            carrier: req.body.insurance_carrier,
            policy: req.body.insurance_policy
        },
        license: {
            number: req.body.license_number,
            state: req.body.license_state,
            expiration: req.body.license_expiration,
            mobile_pic_path: req.body.l_mobile_pic_path
        },
        current_miles: {
            day: req.body.current_miles_day,
            week: req.body.current_miles_week,
            month: req.body.current_miles_month
        },
        mile_reset_dates: {
            day: req.body.mile_reset_dates_day,
            week: req.body.mile_reset_dates_week,
            month: req.body.mile_reset_dates_month
        }
    };

    try {
        driver = new Driver(driver);
    } catch(err) {
        res.locals.logger.error("An error occurred while creating driver object in validate. Mongoose returned with" +
            " error: " + JSON.stringify(err, null, 4));
        res.locals.code = 400;
        res.locals.response = {};
        return next("INVALID_DRIVER_BODY");
    }


    if(!email || !password) {
        res.locals.logger.error("Request body was missing email and/or password fields!");
        res.locals.code = 400;
        res.locals.response = {};
        return next("MISSING_EMAIL_PASSWORD");
    }


    res.locals.email = email;
    res.locals.password = password;
    res.locals.driver = driver;
    next();
};
const flow = async (req, res, next) => {
    //region Check If Registration Should Continue
    // First, we check to see if a user with this email already exists in the database. If so, it is possible the
    // user is a client trying to register as a driver, or vice versa.
    let userLookup = null;
    try {
        userLookup = await User.findOne({email: res.locals.email});
    } catch(err) {
        res.locals.logger.error("An error occurred while attempting user lookup. Error was: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {err: "INTERNAL_SERVER_ERROR"};
        return next("MONGOOSE_FAILED_USER_LOOKUP");
    }

    // If userLookup is not null, then we need to check if the user has already registered as a driver. If so, they
    // can't register again, so we kick them back.
    if(userLookup && typeof userLookup.driver_id !== "undefined" && userLookup.driver_id) {
        res.locals.code = 400;
        res.locals.response = {err: "ALREADY_REGISTERED"};
        return next("ALREADY_REGISTERED");
    }
    //endregion

    //region Continue Registration Based On User Existence.
    if(userLookup) {
        res.locals.userLookup = userLookup;
        _flowUserExists(req, res, next);
    } else {
        _flowUserDoesNotExist(req, res, next);
    }
    //endregion
};
const error = async (error, req, res, next) => {
    res.locals.logger.error("Error handler has been called with error: " + JSON.stringify(error, null, 2));

    //region Rollback Data Entries
    if(res.locals.userLookup) {
        try {
            res.locals.userLookup.driver_id = undefined;
            res.locals.userLookup.device_id = undefined;
            res.locals.userLookup.driver_hash = undefined;
            await res.locals.userLookup.save();
            res.locals.logger.info("ROLLBACK > Successfully completed rollback of Existing User entry!");
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to rollback user entry to previous database state failed with" +
                " error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual updating ASAP! Affected id: User." + res.locals.user._id);
        }
    }
    if(res.locals.user) {
        try {
            await res.locals.user.remove();
            res.locals.logger.info("ROLLBACK > Successfully completed rollback of User entry!");
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to remove user entry from database failed with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual removal ASAP! Affected id: User." + res.locals.user._id);
        }
    }
    if(res.locals.tempUserLookup && res.locals.oldVerificationToken) {
        try {
            res.locals.tempUserLookup.verification_token = res.locals.oldVerificationToken;
            res.locals.tempUserLookup.role = res.locals.oldTempUserRole;
            await res.locals.tempUserLookup.save();
            res.locals.logger.info("ROLLBACK > Successfully rolled back temp user entry to previous version.");
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to rollback TempUser entry in database failed with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual rollback ASAP! Affected id: TempUser." + res.locals.tempUser._id);
            res.locals.logger.error("FATAL > Original role: " + res.locals.tempUserLookup.role);
            res.locals.logger.error("FATAL > Original token: " + res.locals.tempUserLookup.oldVerificationToken);
        }
    }
    if(res.locals.tempUser) {
        try {
            await res.locals.tempUser.remove();
            res.locals.logger.info("ROLLBACK > Successfully completed rollback of TempUser entry!");
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to remove temp user entry from database failed with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual removal ASAP! Affected id: TempUser." + res.locals.tempUser._id);
        }
    }
    if(res.locals.driver) {
        try {
            await res.locals.driver.remove();
            res.locals.logger.info("ROLLBACK > Successfully completed rollback of Driver entry!");
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to remove driver entry from database failed with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual removal ASAP! Affected id: Driver." + res.locals.driver._id);
        }
    }
    if(req.profilePic) {
        const file = path.join(freshDir, req.profilePic);
        try {
            if(fs.existsSync(file)) {
                await fs.removeSync(file);
                res.locals.logger.info("ROLLBACK > Successfully completed rollback of FRESH profile picture!");
            }
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to remove profile picture from freshDir " + freshDir + " failed" +
                " with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual removal ASAP! Affected file: " + file);
        }
    }
    if(req.vehiclePic) {
        const file = path.join(freshDir, req.vehiclePic);
        try {
            if(fs.existsSync(file)) {
                await fs.removeSync(file);
                res.locals.logger.info("ROLLBACK > Successfully completed rollback of FRESH vehicle picture!");
            }
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to remove vehicle picture from freshDir " + freshDir + " failed" +
                " with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual removal ASAP! Affected file: " + file);
        }
    }
    if(req.licensePic) {
        const file = path.join(freshDir, req.licensePic);
        try {
            if(fs.existsSync(file)) {
                await fs.removeSync(file);
                res.locals.logger.info("ROLLBACK > Successfully completed rollback of FRESH license picture!");
            }
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to remove license picture from freshDir " + freshDir + " failed" +
                " with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual removal ASAP! Affected file: " + file);
        }
    }
    if(res.locals.user || res.locals.userLookup) {
        let finalPicDir;
        if(res.locals.user) {
            finalPicDir = path.join(process.env.ROOT_DIR, "images", String(res.locals.user._id));
        } else {
            finalPicDir = path.join(process.env.ROOT_DIR, "images", String(res.locals.userLookup._id));
        }
        try {
            if(fs.existsSync(finalPicDir)) {
                await fs.removeSync(finalPicDir);
                res.locals.logger.info("ROLLBACK > Successfully completed rollback of FINAL directory images!");
            }
        } catch(err) {
            res.locals.logger.error("FATAL > Attempt to remove driver images final directory: " + finalPicDir + " failed with error: " + JSON.stringify(err, null, 4));
            res.locals.logger.error("FATAL > This will require manual removal ASAP! Affected directory: " + finalPicDir);
        }
    }
    //endregion

    // TODO: POSSIBLE ERROR CODES ON MOBILE SIDE
    //  "INTERNAL_SERVER_ERROR 500"
    //  "ALREADY_REGISTERED 400"


    res.locals.code = error.code;
    next();
};
const close = (req, res) => {
    if(!res.locals.code) {
        res.locals.code = 500;
    }

    let msg = "";
    msg += "(" + res.locals.code + ") -- ";
    msg += (new Date().getTime()) - res.locals.runtime + "ms";
    res.locals.logger.info(msg);
    res.locals.logger.debug("In close(), res.locals.requestWasCancelled: " + res.locals.requestWasCancelled);
    if(!res.locals.requestWasCancelled) {
        return res.status(res.locals.code).json(res.locals.response);
    }
};

module.exports = {
    Registration: {
        upload,
        initialize,
        validate,
        flow,
        error,
        close
    }
};