const router = require('express').Router();
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const Client = require("adder-models").Client;
const Campaign = require("adder-models").Campaign;
const Stripe = require('../../utility/stripeHelper');
const ClientGeofence = require("adder-models").ClientGeofence;
const ClientFixedPointGeofence = require("adder-models").ClientFixedPointGeofence;
const Billboard = require("adder-models").Billboard;
const Geoset = require("adder-models").Geoset;
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;

//TODO: Split createStripeCharge into two separate methods, one to create customer, one to create charge.
//region UNDOCUMENTED
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		const data = JSON.parse(req.body.data);
		console.log(req.user);
		const clientId = data.campaignObj.owner;

		if (!fs.existsSync('./campaign-images')) {
			fs.mkdirSync('./campaign-images');
		}

		const dir = "./campaign-images/" + clientId;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir)
		}

		if(typeof req.imageDirectory === 'undefined' || req.imageDirectory === null) {
			req.imageDirectory = dir;
		}

		cb(null, dir);
	},
	filename: function(req, file, cb) {
		const filename = Date.now() + file.fieldname + ".png";
		const fullFilepath = req.imageDirectory + "/" + filename;
		if(file.fieldname === "bodyImg") {
			req.bodyImagePath = fullFilepath;
		} else if(file.fieldname === "windowImg") {
			req.windowImagePath = fullFilepath;
		}
		cb(null, filename);
	}


});
const upload = multer({
	storage: storage,
	onError: function(err, next) {
		console.log(err);
		next(err);
	}
});
//endregion

//region PROCEDURE FUNCTIONS
async function createBillboardCampaign(data) {
	return new Promise(async (resolve, reject) => {
		let convGeos = [];
		let billboards = [];
		for(let geo of data.geoData.convGeos) {
			convGeos.push(new ClientGeofence({
				type: "Feature",
				properties: {
					asset_name: ""
				},
				geometry: {
					type: "LineString",
					coordinates: geo
				}
			}));
		}

		for(let i = 0; i < data.geoData.fixedPoints.length; ++i) {
			let fixedPointGeo = data.geoData.fixedPoints[i];
			let cone = data.geoData.cones[i];

			let billboard = new Billboard({
				type: "Feature",
				properties: {
					asset_name: "",
					base_point: fixedPointGeo.geometry.coordinates,
					geoset_owner: null
				},
				geometry: {
					type: "Polygon",
					coordinates: [cone.geometry.coordinates]
				}
			});

			billboards.push(billboard);
		}

		let geoset = new Geoset({
			owner: null,
			billboards: billboards.map((value) => {
				return value._id
			}),
			conv_geos: convGeos.map((value) => {
				return value._id
			})
		});

		for(let geo of convGeos) {
			geo.properties.geoset_owner = geoset._id;
		}

		let campaign = new Campaign({
			owner: data.owner,
			campaign_name: data.campaignObj.campaign_name,
			campaign_url: data.campaignObj.campaign_url,
			is_paid: false,
			is_active: false,
			mo_cost: data.campaignObj.monthly_cost,
			campaign_archetype: data.campaign_archetype,
			geosets: [geoset._id]
		});

		geoset.owner = campaign._id;

		try {
			await geoset.save();
			await campaign.save();
		} catch(err) {
			return reject(err);
		}


		for(let geo of convGeos) {
			try {
				await geo.save();
			} catch(err) {
				return reject(err);
			}
		}

		for(let billboard of billboards) {
			try {
				await billboard.save();
			} catch(err) {
				return reject(err);
			}
		}

		return resolve({campaignId: campaign._id});
	});
}
async function createFleetCampaign(data) {
	return new Promise(async (resolve, reject) => {
		let geofenceIds = [];
		let geosetIds = [];
		let campaignId = null;

		const {geoData} = data;

		//region Create Geosets
		for(let inGeoset of geoData) {
			let targetGeoId = null;
			let conversionGeoIds = [];

			//region Create Target Geofence
			const targetGeofenceData = {
				type: "Feature",
				properties: {
					geo_name: null
				},
				geometry: {
					type: "LineString",
					coordinates: inGeoset.target_geo
				}
			};

			try {
				const targetGeo = await createGeofence(targetGeofenceData);
				geofenceIds.push(targetGeo._id);
				targetGeoId = targetGeo._id;
				console.log("Created targetGeo", targetGeoId);
			} catch(err) {
				console.log(err);
				return reject({err: "CANT_CREATE_TARGET_GEO", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
			}
			//endregion

			//region Create Conversion Geofences
			for(let convGeo of inGeoset.conv_geos) {
				const conversionGeofenceData = {
					type: "Feature",
					properties: {
						geo_name: null
					},
					geometry: {
						type: "LineString",
						coordinates: convGeo
					}
				};

				try {
					const newConvGeo = await createGeofence(conversionGeofenceData);
					geofenceIds.push(newConvGeo._id);
					conversionGeoIds.push(newConvGeo._id);
					console.log("Created conversionGeo", newConvGeo._id);
				} catch(err) {
					console.log(err);
					return reject({err: "CANT_CREATE_CONVERSION_GEO", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
				}
			}
			//endregion

			//region Create Geoset
			const geosetData = {
				owner: data.campaignObj.owner,
				target_geo: targetGeoId,
				conv_geos: conversionGeoIds,
				max_imp: inGeoset.max_imp,
				mo_imp: inGeoset.mo_imp,
				freq: inGeoset.freq,
				vehicle_count: inGeoset.vehicle_count
			};

			try {
				const newGeoset = await createGeoset(geosetData);
				geofenceIds.push(newGeoset._id);
				geosetIds.push(newGeoset._id);
				console.log("Created geoset", newGeoset._id);
			} catch(err) {
				console.log(err);
				return reject({err: "CANT_CREATE_GEOSET", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
			}
			//endregion
		}
		//endregion

		//region Create Campaign
		const {campaignObj} = data;
		const campaignData = {
			owner: campaignObj.owner,
			campaign_name: campaignObj.campaign_name,
			campaign_url: campaignObj.campaign_url,
			utc_start: campaignObj.utc_start,
			utc_duration: campaignObj.utc_duration,
			is_paid: false,
			is_active: false,
			setup_cost: campaignObj.setup_cost,
			mo_cost: campaignObj.mo_cost,
			total_vehicles: campaignObj.total_vehicles,
			body_ad_type: campaignObj.body_type,
			window_ad_type: campaignObj.window_type,
			body_image_path: data.bodyImagePath,
			window_image_path: data.windowImagePath,
			campaign_archetype: data.campaign_archetype,
			geosets: geosetIds
		};


		try {
			const campaign = await createCampaign(campaignData);
			campaignId = campaign._id;
			console.log("Created new campaign", campaignId);
		} catch(err) {
			//TODO: ERROR LOGGING
			console.log(err);
			return reject({err: "CANT_CREATE_CAMPAIGN", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
		}

		//endregion

		return resolve({campaignId: campaignId});
	});
}
async function createAdvantageCampaign(data) {
	return new Promise(async (resolve, reject) => {
		let geofenceIds = [];
		let geosetIds = [];
		let campaignId = null;

		const {geoData} = data;

		//region Create Geosets
		for(let inGeoset of geoData) {
			let targetGeoId = null;
			let conversionGeoIds = [];

			//region Create Target Geofence
			const targetGeofenceData = {
				type: "Feature",
				properties: {
					geo_name: null
				},
				geometry: {
					type: "LineString",
					coordinates: inGeoset.target_geo
				}
			};

			try {
				const targetGeo = await createGeofence(targetGeofenceData);
				geofenceIds.push(targetGeo._id);
				targetGeoId = targetGeo._id;
				console.log("Created targetGeo", targetGeoId);
			} catch(err) {
				console.log(err);
				return reject({err: "CANT_CREATE_TARGET_GEO", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
			}
			//endregion

			//region Create Conversion Geofences
			for(let convGeo of inGeoset.conv_geos) {
				const conversionGeofenceData = {
					type: "Feature",
					properties: {
						geo_name: null
					},
					geometry: {
						type: "LineString",
						coordinates: convGeo
					}
				};

				try {
					const newConvGeo = await createGeofence(conversionGeofenceData);
					geofenceIds.push(newConvGeo._id);
					conversionGeoIds.push(newConvGeo._id);
					console.log("Created conversionGeo", newConvGeo._id);
				} catch(err) {
					console.log(err);
					return reject({err: "CANT_CREATE_CONVERSION_GEO", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
				}
			}
			//endregion

			//region Create Geoset
			const geosetData = {
				owner: data.campaignObj.owner,
				target_geo: targetGeoId,
				conv_geos: conversionGeoIds,
				max_imp: inGeoset.max_imp,
				mo_imp: inGeoset.mo_imp,
				freq: inGeoset.freq,
				vehicle_count: inGeoset.vehicle_count
			};

			try {
				const newGeoset = await createGeoset(geosetData);
				geofenceIds.push(newGeoset._id);
				geosetIds.push(newGeoset._id);
				console.log("Created new geoset", newGeoset._id);
			} catch(err) {
				console.log(err);
				return reject({err: "CANT_CREATE_GEOSET", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
			}
			//endregion
		}
		//endregion

		//region Create Campaign
		const {campaignObj} = data;
		const campaignData = {
			owner: campaignObj.owner,
			campaign_name: campaignObj.campaign_name,
			campaign_url: campaignObj.campaign_url,
			utc_start: campaignObj.utc_start,
			utc_duration: campaignObj.utc_duration,
			is_paid: false,
			is_active: false,
			setup_cost: campaignObj.setup_cost,
			mo_cost: campaignObj.mo_cost,
			total_vehicles: campaignObj.total_vehicles,
			body_ad_type: campaignObj.body_type,
			window_ad_type: campaignObj.window_type,
			body_image_path: data.bodyImagePath,
			window_image_path: data.windowImagePath,
			campaign_archetype: data.campaign_archetype,
			geosets: geosetIds
		};


		try {
			const campaign = await createCampaign(campaignData);
			campaignId = campaign._id;
			console.log("Created new campaign", campaignId);
		} catch(err) {
			//TODO: ERROR LOGGING
			console.log(err);
			return reject({err: "CANT_CREATE_CAMPAIGN", mongoose_err: err.err, code: err.code, data: {geofenceIds: geofenceIds, geosetIds: geosetIds}});
		}

		//endregion

		return resolve({campaignId: campaignId});
	});
}
async function createStripeCharge(requestBody) {
	return new Promise(async (resolve, reject) => {
		//region Create Customer
		let customerResult = null;
		try {
			customerResult = await Stripe.createCustomerFromSource({source: requestBody.stripeToken, email: requestBody.clientDoc.email})
		} catch(err) {
			console.log(err);
			return reject({code: 500, data: {errors: err}});
		}
		//endregion

		//region Save Customer Information to Client Document
		if(typeof requestBody.clientDoc.stripe_info == 'undefined' || !requestBody.clientDoc.stripe_info) {
			//TODO: MOVE THIS TO INITIALIZATION IN MAIN /create METHOD!!!
			requestBody.clientDoc.stripe_info = {
				customer: {},
				charges: []
			}
		}
		requestBody.clientDoc.stripe_info.customer = customerResult;
		try {
			await requestBody.clientDoc.save();
		} catch(err) {
			//TODO: THIS NEEDS TO BE BETTER
			console.log(err);
			return reject({code: 500, data: {errors: err, customerId: customerResult.id}});
		}
		//endregion

		//region Create the Charge

		let chargeResult = null;

		let setup_cost = requestBody.campaignObj.setup_cost;
		try {
			const chargeData = {
				amount: setup_cost,
				description: "ADDER - Campaign Setup for Campaign " + requestBody.campaignId,
				customer: requestBody.clientDoc.stripe_info.customer.id
			};
			chargeResult = await Stripe.createChargeFromCustomer(chargeData);
			console.log("Created stripe charge", chargeResult)
		} catch(err) {
			//TODO: THIS NEEDS TO BE BETTER
			console.log(err);
			return reject({err: 500, data: {errors: err, customerId: customerResult.id}});
		}
		//endregion

		return resolve(chargeResult);

	});
}
//endregion

//region UTILITY FUNCTIONS
function retrieveClient(id) {
	return new Promise((resolve, reject) => {
		Client.findOne({_id: id}, (err, client) => {
			if(err) {
				return reject({err: err, code: 500});
			}

			if(typeof client === 'undefined' || client === null) {
				return reject({err: "CLIENT_NOT_FOUND", code: 404});
			}

			return resolve(client);
		});
	});
}
function createGeofence(data) {
	return new Promise((resolve, reject) => {
		const clientGeofence = new ClientGeofence(data);
		clientGeofence.save(function(err, geo) {
			if(err) {
				return reject({err: err, code: 500});
			}

			return resolve(geo);
		});
	});
}
function createFixedPointGeofence(point) {
	return new Promise((resolve, reject) => {
		const fixedPoint = new ClientFixedPointGeofence(point);
		fixedPoint.save((err, geo) => {
			if(err) {
				return reject({err: err, code: 500});
			}
			return resolve(geo);
		})
	})
}
function createGeoset(inGeoset) {
	return new Promise((resolve, reject) => {
		const geoset = new Geoset(inGeoset);
		geoset.save((err, savedGeoset) => {
			if(err) {
				return reject({err: err, code: 500});
			}
			return resolve(savedGeoset);
		})
	})
}
function createCampaign(inCampaign) {
	return new Promise((resolve, reject) => {
		const campaign = new Campaign(inCampaign);
		campaign.save((err, savedCampaign) => {
			if(err) {
				return reject({err: err, code: 500});
			}

			return resolve(savedCampaign);
		})
	})
}
//endregion

//region ENDPOINTS UNDOCUMENTED
router.post('/create', passport.authenticate('ClientStrategy', {session: false}), upload.any(), async function(req, res, next) {
	// Create a campaign, attaching a reference to the client on the campaign, and to the campaign on the client

	//region General Input Validation
	let requestBody = JSON.parse(req.body.data);
	requestBody.owner = req.user._id;
	if(!requestBody) {
		res.status(HTTPStatusCodes.BAD_REQUEST).json({});
		return next(new Error(`Request missing body`));
	}

	if(!requestBody.owner) {
		res.status(HTTPStatusCodes.BAD_REQUEST).json({});
		return next(new Error(`req.user did not contain _id field!`));
	}

	if(typeof requestBody.campaign_archetype === "undefined" || !requestBody.campaign_archetype) {
		res.status(HTTPStatusCodes.BAD_REQUEST).json({});
		return next(new Error(`request body missing campaign_archetype!`));
	}

	if(requestBody.campaign_archetype !== "Billboard" && requestBody.campaign_archetype !== "Advantage" && requestBody.campaign_archetype !== "Fleet") {
		res.status(HTTPStatusCodes.BAD_REQUEST).json({});
		return next(new Error(`campaign_archetype has invalid value.`));
	}

	if(!requestBody.campaignObj) {
		res.status(HTTPStatusCodes.BAD_REQUEST).json({});
		return next(new Error(`request body missing campaignObj`));
	}

	if(!requestBody.geoData) {
		res.status(HTTPStatusCodes.BAD_REQUEST).json({});
		return next(new Error(`request body missing geoData`));
	}
	//endregion

	//region Initialize Variables and Retrieve Database Entries
	const {owner, campaign_archetype, campaignObj} = requestBody;
	let clientDoc = null;

	try {
		clientDoc = await retrieveClient(owner);
	} catch(err) {
		console.log(err);
		return res.status(500).end();
	}

	if(!clientDoc) {
		return res.status(404).end();
	}

	requestBody.clientDoc = clientDoc;
	//endregion

	//region Create Geofences, Geosets, and Campaign
	let campaignCreationResult = null;
	if(campaign_archetype === "Billboard") {
		try {
			campaignCreationResult = await createBillboardCampaign(requestBody);
		} catch(err) {
			//TODO: WE NEED TO ROLLBACK DOCS HERE
			console.log(err);
			return res.status(err.code).end();
		}
	} else if(campaign_archetype === "Advantage") {
		try {
			requestBody.bodyImagePath = req.bodyImagePath;
			requestBody.windowImagePath = req.windowImagePath;
			campaignCreationResult = await createAdvantageCampaign(requestBody);
		} catch(err) {
			//TODO: WE NEED TO ROLLBACK DOCS HERE
			console.log(err);
			return res.status(err.code).end();
		}
	} else if(campaign_archetype === "Fleet") {
		try {
			requestBody.bodyImagePath = req.bodyImagePath;
			requestBody.windowImagePath = req.windowImagePath;
			campaignCreationResult = await createFleetCampaign(requestBody);
		} catch(err) {
			//TODO: WE NEED TO ROLLBACK DOCS HERE
			console.log(err);
			return res.status(err.code).end();
		}
	}
	//endregion

	//TODO: DOUBLE CHECK THIS ONCE BILLBOARD LOGIC HAS BEEN UPDATED, ENSURE CAMPAIGN CREATION RESULT IS NOT NULL
	const campaignId = campaignCreationResult.campaignId;
	requestBody.clientDoc = clientDoc;
	requestBody.campaignId = campaignId;
	let chargeResult = null;
	//region Create Charge If Needed
	console.log(campaignObj);
	if(campaignObj.setup_cost !== 0) {
		try {
			chargeResult = await createStripeCharge(requestBody);
			let chargesArr = requestBody.clientDoc.stripe_info.charges;
			if(typeof chargesArr === 'undefined' || !chargesArr) {
				chargesArr = [];
			}

			//TODO: CHECK AND MAKE SURE CHARGE RESULT IS NOT NULL!!!
			chargesArr.push(chargeResult.charge.id);
			requestBody.clientDoc.stripe_info.charges = chargesArr;
			try {
				await requestBody.clientDoc.save();
			} catch(err) {
				//TODO: HANDLE ERROR
				console.log(err);
				return res.status(200).end();
			}
		} catch(err) {
			//TODO: CONFIRM NO STRIPE CHARGE WAS MADE!!!!!
			console.log(err);
			return res.status(err.code).end();
		}
	} else {
		console.log("campaignObj.setup_cost was 0, no charge will be created.", campaignObj.setup_cost);
	}
	console.log("in endpoint, chargeResult was", chargeResult);
	//endregion

	//region Update Campaign Object is_paid

	console.log("campaignID", campaignId);
	try {
		const campaign = await Campaign.findOne({_id: campaignId});
		campaign.is_paid = true;
		await campaign.save();
	} catch(err) {
		//TODO: ERROR HANDLING
		console.log(err);
		return res.status(200).end();
	}
	//endregion

	//TODO: CREATE NOTIFICATION

	return res.status(200).end();

});
router.use('/', passport.authenticate('jwt', {session: false}), function(req, res, next) {
	next();
});
router.get('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
// Get a particular campaign and all associated data by the campaign id (this is Mongo's autogenerated id, not adder human-readable id)
	const campaignId = String(req.params.id);
	if(campaignId.length !== 24) {
		return res.status(400).send({success: false, err: "Invalid cId"});
	}

	Campaign.find({_id: campaignId}, function(err, doc) {
		if(err) {
			return res.status(500).send({success: false, err: err});
		}

		return res.status(200).send({success: true, campaign : doc})
	});
});
router.get('/client/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
	// Get all campaigns belonging to a certain client id
	// id is the _id of the client





});
//endregion


module.exports = router;
