const router = require('express').Router();
const StripeHelper = require('../../utility/stripeHelper');
const MongooseHelper = require('../../utility/mongooseHelper');


router.get('/coupon/:coid', async function(req, res) {
    const coupon_id = String(req.params.coid);
    const client_id = String(req.query.cid);

    if(!coupon_id) {
        return res.status(400).send({msg: "INVALID_COID"});
    }

    if(!client_id) {
        return res.status(400).send({msg: "INVALID_CID"});
    }

    const result = await MongooseHelper.retrieveCouponInfo(coupon_id);


    if(!result) {
        return res.status(200).end();
    }
    // Check to see if there are any restrictions for this coupon.
    if(result.restricted_to && result.restricted_to.length > 0) {
        let isAllowed = false;
        for(let id of result.restricted_to) {
            if(id === client_id) {
                isAllowed = true;
                break;
            }
        }

        if(!isAllowed) {
            return res.status(200).end();
        }
    }

    return res.status(200).send(result);
});

const passport = require("passport");

router.get('/stripe/charges', passport.authenticate("ClientStrategy", { session: false }, null), async function(req, res) {
    const id = req.user._id;
    if(typeof id === 'undefined' || id === null || id === ''){
        return res.status(500).send({success: false, err: "INVALID_CLIENT_ID"});
    }

    const result = await getChargesForTable(id);
    if(result.code !== 200) {
        console.log("STRIPE CHARGE ERROR:", result.code, result.err);
        return res.status(result.code).send({success: false, err: result.err});
    }

    return res.status(200).send({success: true, result: result.charges});
});
async function getChargesForTable(id) {
    try {
        return await _getChargesForTable(id);
    } catch(err) {
        return err;
    }
}
function _getChargesForTable(id) {
    return new Promise(async (resolve, reject) => {
        const result = await MongooseHelper.retrieveChargeIdsFromClient(id);
        if(result.code !== 200) {
            return reject({code: result.code, err: result.err});
        } else if(result.charges.length === 0) {
            return resolve({code: 200, result: []});
        }

        let chargeInfo = [];
        for(let charge of result.charges) {
            const result = await StripeHelper.retrieveChargeInfoFromChargeId(charge);
            if(result.code !== 200) {
                //TODO: ERROR OCCURRED! HANDLE HERE!
                continue;
            }

            chargeInfo.push(result.data);
        }
        resolve({code: 200, charges: chargeInfo});
    });
}

module.exports = router;