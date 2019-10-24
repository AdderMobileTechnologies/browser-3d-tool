require("dotenv").config();
const args = require("minimist")(process.argv.slice(2));
const md5 = require("md5");
const jwt = require('jwt-simple');
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
const APIKey = require("adder-models").APIKey;

let __id;
let __description;
let __authorized;

//region Exit If Not In Project Root Directory
if(process.env.ROOT_DIR === undefined || process.env.ROOT_DIR === null || process.cwd() !== process.env.ROOT_DIR) {
  console.error("Please run this script from project root directory.");
  process.exit(-1);
}
//endregion

let { id, description, authorized, unauthorized } = args;

//region Generate the Hash
if(typeof id === "string") {
  console.log(`--id was specified, generating with id ${id}`);
  __id = id;
} else {
  console.log(`--id was not specified, generating with random md5.`);
  const uuid = require("uuid/v4")();
  __id = md5(String(uuid), null);
}
//endregion

//region Initialize Description
if(typeof description !== "string") {
  console.error(`Please provide a description for this key with the --description flag.`);
  process.exit(1);
}

__description = description;
//endregion

//region Initialize Authorization
if(typeof authorized === "boolean") {
  console.log("This API Key will be authorized by default.");
  __authorized = true;
} else if(typeof unauthorized === "boolean") {
  console.log("This API Key will be unauthorized by default.");
  __authorized = false;
} else {
  console.error(`Please specify if this key should be authorized or unauthorized with --authorized or --unauthorized`);
  process.exit(1);
}
//endregion

const apiKey = new APIKey({
  _id: __id,
  description: __description,
  authorized: __authorized,
  endpoints: []
});

readline.question(`Create the following API Key? (YES to confirm):\n${JSON.stringify(apiKey, null, 4)}`, (answer) => {
  if(answer !== "YES") {
    console.log("Non-YES answer has been provided. Exiting.");
    return process.exit(0);
  }

  // noinspection JSUnresolvedFunction
  apiKey.save(function (err, newKey) {
    if (err) {
      console.err(err);
      return process.exit(1);
    }

    const token = jwt.encode(newKey._id, process.env.JWT_SIGNING_KEY);
    console.log(`New key has been created. JWT is: ${token}`);
    process.exit(0);
  });
});



