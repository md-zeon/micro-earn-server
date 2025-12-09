const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require(".");
const uri = config.mongodb_uri;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

const connectDB = async () => {
	try {
		await client.connect();
		console.log("MongoDB Connected Successfully");
	} catch (error) {
		console.error("MongoDB Connection Failed:", error);
	}
};

// Database & Collections
const db = client.db("microEarnDB");
const usersCollection = db.collection("users");
const tasksCollection = db.collection("tasks");
const submissionsCollection = db.collection("submissions");
const paymentsCollection = db.collection("payments");
const withdrawalsCollection = db.collection("withdrawals");
const notificationsCollection = db.collection("notifications");

module.exports = {
	connectDB,
	db,
	usersCollection,
	tasksCollection,
	submissionsCollection,
	paymentsCollection,
	withdrawalsCollection,
	notificationsCollection,
};
