const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/mongodb");
const userRoutes = require("./modules/user/user.routes");
const tasksRoutes = require("./modules/tasks/tasks.routes");
const paymentsRoutes = require("./modules/payments/payments.routes");
const submissionRoutes = require("./modules/submissions/submissions.routes");
const withdrawalsRoutes = require("./modules/withdrawals/withdrawals.routes");
const statisticsRoutes = require("./modules/statistics/statistics.routes");
const notificationsRoutes = require("./modules/notifications/notifications.routes");
const config = require("./config");
const app = express();
require("./config/firebase");
require("./config/stripe");

// Middleware
app.use(cors());
app.use(express.json());

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		if (config.node_env === "development") {
			await connectDB();
		}

		// User Routes
		app.use("/user", userRoutes);

		// Tasks Routes
		app.use("/tasks", tasksRoutes);

		// Payments Routes
		app.use("/payments", paymentsRoutes);

		// Submission Routes
		app.use("/submissions", submissionRoutes);

		// Withdrawals Routes
		app.use("/withdrawals", withdrawalsRoutes);

		// Statistics Routes
		app.use("/statistics", statisticsRoutes);

		// Notifications Routes
		app.use("/notifications", notificationsRoutes);

		// Send a ping to confirm a successful connection
		// await client.db("admin").command({ ping: 1 });
		// console.log("Pinged your deployment. You successfully connected to MongoDB!");
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

module.exports = app;
