const nodemailer = require("nodemailer");
require("dotenv").config();
const emailHTML = require('./nodemailer.text');
const user = process.env.EMAIL;
const password = process.env.SMTP_PASSWORD;

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: user,
        pass: password,
    },
    port: 465,
    tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
    }
});

exports.sendConfirmationEmail = async (email, invoiceData) => {
    return await transport.sendMail({
        from: user,
        to: email,
        subject: "Invoice as requested from Atlantis Ltd.",
        html: emailHTML(invoiceData),
    }).catch(err => console.log(err));
};