const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
		const paymentsCollection = microEarnDB.collection("payments");
		const submissionsCollection = microEarnDB.collection("submissions");
		const withdrawalsCollection = microEarnDB.collection("withdrawals");

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

		const verifyWorker = async (req, res, next) => {
			try {
				const userEmail = req.decoded?.email;
				const user = await usersCollection.findOne({ email: userEmail });
				if (!user || user.role !== "worker") {
					return res.status(403).send({ message: "Forbidden: Worker access only" });
				}
				next();
			} catch (error) {
				console.error("verifyWorker error:", error);
				res.status(500).send({ message: "Internal Server Error" });
			}
		};

		const verifyAdmin = async (req, res, next) => {
			try {
				const userEmail = req.decoded?.email;
				const user = await usersCollection.findOne({ email: userEmail });
				if (!user || user.role !== "admin") {
					return res.status(403).send({ message: "Forbidden: Admin access only" });
				}
				next();
			} catch (error) {
				console.error("verifyAdmin error:", error);
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
		app.patch("/update-coins/:email", verifyFirebaseToken, async (req, res) => {
			const email = req.params.email;
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
				newTask.total_workers = newTask?.required_workers;
				newTask.createdAt = new Date().toISOString();
				newTask.updatedAt = new Date().toISOString();
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
			const tasks = await tasksCollection.find({ posted_by: email }).sort({ completion_deadline: -1 }).toArray();
			res.send(tasks);
		});

		// Delete Task
		app.delete("/tasks/:id", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			try {
				const taskId = req.params.id;
				const query = { _id: new ObjectId(taskId) };
				const task = await tasksCollection.findOne(query);
				if (!task) {
					return res.status(404).send({ message: "Task not found!" });
				}
				const result = await tasksCollection.deleteOne(query);
				res.send(result);
			} catch (err) {
				console.error("Delete Task Error:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Update Task
		app.patch("/tasks/:id", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			try {
				const taskId = req.params.id;
				const updates = req.body;
				const filter = { _id: new ObjectId(taskId) };
				const task = await tasksCollection.findOne(filter);
				if (!task) {
					return res.status(404).send({ message: "Task not found!" });
				}
				const updateDoc = {
					$set: {
						task_title: updates.task_title,
						task_detail: updates.task_detail,
						submission_info: updates.submission_info,
						updatedAt: new Date().toISOString(),
					},
				};

				const result = await tasksCollection.updateOne(filter, updateDoc);
				res.send(result);
			} catch (err) {
				console.error("Update Task Error:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Payment Intent
		app.post("/create-payment-intent", verifyFirebaseToken, async (req, res) => {
			const { amount } = req.body;
			const paymentAmount = parseInt(amount * 100);
			try {
				const paymentIntent = await stripe.paymentIntents.create({
					amount: paymentAmount,
					currency: "usd",
					payment_method_types: ["card"],
				});
				res.send({
					clientSecret: paymentIntent.client_secret,
				});
			} catch (error) {
				console.error("Error creating payment intent:", error);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Save payment info
		app.post("/payments", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			try {
				const paymentData = req.body;
				paymentData.createdAt = new Date().toISOString();
				const result = await paymentsCollection.insertOne(paymentData);
				res.send(result);
			} catch (error) {
				console.error("Error saving payment:", error);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// get All Payments
		app.get("/payments", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			const email = req.decoded?.email;
			const payments = await paymentsCollection.find({ buyer_email: email }).sort({ payment_date: -1 }).toArray();
			res.send(payments);
		});

		// Worker Routes
		app.get("/tasks-for-worker", verifyFirebaseToken, verifyWorker, async (req, res) => {
			try {
				const tasks = await tasksCollection.find({ required_workers: { $gt: 0 } }).toArray();
				res.send(tasks);
			} catch (err) {
				console.error("Error fetching tasks for worker:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Get single task by ID
		app.get("/tasks/:id", verifyFirebaseToken, async (req, res) => {
			try {
				const taskId = req.params.id;
				const query = { _id: new ObjectId(taskId) };
				const task = await tasksCollection.findOne(query);
				if (!task) {
					return res.status(404).send({ message: "Task not found!" });
				}
				res.send(task);
			} catch (err) {
				console.error("Error fetching single task:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Submit Task (Worker)
		app.post("/submissions", verifyFirebaseToken, verifyWorker, async (req, res) => {
			try {
				const newSubmission = req.body;
				console.log("New Submission Payload:", newSubmission);
				newSubmission.updatedAt = new Date().toISOString();
				newSubmission.status = "pending";
				// Insert the submission
				const result = await submissionsCollection.insertOne(newSubmission);
				res.send(result);
			} catch (err) {
				console.error("Error saving submission:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Update Workers (increase/decrease)
		app.patch("/update-workers/:id", verifyFirebaseToken, async (req, res) => {
			const taskId = req.params.id;
			const { status } = req.body;
			const filter = { _id: new ObjectId(taskId) };
			const updateDoc = {
				$inc: {
					required_workers: status === "decrease" ? -1 : 1,
				},
			};
			const result = await tasksCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		// Get submissions (Worker)
		app.get("/submissions", verifyFirebaseToken, verifyWorker, async (req, res) => {
			try {
				const worker_email = req.decoded?.email;
				const query = { worker_email };
				const result = await submissionsCollection.find(query).toArray();
				res.send(result);
			} catch (err) {
				console.error("Error fetching submissions:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Create New WithDrawal
		app.post("/withdrawals", verifyFirebaseToken, verifyWorker, async (req, res) => {
			try {
				const newWithdrawal = req.body;
				console.log("New Withdrawal Payload:", newWithdrawal);
				newWithdrawal.status = "pending";
				// Insert the withdrawal
				const result = await withdrawalsCollection.insertOne(newWithdrawal);
				res.send(result);
			} catch (err) {
				console.error("Error saving withdrawal:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Get Withdrawals
		app.get("/withdrawals", verifyFirebaseToken, verifyWorker, async (req, res) => {
			try {
				const worker_email = req.decoded?.email;
				const query = { worker_email };
				const result = await withdrawalsCollection.find(query).toArray();
				res.send(result);
			} catch (err) {
				console.error("Error fetching withdrawals:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// accept / reject submissions
		app.patch("/submissions/status-update", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			try {
				const { submissionId, status } = req.body;
				const filter = { _id: new ObjectId(submissionId) };
				const result = await submissionsCollection.updateOne(filter, {
					$set: {
						status: status,
						updatedAt: new Date().toISOString(),
					},
				});

				res.send({ result });
			} catch (err) {
				console.error("Reject Submission Error:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		// Get all submissions for a buyer's tasks
		app.get("/buyer-submissions", verifyFirebaseToken, verifyBuyer, async (req, res) => {
			try {
				const email = req.decoded?.email;
				const result = await submissionsCollection.find({ buyer_email: email }).toArray();
				res.send(result);
			} catch (err) {
				console.error("Error fetching buyer submissions:", err);
				res.status(500).send({ message: "Internal Server Error" });
			}
		});

		app.get("/admin/stats", verifyFirebaseToken, verifyAdmin, async (req, res) => {
			const workers = await usersCollection.countDocuments({ role: "worker" });
			const buyers = await usersCollection.countDocuments({ role: "buyer" });
			const allUsers = await usersCollection.find().toArray();
			const totalCoins = allUsers.reduce((sum, u) => sum + (u.microCoins || 0), 0);
			const payments = await paymentsCollection.find().toArray();
			const totalPayments = payments.reduce((sum, p) => sum + p.amount_paid, 0);

			res.send({ totalWorkers: workers, totalBuyers: buyers, totalCoins, totalPayments });
		});

		// GET /admin/withdraw-requests
		app.get("/admin/withdraw-requests", verifyFirebaseToken, verifyAdmin, async (req, res) => {
			try {
				const requests = await withdrawalsCollection
					.find({ status: "pending" })
					.sort({ withdraw_date: -1 })
					.toArray();
				res.send(requests);
			} catch (err) {
				res.status(500).send({ message: "Failed to load withdraw requests" });
			}
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
