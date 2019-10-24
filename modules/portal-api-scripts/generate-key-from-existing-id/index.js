require("dotenv").config();
const args = require("minimist")(process.argv.slice(2));
const jwt = require('jwt-simple');

async function main() {
    //region Exit if .env File Is Not Configured
    if(process.env.ROOT_DIR === undefined || process.env.ROOT_DIR === null || process.cwd() !== process.env.ROOT_DIR) {
        console.error("Please run this script from project root directory.");
        return false;
    }
    if(process.env.JWT_SIGNING_KEY === undefined || process.env.JWT_SIGNING_KEY === null) {
        console.error("Please specify the signing key in the .env file as JWT_ENCODE_KEY.");
        return false;
    }
    //endregion

    //region Initialize
    let { id } = args;

    if(!id) {
        console.error("Must specify _id of account to create JWT token for with --id");
        return false;
    }
    //endregion

    let token = jwt.encode({
        id: id
    }, process.env.JWT_SIGNING_KEY);

    console.log(`JWT Token is:\n\t\t${token}`);

    return true;
}

main().then(async () => {
    console.log("Do it to it homie, never give up. -B");
}).catch(async (err) => {
    console.error(err);
});
