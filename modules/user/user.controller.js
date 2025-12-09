const { ObjectId } = require("mongodb");
const { usersCollection } = require("../../config/mongodb");

const createUser = async (req, res) => {
	const userData = req.body;
	userData.role = userData?.role || "worker";
	userData.createdAt = new Date().toISOString();
	userData.lastLoggedInAt = new Date().toISOString();
	try {
		const query = { email: userData?.email };
		const userExists = await usersCollection.findOne(query);
		// console.log("Does User Exist? ", !!userExists ? "Yes" : "No");
		if (!!userExists) {
			const result = await usersCollection.updateOne(query, {
				$set: {
					lastLoggedInAt: new Date().toISOString(),
				},
			});
			// console.log("updated User Last Login Time");
			return res.send(result);
		}

		userData.microCoins = userData?.role === "worker" ? 10 : 50;
		// console.log("Creating New User...");
		const result = await usersCollection.insertOne(userData);
		// console.log("User Created Successfully!");
		res.send(result);
	} catch (error) {
		console.error("Error in createUser:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getUserRole = async (req, res) => {
	try {
		const email = req?.decoded?.email;
		const query = { email: email };
		const user = await usersCollection.findOne(query);
		if (!user) {
			return res.status(404).send({ message: "User Not Found" });
		}
		res.send({ role: user?.role });
	} catch (error) {
		console.error("Error getting user role:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAvailableCoins = async (req, res) => {
	try {
		const email = req?.decoded?.email;
		const query = { email: email };
		const user = await usersCollection.findOne(query);
		if (!user) {
			return res.status(404).send({ message: "User Not Found" });
		}
		res.send({ microCoins: user?.microCoins });
	} catch (error) {
		console.error("Error getting available coins:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const updateMicroCoins = async (req, res) => {
	try {
		const email = req?.params?.email;
		const { coinsToUpdate, status } = req?.body || {};
		const filter = { email: email };
		const updateDoc = {
			$inc: {
				microCoins: status === "decrease" ? -coinsToUpdate : coinsToUpdate,
			},
		};
		const result = await usersCollection.updateOne(filter, updateDoc);
		res.send(result);
	} catch (error) {
		console.error("Error updating micro coins:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAllUsers = async (req, res) => {
	try {
		const users = await usersCollection.find().toArray();
		res.send(users);
	} catch (err) {
		res.status(500).send({ message: "Failed to get users: " + err.message });
	}
};

const deleteUser = async (req, res) => {
	try {
		const userId = req?.params?.id;
		const filter = { _id: new ObjectId(userId) };

		const user = await usersCollection.findOne(filter);
		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}
		// delete user from firebase
		await admin.auth().deleteUser(user?.uid);

		// Delete from mongoDB
		const result = await usersCollection.deleteOne(filter);

		res.send({ message: "User deleted successfully", result });
	} catch (err) {
		res.status(500).send({ message: "Failed to delete user: " + err?.message });
	}
};

const updateUserRole = async (req, res) => {
	try {
		const userId = req?.params?.id;
		const { role } = req?.body || {};
		const filter = { _id: new ObjectId(userId) };
		const updateDoc = {
			$set: { role: role, updatedAt: new Date().toISOString() },
		};
		const result = await usersCollection.updateOne(filter, updateDoc);
		res.send(result);
	} catch (err) {
		res
			.status(500)
			.send({ message: "Failed to update user role: " + err?.message });
	}
};

const getTopWorkers = async (req, res) => {
	try {
		const topWorkers = await usersCollection
			.find({ role: "worker" })
			.sort({ microCoins: -1 })
			.limit(6)
			.project({ name: 1, photoURL: 1, microCoins: 1 })
			.toArray();

		res.send(topWorkers);
	} catch (error) {
		console.error("Error getting top workers:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const updateUserProfile = async (req, res) => {
	try {
		const email = req?.decoded?.email;
		const { name, photoURL } = req?.body || {};
		const query = { email };
		const result = await usersCollection.updateOne(query, {
			$set: {
				name,
				photoURL,
				updatedAt: new Date().toISOString(),
			},
		});
		res.send(result);
	} catch (error) {
		res
			.status(500)
			.send({ message: "Failed to update profile: " + error?.message });
	}
};

const userController = {
	createUser,
	getUserRole,
	getAvailableCoins,
	updateMicroCoins,
	getAllUsers,
	deleteUser,
	updateUserRole,
	getTopWorkers,
	updateUserProfile,
};

module.exports = userController;
