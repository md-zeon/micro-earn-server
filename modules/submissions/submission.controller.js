const { ObjectId } = require("mongodb");
const {
	submissionsCollection,
	notificationsCollection,
	tasksCollection,
} = require("../../config/mongodb");

const submitTask = async (req, res) => {
	try {
		const newSubmission = req?.body || {};
		newSubmission.updatedAt = new Date().toISOString();
		newSubmission.status = "pending";
		// Insert the submission
		const result = await submissionsCollection.insertOne(newSubmission);

		// Notify buyer
		await notificationsCollection.insertOne({
			message: `You have a new submission for "${newSubmission?.task_title}".`,
			toEmail: newSubmission?.buyer_email,
			actionRoute: "/dashboard",
			time: new Date(),
		});

		res.send(result);
	} catch (err) {
		// console.error("Error saving submission:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getSubmissions = async (req, res) => {
	try {
		const worker_email = req.decoded?.email;
		const query = { worker_email };
		const result = await submissionsCollection.find(query).toArray();
		res.send(result);
	} catch (err) {
		// console.error("Error fetching submissions:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const updateSubmissionStatus = async (req, res) => {
	try {
		const { submissionId, status } = req?.body || {};
		const filter = { _id: new ObjectId(submissionId) };
		const submission = await submissionsCollection.findOne(filter);
		if (!submission)
			return res.status(404).send({ message: "Submission not found!" });

		const result = await submissionsCollection.updateOne(filter, {
			$set: {
				status,
				updatedAt: new Date().toISOString(),
			},
		});

		// Fetch task for details
		const task = await tasksCollection.findOne({
			_id: new ObjectId(submission?.task_id),
		});
		if (task && submission?.worker_email) {
			let message = "";
			if (status === "approved") {
				message = `You have earned ${task?.payable_amount} coins from ${submission?.buyer_name} for completing "${task?.task_title}".`;
			} else if (status === "rejected") {
				message = `Your submission for "${task?.task_title}" was rejected by ${submission?.buyer_name}.`;
			}

			await notificationsCollection.insertOne({
				message,
				toEmail: submission?.worker_email,
				actionRoute: "/dashboard",
				time: new Date(),
			});
		}

		res.send({ result });
	} catch (err) {
		// console.error("Submission status update error:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getBuyerSubmissions = async (req, res) => {
	try {
		const email = req.decoded?.email;
		const result = await submissionsCollection
			.find({ buyer_email: email })
			.toArray();
		res.send(result);
	} catch (err) {
		// console.error("Error fetching buyer submissions:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const submissionController = {
	submitTask,
	getSubmissions,
	updateSubmissionStatus,
	getBuyerSubmissions,
};
module.exports = submissionController;
