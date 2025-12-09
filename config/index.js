const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
	path: path.join(process.cwd(), ".env"),
});

const config = {
	port: process.env.PORT || 3000,
	stripe_secret_key: process.env.STRIPE_SECRET_KEY,
	fb_service_key: process.env.FB_SERVICE_KEY,
	mongodb_uri: process.env.MONGODB_URI,
};

module.exports = config;
