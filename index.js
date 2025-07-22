const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

// Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
	cors({
		origin: "http://localhost:5173", // frontend URL
		credentials: true, // allow cookies and auth headers
	}),
);
app.use(express.json());

// Firebase

const decodedKey = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString("utf-8");

// var serviceAccount = require("./microEarnServiceAccountKey.json");
var serviceAccount = JSON.parse(decodedKey);
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

const verifyFirebaseToken = async (req, res, next) => {
	const authHeader = req.headers?.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).send({ message: "Unauthorized access" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const decoded = await getAuth().verifyIdToken(token);
		req.decoded = decoded;
		next();
	} catch (err) {
		return res.status(401).send({ message: "Unauthorized access" });
	}
};

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const microEarnDB = client.db("microEarnDB");
		const usersCollection = microEarnDB.collection("users");
		const tasksCollection = microEarnDB.collection("tasks");

		const verifyBuyer = async (req, res, next) => {
			try {
				const userEmail = req.decoded?.email;
				const user = await usersCollection.findOne({ email: userEmail });
				if (!user || user.role !== "buyer") {
					return res.status(403).send({ message: "Forbidden: Buyer access only" });
				}
				next();
			} catch (error) {
				console.error("verifyBuyer error:", error);
				res.status(500).send({ message: "Internal Server Error" });
			}
		};

		// Add New User
		app.post("/user", async (req, res) => {
			const userData = req.body;
			userData.role = userData?.role || "worker";
			userData.createdAt = new Date().toISOString();
			userData.lastLoggedInAt = new Date().toISOString();
			const query = { email: userData?.email };
			const userExists = await usersCollection.findOne(query);
			console.log("Does User Exist? ", !!userExists ? "Yes" : "No");
			if (!!userExists) {
				const result = await usersCollection.updateOne(query, {
					$set: {
						lastLoggedInAt: new Date().toISOString(),
					},
				});
				console.log("updated User Last Login Time");
				return res.send(result);
			}

			userData.microCoins = userData?.role === "worker" ? 10 : 50;
			console.log("Creating New User...");
			const result = await usersCollection.insertOne(userData);
			console.log("User Created Successfully!");
			res.send(result);
		});

		// get user role
		app.get("/user/role", verifyFirebaseToken, async (req, res) => {
			const email = req.decoded.email;
			if (!email) {
				return res.status(403).send({ message: "Forbidden access" });
			}
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			if (!user) {
				return res.status(404).send({ message: "User Not Found" });
			}
			res.send({ role: user?.role });
		});

		// get available Coins
		app.get("/available-coins", verifyFirebaseToken, async (req, res) => {
			const email = req.decoded.email;
			if (!email) {
				return res.status(403).send({ message: "Forbidden access" });
			}
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			if (!user) {
				return res.status(404).send({ message: "User Not Found" });
			}
			res.send({ microCoins: user?.microCoins });
		});

		// Update Micro Coins (increase/decrease)
		app.patch("/update-coins", verifyFirebaseToken, async (req, res) => {
			const email = req.decoded.email;
			const { coinsToUpdate, status } = req.body;
			const filter = { email: email };
			const updateDoc = {
				$inc: {
					microCoins: status === "decrease" ? -coinsToUpdate : coinsToUpdate,
				},
			};
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		// Create New Task (Buyer)
		app.post("/tasks", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			try {
				const newTask = req.body;
				console.log("New Task Payload:", newTask);
				newTask.createdAt = new Date().toISOString();
				newTask.status = "active";
				const result = await tasksCollection.insertOne(newTask);
				console.log("Task created successfully:", result);
				res.send(result);
			} catch (err) {
				console.log("Error creating task:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// GET buyer's tasks (sorted by deadline DESC)
		app.get("/my-tasks", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			const email = req.decoded?.email;
			const tasks = await tasksCollection.find({ buyer_email: email }).sort({ completion_deadline: -1 }).toArray();
			res.send(tasks);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

// Basic route
app.get("/", (req, res) => {
	res.send("MicroEarn Server is running...");
});

// Start server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
