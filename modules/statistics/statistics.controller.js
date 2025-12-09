const {
	submissionsCollection,
	usersCollection,
	paymentsCollection,
	tasksCollection,
} = require("../../config/mongodb");

const getWorkerEarningsStatistics = async (req, res) => {
	try {
		const worker_email = req.decoded?.email;

		// Get approved submissions for earnings data
		const approvedSubmissions = await submissionsCollection
			.find({ worker_email: worker_email, status: "approved" })
			.toArray();

		// Group earnings by month
		const earningsByMonth = {};
		approvedSubmissions.forEach((submission) => {
			const date = new Date(submission.updatedAt);
			const month = date.toLocaleString("default", { month: "short" });
			const year = date.getFullYear();
			const key = `${month} ${year}`;

			if (!earningsByMonth[key]) {
				earningsByMonth[key] = 0;
			}
			earningsByMonth[key] += submission.payable_amount || 0;
		});

		// Convert to array format for chart
		const earningsData = Object.entries(earningsByMonth).map(
			([name, earnings]) => ({
				name,
				earnings,
			}),
		);

		res.send(earningsData);
	} catch (error) {
		console.error("Failed to fetch worker earnings stats:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getWorkerSubmissionStatistics = async (req, res) => {
	try {
		const worker_email = req.decoded?.email;

		// Get all submissions for the worker
		const submissions = await submissionsCollection
			.find({ worker_email: worker_email })
			.toArray();

		// Count submissions by status
		const statusCounts = {
			approved: 0,
			pending: 0,
			rejected: 0,
		};

		submissions.forEach((submission) => {
			if (statusCounts.hasOwnProperty(submission.status)) {
				statusCounts[submission.status]++;
			}
		});

		// Convert to array format for chart
		const submissionStats = Object.entries(statusCounts).map(
			([name, value]) => ({
				name: name.charAt(0).toUpperCase() + name.slice(1),
				value,
			}),
		);

		res.send(submissionStats);
	} catch (error) {
		console.error("Failed to fetch worker submission stats:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getBuyerTaskStatistics = async (req, res) => {
	try {
		const buyer_email = req.decoded?.email;

		// Get all tasks for the buyer
		const tasks = await tasksCollection
			.find({ posted_by: buyer_email })
			.toArray();

		// Count tasks by status
		const statusCounts = {
			active: 0,
			completed: 0,
		};

		tasks.forEach((task) => {
			if (statusCounts.hasOwnProperty(task.status)) {
				statusCounts[task.status]++;
			}
		});

		// Convert to array format for chart
		const taskStats = Object.entries(statusCounts).map(([name, value]) => ({
			name: name.charAt(0).toUpperCase() + name.slice(1),
			value,
		}));

		res.send(taskStats);
	} catch (error) {
		console.error("Failed to fetch buyer task stats:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getBuyerPaymentStatistics = async (req, res) => {
	try {
		const buyer_email = req.decoded?.email;

		// Get all payments for the buyer
		const payments = await paymentsCollection
			.find({ buyer_email: buyer_email })
			.toArray();

		// Group payments by month
		const paymentsByMonth = {};
		payments.forEach((payment) => {
			const date = new Date(payment.createdAt);
			const month = date.toLocaleString("default", { month: "short" });
			const year = date.getFullYear();
			const key = `${month} ${year}`;

			if (!paymentsByMonth[key]) {
				paymentsByMonth[key] = 0;
			}
			paymentsByMonth[key] += payment.amount_paid || 0;
		});

		// Convert to array format for chart
		const paymentData = Object.entries(paymentsByMonth).map(
			([name, payments]) => ({
				name,
				payments,
			}),
		);

		res.send(paymentData);
	} catch (error) {
		console.error("Failed to fetch buyer payment stats:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAdminTaskStatistics = async (req, res) => {
	try {
		// Get all tasks
		const tasks = await tasksCollection.find().toArray();

		// Group tasks by creation month
		const tasksByMonth = {};
		tasks.forEach((task) => {
			const date = new Date(task.createdAt);
			const month = date.toLocaleString("default", { month: "short" });
			const year = date.getFullYear();
			const key = `${month} ${year}`;

			if (!tasksByMonth[key]) {
				tasksByMonth[key] = 0;
			}
			tasksByMonth[key]++;
		});

		// Convert to array format for chart
		const taskData = Object.entries(tasksByMonth).map(([name, tasks]) => ({
			name,
			tasks,
		}));

		res.send(taskData);
	} catch (error) {
		console.error("Failed to fetch admin task stats:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAdminUserStatistics = async (req, res) => {
	try {
		// Get user counts by role
		const workers = await usersCollection.countDocuments({
			role: "worker",
		});
		const buyers = await usersCollection.countDocuments({
			role: "buyer",
		});

		// Convert to array format for chart
		const userData = [
			{ name: "Workers", value: workers },
			{ name: "Buyers", value: buyers },
		];

		res.send(userData);
	} catch (error) {
		console.error("Failed to fetch admin user stats:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAdminTotalStatistics = async (req, res) => {
	const workers = await usersCollection.countDocuments({
		role: "worker",
	});
	const buyers = await usersCollection.countDocuments({ role: "buyer" });
	const allUsers = await usersCollection.find().toArray();
	const totalCoins =
		allUsers?.reduce((sum, u) => sum + (u?.microCoins || 0), 0) || 0;
	const payments = await paymentsCollection.find().toArray();
	const totalPayments =
		payments?.reduce((sum, p) => sum + (p?.amount_paid || 0), 0) || 0;

	res.send({
		totalWorkers: workers,
		totalBuyers: buyers,
		totalCoins,
		totalPayments,
	});
};

const getTotalStatistics = async (req, res) => {
	try {
		// get total workers, buyers, tasks completed, total coins
		const totalWorkers = await usersCollection.countDocuments({
			role: "worker",
		});
		const totalBuyers = await usersCollection.countDocuments({
			role: "buyer",
		});
		const totalTasks = await tasksCollection.countDocuments({
			status: "completed",
		});
		const totalCoins = await usersCollection
			.aggregate([
				{ $match: { role: "worker" } },
				{ $group: { _id: null, total: { $sum: "$microCoins" } } },
			])
			.toArray();

		res.send({
			totalWorkers,
			totalBuyers,
			totalTasks,
			totalCoins: totalCoins[0]?.total || 0,
		});
	} catch (error) {
		console.error("Failed to fetch total stats:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const statisticsController = {
	getWorkerEarningsStatistics,
	getWorkerSubmissionStatistics,
	getBuyerTaskStatistics,
	getBuyerPaymentStatistics,
	getAdminTaskStatistics,
	getAdminUserStatistics,
	getAdminTotalStatistics,
	getTotalStatistics,
};
module.exports = statisticsController;
