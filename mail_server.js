var nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "no-reply@addermobile.com",
    pass: "Sharedacces$1"
  }
});

var mailOptions = {
  from: "from@example.com",
  to: "b.forte@addermobile.com",
  subject: "Wrap Plug Image",

  html: "<h1>Attachments</h1>",
  attachments: [
    {
      // utf-8 string as an attachment
      filename: "mail_test.txt",
      content: "Attachments"
    },
    {
      filename: "logo",
      path: "public/logo512.png"
    }
  ]
};

transport.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log("Email sent: " + info.response);
});
/*
NODEMAILER_SMTP_HOST=smtp.gmail.com
NODEMAILER_SMTP_PORT=465
NODEMAILER_USER=no-reply@addermobile.com
NODEMAILER_PASS=Sharedacces$1
*/
