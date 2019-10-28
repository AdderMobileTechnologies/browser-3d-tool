// config.js
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  NODEMAILER_SMTP_HOST: process.env.NODEMAILER_SMTP_HOST,
  NODEMAILER_SMTP_PORT: process.env.NODEMAILER_SMTP_PORT,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS,
  META_URL: process.env.META_URL,
  API_URL: process.env.API_URL
};
