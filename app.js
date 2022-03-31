require("dotenv").config()
const Express = require("express");
var app = Express();
const BodyParser = require("body-parser");
const cors = require("cors");

/**
 * Helmet to set http headers for routes thus prevent injection
 */
const helmet = require("helmet");
app.use(helmet());

/**
 * Request rate limiting
 */
const expressRateLimit = require("express-rate-limit");
const limiter = expressRateLimit({
    windowMs: 10 * 60 * 1000, // 2 mins
    max: 500, // No of Requests
});
app.use(limiter);

/**
 * Prevent access of any hidden info if api is exposed
 */
const hpp = require("hpp");
app.use(hpp());

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var database;

app.use(cors());
// Enabling Cross Origin Resource  Sharing
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

app.post("/sendSMS", (req, res, next) => {
    if (!req.body.message)
        return res.status(400).send({ message: "A message is required" });
    if (!req.body.receiver) {
        return res.status(400).send({ message: "A receiver is required" });
    }
    const receiver = req.body.receiver;
    const sender = process.env.TILIO_PHONE_NUMBER;
    const message = req.body.message;

    client.messages
        .create({ body: message, from: sender, to: receiver })
        .then(messageRes => res.status(200).send({ message: "Message successfully sent", data: messageRes }))
        .then(messageRes => next())
        .catch(err => { res.status(500).send({ message: "An internal server error has occured", error: err.message }) })
});

// firebase cloud messaging
require('./cloud-messaging').sendCloudMessage(app);
require('./cloud-messaging').sendToAll(app);

//nodemailer
const sendConfirmationEmail = require('./nodemailer.config').sendConfirmationEmail;
app.post("/sendMail", (req, res, next) => {
    const invoiceData = req.body.invoiceData;
    const receiver = req.body.receiver;
    if (!invoiceData || !receiver)
        return res.status(400).send(({ message: 'All fields are required!!' }));

    return sendConfirmationEmail(receiver, invoiceData)
        .then(response => {
            res.status(200).send({ message: 'Email successfully sent' });
            next();
        })
        .catch(err => {
            res.status(400).send({
                message: 'An error has occured during the operation',
                error: err.message
            });
            console.log(err);
        });
});

app.listen(process.env.PORT || 5000);