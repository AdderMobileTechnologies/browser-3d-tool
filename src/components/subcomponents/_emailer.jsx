import React from "react";

//import "./EMailer.css";
/**
 * Purpose:
 * This EMailer should handle callbacks that are sent to it without choking , while not being a true React.Component.
 * I also need it to detect an 'event' and send back the e.target ...etc..
 */
/*
Call This EMailer Like This:
<EMailer
  callback={this.subCallback}
  data={{ key: "value" }}
></EMailer>;

...and the subCallback function looks like this...

  subCallback(args) {
    console.log("subCallback with args:", args);
  }
  
*/

import * as K from "../../constants";
import axios from "axios";

export default function EMailer(props) {
  console.log("THE EMailer: props:", props);

  const sendEmail = () => {
    let promise_designOptions = new Promise(function(resolve, reject) {
      const url = `${K.META_URL}/email/send`;
      axios
        .post(url)
        .then(response => response.data)
        .then(data => {
          resolve(data);
        });
    });
    promise_designOptions.then(function(value) {
      console.log("value in promise response:", value);
    });
  };

  const handleEMailerClick = e => {
    console.log("handleEMailerClick .....");
    console.log("e.target.id = ", e.target.id);
    console.log("e.target.name =", e.target.name);
    console.log("props sent in during constructor:", props);
    let returnData = { id: e.target.id, name: e.target.name };
    sendEmail();
    props.callback(returnData);
  };

  return (
    <div>
      <button
        id="buttonLeft"
        name={props.data["key"]}
        onClick={handleEMailerClick}
      >
        Click
      </button>
    </div>
  );
}
/*
 let url = process.env.PORTAL_API_HOST + '/auth/email-verification/' + res.locals.verificationToken;
    let mailOptions = {
        from: 'Do Not Reply <no-reply@addermobile.com>',
        to: res.locals.email,
        subject: 'Adder Account Verification.',
        html: 'Please click the following link to confirm your account: </p><p>' + url + '</p>',
        text: 'Please confirm your account by clicking the following link: ' + url
    };
    const nodemailerOptions = {
        host: process.env.NODEMAILER_SMTP_HOST,
        port: Number(process.env.NODEMAILER_SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    };

    res.locals.logger.debug("In _flowUserDoesNotExist(), before nodemailer send, res.locals.requestWasCancelled:" +
        " " + res.locals.requestWasCancelled);
    if(res.locals.requestWasCancelled) {
        return next("CONNECTION_CLOSED");
    }
    let transporter = nodemailer.createTransport(nodemailerOptions);
    let transporterPromise = new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return reject(err);
            }

            return resolve(info);
        });
    });

    try {
        res.locals.logger.info("Sending verification email.");
        await transporterPromise;
        res.locals.logger.info("Successfully sent verification email!");
    } catch(err) {
        res.locals.logger.error("An error occurred while waiting for verification email to send! Error was: " + JSON.stringify(err, null, 4));
        res.locals.code = 500;
        res.locals.response = {};
        return next("NODEMAILER_TRANSPORT_FAILURE");
    }
    */
