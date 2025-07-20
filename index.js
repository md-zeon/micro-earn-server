const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();
		const microEarnDB = client.db("microEarnDB");
		const usersCollection = microEarnDB.collection("users");

		// Add New User
		app.post("/user", async (req, res) => {
			const userData = req.body;
			userData.role = userData?.role || "Worker";
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

            console.log("Creating New User...");
            const result = await usersCollection.insertOne(userData);
            console.log("User Created Successfully!");
            res.send(result);
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
