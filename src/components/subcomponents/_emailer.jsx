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
//.env fix
import axios from "axios";
import { tsConstructorType } from "@babel/types";
// https://nodemailer.com/message/attachments/
export default function EMailer(props) {
  console.log("THE EMailer: props:", props);

  const sendEmail = data => {
    let promise_designOptions = new Promise(function(resolve, reject) {
      const url = `${K.META_URL}/v1/email/send`;
      console.log("_emailer.jsx:sendEmail():data:", data);
      localStorage.setItem("email data:", JSON.stringify(data));
      let params = {
        from: "hardcoded-in-server",
        to: data.email_to,
        subject: data.email_subject,

        html: `<h1>Adder 3dTool</h1><p>Visualize your advertisement.</p> `,
        attachments: [
          {
            path: data.dataURL
          }
        ]
      };

      axios
        .post(url, params)
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
    let returnData = {
      id: e.target.id,
      email_to: e.target.parentNode[0].value,
      email_subject: e.target.parentNode[1].value,
      dataURL: e.target.parentNode[2].value
    };
    sendEmail(returnData);
    console.log(returnData);
    props.callback(returnData);
  };

  return (
    <div>
      <form id="EMAIL_FORM">
        <input
          id="email_to"
          type="text"
          name="to"
          placeholder="john.doe@anonymous.com"
        ></input>
        <input
          id="email_subject"
          type="text"
          name="email_subject"
          placeholder="email subject is ..."
        ></input>
        <input type="hidden" value={props.currentDataURL} />

        <button
          id="buttonLeft"
          name={props.data["key"]}
          onClick={handleEMailerClick}
        >
          Click
        </button>
      </form>
    </div>
  );
}

/*
Almost there , only problem is that the last action applied to the image is missing from the dataURL.....? 
missing the last angle of the camera as well ? 
BUG: I do not like the fact that the page refreshes after sending the email. 
at the very least it needs a dialog to alert the user to the fact.


What needs to happen: 
I would want the user to be able to send an email and keep everything as it already is , so the user can keep on working on it if they choose to. 
If we have to we can store the actions temporarily and then rebuild the scene for them after they send the email and the page refreshes. 
Also, clicking the share button makes the email form appear, it also sets the 'latest on screen design' to the dataURL for the email. 
If it stays up for a while, and the user makes changes again before sending the email, the latest changes might not get added/updated to the dataURL.



 */
