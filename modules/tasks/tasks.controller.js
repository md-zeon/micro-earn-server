const { tasksCollection, usersCollection } = require("../../config/mongodb");

const createTask = async (req, res) => {
	try {
		const newTask = req?.body || {};
		// console.log("New Task Payload:", newTask);
		newTask.total_workers = newTask?.required_workers;
		newTask.createdAt = new Date().toISOString();
		newTask.updatedAt = new Date().toISOString();
		newTask.status = "active";
		const result = await tasksCollection.insertOne(newTask);
		// console.log("Task created successfully:", result);
		res.send(result);
	} catch (err) {
		// console.log("Error creating task:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAllTasks = async (req, res) => {
	try {
		const tasks = await tasksCollection
			.find({ required_workers: { $gt: 0 } })
			.toArray();
		res.send(tasks);
	} catch (err) {
		// console.error("Error fetching tasks for worker:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getMyTasks = async (req, res) => {
	try {
		const email = req?.decoded?.email;
		const tasks = await tasksCollection
			.find({ posted_by: email })
			.sort({ completion_deadline: -1 })
			.toArray();
		res.send(tasks);
	} catch (err) {
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const deleteTask = async (req, res) => {
	try {
		const taskId = req?.params?.id;
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
};

const updateTask = async (req, res) => {
	try {
		const taskId = req?.params?.id;
		const updates = req?.body || {};
		const filter = { _id: new ObjectId(taskId) };
		const task = await tasksCollection.findOne(filter);
		if (!task) {
			return res.status(404).send({ message: "Task not found!" });
		}
		const updateDoc = {
			$set: {
				task_title: updates?.task_title,
				task_detail: updates?.task_detail,
				submission_info: updates?.submission_info,
				updatedAt: new Date().toISOString(),
			},
		};

		const result = await tasksCollection.updateOne(filter, updateDoc);
		res.send(result);
	} catch (err) {
		// console.error("Update Task Error:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const updateWorkers = async (req, res) => {
	try {
		const taskId = req?.params?.id;
		const { status } = req?.body || {};

		const filter = { _id: new ObjectId(taskId) };
		const task = await tasksCollection.findOne(filter);

		if (!task) {
			return res.status(404).send({ message: "Task not found" });
		}

		let newCount = task?.required_workers || 0;

		if (status === "decrease") newCount--;
		else if (status === "increase") newCount++;

		// Prevent negative workers
		if (newCount < 0) newCount = 0;

		const updateDoc = {
			$set: {
				required_workers: newCount,
				status: newCount === 0 ? "completed" : "active",
			},
		};

		const result = await tasksCollection.updateOne(filter, updateDoc);
		res.send(result);
	} catch (err) {
		res
			.status(500)
			.send({ message: "Failed to update workers: " + err?.message });
	}
};

const getTasksForWorker = async (req, res) => {
	try {
		const tasks = await tasksCollection
			.find({ required_workers: { $gt: 0 } })
			.toArray();
		res.send(tasks);
	} catch (err) {
		// console.error("Error fetching tasks for worker:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getTaskById = async (req, res) => {
	try {
		const taskId = req?.params?.id;
		const query = { _id: new ObjectId(taskId) };
		const task = await tasksCollection.findOne(query);
		if (!task) {
			return res.status(404).send({ message: "Task not found!" });
		}
		res.send(task);
	} catch (err) {
		// console.error("Error fetching single task:", err);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAllTasksForAdmin = async (req, res) => {
	try {
		const tasks = await tasksCollection.find().toArray();
		res.send(tasks);
	} catch (err) {
		res.status(500).send({ message: "Failed to get tasks: " + err.message });
	}
};

const deleteTaskByAdmin = async (req, res) => {
	try {
		const id = req?.params?.id;
		const query = { _id: new ObjectId(id) };

		// Get the task
		const task = await tasksCollection.findOne(query);
		if (!task) return res.status(404).send({ message: "Task not found" });

		// If task is active, refund buyer
		if (task?.status === "active") {
			const buyer_email = task?.posted_by;
			const total_amount =
				(task?.required_workers || 0) * (task?.payable_amount || 0);

			// Fetch buyer
			const buyer = await usersCollection.findOne({ email: buyer_email });
			if (buyer) {
				const updatedCoins = (buyer?.microCoins || 0) + total_amount;
				await usersCollection.updateOne(
					{ email: buyer_email },
					{ $set: { microCoins: updatedCoins } },
				);
			}
		}

		// Delete the task
		const result = await tasksCollection.deleteOne(query);
		res.send(result);
	} catch (err) {
		res.status(500).send({ message: "Failed to delete task: " + err?.message });
	}
};

const tasksController = {
	createTask,
	getAllTasks,
	getMyTasks,
	deleteTask,
	updateTask,
	updateWorkers,
	getTasksForWorker,
	getTaskById,
	getAllTasksForAdmin,
	deleteTaskByAdmin,
};

module.exports = tasksController;
