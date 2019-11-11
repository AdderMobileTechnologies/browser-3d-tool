require("dotenv").config();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const BCrypt = require("bcrypt");

const ImmutableTagLogger = require("node-common-utility").Logging
  .ImmutableTagLogger;

const UserConnection = mongoose.createConnection(
  `${process.env.PORTAL_DB_HOST}/UsersDB?authSource=admin`,
  {
    user: process.env.PORTAL_DB_USER,
    pass: process.env.PORTAL_DB_PASS,
    useNewUrlParser: true,
    useCreateIndex: true
  }
);

const UserSchema = new Schema(
  {
    is_verified: {
      type: Boolean,
      unique: false,
      required: false
    },
    is_registered: {
      type: Boolean,
      unique: false,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    hash: {
      type: String,
      unique: false,
      required: false
    },
    password_token: {
      type: String,
      unique: false,
      required: false
    },
    change_attempts: Number,
    updated_at: {
      type: Date,
      unique: false,
      required: false
    },
    created_at: {
      type: Date,
      unique: false,
      required: false
    }
  },
  {
    collection: "Users",
    strict: false
  }
);

//region General Usage Middleware
const userPreSaveUpdatedAtMiddleware = async function(next) {
  console.log("API: MODEL : user.js : 1");
  console.log("this._id:", this._id);
  const logger = new ImmutableTagLogger(
    "UserSchema.pre('save')<" + this._id + ">"
  );
  this.updated_at = new Date().toISOString();
  console.log("API: MODEL : user.js : 1.1");
  if (this.isNew) {
    console.log("API: MODEL : user.js : 1.2");
    logger.debug("created_at field successfully generated.");
    this.created_at = new Date().toISOString();
  }
  logger.debug("updated_at field successfully generated.");
  console.log("API: MODEL : user.js : 1.3");
  return next();
};
//endregion

//region Instance Methods
UserSchema.methods.upgradeDriverAccount = async function(
  newPassword,
  hashedPassword
) {
  console.log("API: MODEL : user.js : 2");
  if (!this.old_password) {
    return true;
  }

  if (this.old_password !== hashedPassword) {
    return false;
  }

  try {
    this.driver_hash = newPassword;
    this.old_password = undefined;
    await this.save();
  } catch (err) {
    throw err;
  }

  return true;
};
UserSchema.methods.isCorrectDriverPassword = async function(password) {
  try {
    console.log("API: MODEL : user.js : 3");
    return await bcryptComparePassword(password, this.driver_hash);
  } catch (err) {
    throw err;
  }
};
UserSchema.methods.isCorrectClientPassword = async function(password) {
  try {
    console.log("API: MODEL : user.js : 4");
    return await bcryptComparePassword(password, this.hash);
  } catch (err) {
    throw err;
  }
};

//TODO: REFACTOR TO THROW ERROR OBJECT INSTEAD OF JUST LOGGING, PICK UP IN CALLING FUNCTION, LET GLOBAL HANDLER TAKE CARE OF IT
UserSchema.methods.comparePassword = async function(
  uid,
  password,
  role,
  hashedPassword,
  callback
) {
  console.log("API: MODEL : user.js : 5");
  const logger = new ImmutableTagLogger(
    "UserSchema.comparePassword()<" + uid + ">"
  );
  if (role && role === "driver") {
    if (hashedPassword) {
      // A hashed password was provided. Should we do a check?
      if (typeof this.old_password !== "undefined" && this.old_password) {
        // Looks like this is a migrated account that has not yet been updated, and since
        // a hashed pass was provided, we want to try and update the account;
        if (this.old_password === hashedPassword) {
          // The old password from the migrated account matches the provided hashed password from the app.
          // This user is legit, upgrade em!

          this.driver_hash = password;
          try {
            await this.save();
          } catch (err) {
            // TODO: AN ERROR OCCURRED WHILE SAVING THE NEW PASSWORD!!!
            logger.error(err);
          }

          try {
            await this.update({ $unset: { old_password: 1 } });
          } catch (err) {
            // TODO: AN ERROR OCCURRED WHILE UPDATING THE DOCUMENT TO REMOVE THE OLD PASSWORD
            logger.error(err);
          }
        } else {
          return callback(null, false);
        }
      }
    }
    try {
      console.log("API: MODEL : user.js : 6");
      let isMatch = await bcryptComparePassword(password, this.driver_hash);
      return callback(null, isMatch);
    } catch (err) {
      return callback(err);
    }
  } else if (role && role === "client") {
    if (hashedPassword) {
      console.log("API: MODEL : user.js : 7");
      logger.debug("Passed hashedPassword, attempting account upgrade");
      // A hashed password was provided. Should we do a check?
      if (typeof this.old_password !== "undefined" && this.old_password) {
        // Looks like this is a migrated account that has not yet been updated, and since
        // a hashed pass was provided, we want to try and update the account;
        if (this.old_password === hashedPassword) {
          // The old password from the migrated account matches the provided hashed password from the app.
          // This user is legit, upgrade em!

          this.hash = password;
          try {
            await this.save();
          } catch (err) {
            // TODO: AN ERROR OCCURRED WHILE SAVING THE NEW PASSWORD!!!
            logger.error(err);
          }

          try {
            await this.update({ $unset: { old_password: 1 } });
          } catch (err) {
            // TODO: AN ERROR OCCURRED WHILE UPDATING THE DOCUMENT TO REMOVE THE OLD PASSWORD
            logger.error(err);
          }
        }
      } else {
        // No old_password is present, so the account is up to date!
      }
    }
    try {
      console.log("API: MODEL : user.js : 8");
      logger.debug("Beginning password compare: " + password);
      let isMatch = await bcryptComparePassword(password, this.hash);
      return callback(null, isMatch);
    } catch (err) {
      return callback(err);
    }
  }
};
//endregion

//region Pre-Save Hook And Handler Middleware
const driverPreSaveMiddleware = async function(next) {
  console.log("API: MODEL : user.js : 9");
  const logger = new ImmutableTagLogger(
    "UserSchema.pre('save')<" + this._id + ">"
  );

  if (typeof this.driver_hash !== "undefined" && this.driver_hash) {
    console.log("API: MODEL : user.js : 10");
    if (this.isModified("driver_hash") || this.isNew) {
      console.log("API: MODEL : user.js : 11");
      logger.debug("Driver with updated or new driver_hash has been detected.");
      let salt;
      try {
        salt = await generateSalt();
      } catch (err) {
        return next({
          middleware: "driverPreSaveMiddleware",
          stage: "GENERATE_SALT",
          err: err
        });
      }
      logger.debug("Salt successfully generated.");

      let newHash;
      try {
        console.log("API: MODEL : user.js : 12");
        newHash = await generateHash(this.driver_hash, salt);
      } catch (err) {
        return next({
          middleware: "driverPreSaveMiddleware",
          stage: "GENERATE_HASH",
          err: err
        });
      }
      logger.debug("Hash successfully generated.");

      this.driver_hash = newHash;
    }
  }

  return next();
};
const clientPreSaveMiddleware = async function(next) {
  console.log("API: MODEL : user.js : 13");
  console.log("API: MODEL: USER: clientPreSaveMiddleware.");
  const logger = new ImmutableTagLogger(
    "UserSchema.pre('save').clientPreSaveMiddleware()<" + this._id + ">"
  );

  if (typeof this.hash !== "undefined" && this.hash) {
    console.log("API: MODEL : user.js : 14");
    logger.debug("User document already contains hash!");
    console.log("API: MODEL: USER: User document already contains hash.");
    if (this.isModified("hash") || this.isNew) {
      logger.debug("Client with updated or new hash has been detected.");
      console.log(
        "API: MODEL: USER: Client with updated or new hash has been detected."
      );
      let salt = null;
      try {
        salt = await generateSalt();
      } catch (err) {
        return next({
          middleware: "clientPreSaveMiddleware",
          stage: "GENERATE_SALT",
          err: err
        });
      }
      logger.debug("Salt successfully generated.");

      let newHash = null;
      try {
        newHash = await generateHash(this.hash, salt);
      } catch (err) {
        return next({
          middleware: "clientPreSaveMiddleware",
          stage: "GENERATE_HASH",
          err: err
        });
      }
      logger.debug("Hash successfully generated.");

      this.hash = newHash;
    } else {
      logger.debug(
        "this.hash was not marked as modified, or this.isNew was not set to true!"
      );
    }
  }

  return next();
};

UserSchema.pre("save", driverPreSaveMiddleware);
UserSchema.pre("save", clientPreSaveMiddleware);
UserSchema.pre("save", userPreSaveUpdatedAtMiddleware);
console.log("user.js MODEL AFTER UserSchema.pre(save,xxx)");
//endregion

function generateSalt() {
  console.log("API: MODEL : user.js : 15");
  return new Promise((resolve, reject) => {
    BCrypt.genSalt(10, async function(err, salt) {
      if (err) {
        return reject(err);
      }

      return resolve(salt);
    });
  });
}
function generateHash(origHash, salt) {
  console.log("API: MODEL : user.js : 16");
  return new Promise((resolve, reject) => {
    BCrypt.hash(origHash, salt, async function(err, hash) {
      if (err) {
        return reject(err);
      }
      return resolve(hash);
    });
  });
}
function bcryptComparePassword(password, hash) {
  console.log("API: MODEL : user.js : 17");
  return new Promise((resolve, reject) => {
    BCrypt.compare(password, hash, function(err, isMatch) {
      if (err) {
        return reject(err);
      }
      return resolve(isMatch);
    });
  });
}

module.exports = UserConnection.model("Users", UserSchema);
