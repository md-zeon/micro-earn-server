const admin = require("firebase-admin");
const config = require(".");

const decodedKey = Buffer.from(config.fb_service_key, "base64").toString(
	"utf-8",
);

// var serviceAccount = require("./microEarnServiceAccountKey.json");
var serviceAccount = JSON.parse(decodedKey);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
