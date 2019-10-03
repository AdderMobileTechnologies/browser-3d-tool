// config.js
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  NODEMAILER_SMTP_HOST: process.env.NODEMAILER_SMTP_HOST,
  NODEMAILER_SMTP_PORT: process.env.NODEMAILER_SMTP_PORT,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS
};
/*
 endpoint: process.env.API_URL,
  masterKey: process.env.API_KEY,
  port: process.env.PORT
  */
/*
 NODEMAILER_SMTP_HOST=smtp.gmail.com
NODEMAILER_SMTP_PORT=465
NODEMAILER_USER=no-reply@addermobile.com
NODEMAILER_PASS=Sharedacces$1
*/
