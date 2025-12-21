const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = async (options) => {
    // 1) Create a transporter
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MT_USERNAME,
            pass: process.env.MT_PASSWORD
        }
    });

    // 2) Define email options
    const mailOptions = {
        from: 'Natours - Udemy <lirangamerz@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: later on :)

    }
    // 3) Send the email
    await transport.sendMail(mailOptions)
}
module.exports = sendEmail