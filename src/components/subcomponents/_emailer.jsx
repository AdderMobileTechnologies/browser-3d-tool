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
import { tsConstructorType } from "@babel/types";
// https://nodemailer.com/message/attachments/
export default function EMailer(props) {
  console.log("THE EMailer: props:", props);

  const sendEmail = data => {
    let promise_designOptions = new Promise(function(resolve, reject) {
      const url = `${K.META_URL}/email/send`;

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
          placeholder="b.forte@addermobile.com"
          value="b.forte@addermobile.com"
        ></input>
        <input
          id="email_subject"
          type="text"
          name="email_subject"
          placeholder="email subject is ..."
        ></input>
        {/** 
        TODO: 
        get a data url like the download button does.
        save_UIAction put current canvas into a var so the latest can always be sent.
        Then make sure this third input is getting added to the post parameters 
        and handled in api. */}
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
 */
