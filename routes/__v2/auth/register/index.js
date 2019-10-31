const router = require('express').Router();

const DriverMiddleware = require("./driverMiddleware");

router.post("/driver",
    DriverMiddleware.Registration.initialize,
    DriverMiddleware.Registration.upload.single("image"),
    DriverMiddleware.Registration.validate,
    DriverMiddleware.Registration.flow,
    DriverMiddleware.Registration.error,
    DriverMiddleware.Registration.close
);

module.exports = router;