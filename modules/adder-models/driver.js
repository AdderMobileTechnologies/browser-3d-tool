require("dotenv").config();
const mongoose = require('mongoose');
const Schema = require("mongoose").Schema;

const DriversConnection = mongoose.createConnection(process.env.PORTAL_DB_HOST + '/UsersDB?authSource=admin', {
	useNewUrlParser: true,
	useCreateIndex: true,
	user: String(process.env.PORTAL_DB_USER),
	pass: String(process.env.PORTAL_DB_PASS)
});

const VehicleSchema = new Schema({
	year: {
		type: String,
	},
	make: {
		type: String,
	},
	model: {
		type: String,
	},
	vtrim: {
		type: String,
	},
	notes: {
		type: String,
	},
	mobile_pic_path: {
		type: String,
	}
}, {
	_id: false
});

const InsuranceSchema = new Schema({
	carrier: {
		type: String,
	},
	policy: {
		type: String,
	}
}, {
	_id: false
});

const LicenseSchema = new Schema({
	number: {
		type: String,
	},
	state: {
		type: String,
	},
	expiration: {
		type: String,
	},
	mobile_pic_path: {
		type: String,
	}
}, {
	_id: false
});

const CurrentMilesSchema = {
	day: {
		type: Number,
	},
	week: {
		type: Number,
	},
	month: {
		type: Number,
	}
};

const MileResetDates = {
	day: {
		type: Number,
	},
	week: {
		type: Number,
	},
	month: {
		type: Number,
	}
};

const DriverSchema = new Schema({
	device_id: {
		type: String,
		unique: true,
	},
	email: {
		type: String,
		unique: true,
	},
	first_name: {
		type: String,
	},
	last_name: {
		type: String,
	},
	street_address: {
		type: String,
	},
	city: {
		type: String,
	},
	state: {
		type: String,
	},
	zip: {
		type: String,
	},
	mobile_pic_path: {
		type: String,
	},
	current_campaign: {
		type: String,
		default: null
	},
	vehicle: {
		type: VehicleSchema,
	},
	insurance: {
		type: InsuranceSchema,
	},
	license: {
		type: LicenseSchema,
		required: false
	},
	current_miles: {
		type: CurrentMilesSchema,
		required: false
	},
	mile_reset_dates: {
		type: MileResetDates,
		required: false
	},
	phone_number: {
		type: String,
		required: false,
		default: ""
	}
}, {
	collection: "Drivers"
});

module.exports = DriversConnection.model("Drivers", DriverSchema);
