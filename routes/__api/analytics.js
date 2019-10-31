const router = require('express').Router();
const passport = require('passport');

router.get("/all", passport.authenticate('jwt', {session: false}), async function(req, res) {

});

module.exports = router;

