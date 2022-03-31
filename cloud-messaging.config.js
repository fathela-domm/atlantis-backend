var admin = require("firebase-admin");
var serviceAccount = require("./codify-io-firebase-admin-service-account.json");
require('dotenv').config();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.databaseURL,
})

module.exports = admin;