const { notificationsCollection } = require("../../config/mongodb");

const getNotifications = async (req, res) => {
	try {
		const email = req?.decoded?.email;
		const result = await notificationsCollection
			.find({ toEmail: email })
			.sort({ time: -1 })
			.toArray();
		res.send(result);
	} catch (error) {
		res
			.status(500)
			.send({ message: "Failed to get notifications: " + error.message });
	}
};

const notificationsController = {
	getNotifications,
};

module.exports = notificationsController;
