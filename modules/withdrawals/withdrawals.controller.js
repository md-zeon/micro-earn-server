const {
	withdrawalsCollection,
	usersCollection,
	notificationsCollection,
} = require("../../config/mongodb");

const createWithdrawal = async (req, res) => {
	try {
		const newWithdrawal = req?.body || {};
		// console.log("New Withdrawal Payload:", newWithdrawal);
		newWithdrawal.status = "pending";
		// Insert the withdrawal
		const result = await withdrawalsCollection.insertOne(newWithdrawal);

		// Notify Admin
		const admin = await usersCollection.findOne({ role: "admin" });
		await notificationsCollection.insertOne({
			message: `You have a new withdrawal request of ${newWithdrawal?.withdrawal_amount}$ from ${newWithdrawal?.worker_name}.`,
			toEmail: admin?.email,
			actionRoute: "/dashboard",
			time: new Date(),
		});
		res.send(result);
	} catch (err) {
		// console.error("Error saving withdrawal:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getWithdrawals = async (req, res) => {
	try {
		const worker_email = req.decoded?.email;
		const query = { worker_email };
		const result = await withdrawalsCollection
			.find(query)
			.sort({ withdraw_date: -1 })
			.toArray();
		res.send(result);
	} catch (err) {
		// console.error("Error fetching withdrawals:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAllWithdrawRequests = async (req, res) => {
	try {
		const pendingRequests = await withdrawalsCollection
			.find({ status: "pending" })
			.sort({ withdraw_date: -1 })
			.toArray();
		const approvedRequests = await withdrawalsCollection
			.find({ status: "approved" })
			.sort({ withdraw_date: -1 })
			.toArray();
		res.send({ pendingRequests, approvedRequests });
	} catch (err) {
		res.status(500).send({ message: "Failed to load withdraw requests" });
	}
};

const approveWithdrawRequest = async (req, res) => {
	try {
		const withdrawId = req?.params?.id;
		const { status } = req?.body || {};
		const filter = { _id: new ObjectId(withdrawId) };

		// Update the withdrawal
		const updateDoc = {
			$set: { status: status, updatedAt: new Date().toISOString() },
		};
		const result = await withdrawalsCollection.updateOne(filter, updateDoc);

		// Notify worker
		const withdrawal = await withdrawalsCollection.findOne(filter);
		if (withdrawal && status === "approved") {
			await notificationsCollection.insertOne({
				message: `Your withdrawal of ${withdrawal?.withdrawal_amount}$ has been approved.`,
				toEmail: withdrawal?.worker_email,
				actionRoute: "/dashboard",
				time: new Date(),
			});
		}

		res.send(result);
	} catch (err) {
		res.status(500).send({
			message: "Failed to approve withdraw request: " + err?.message,
		});
	}
};

const withdrawalsController = {
	createWithdrawal,
	getWithdrawals,
	getAllWithdrawRequests,
	approveWithdrawRequest,
};

module.exports = withdrawalsController;
