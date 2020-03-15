// IMPORT MODULES
const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create transporter
  /* //GMAIL OPTION
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD
        }

        //Active the "less secure app" option in gmail
    }) */

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Define the email options
  const mailOptions = {
    from: 'Natours Support <support@zach.io',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send email with nodemailer
  await transporter.sendMail(mailOptions);
};

//Export this module
module.exports = sendEmail;
