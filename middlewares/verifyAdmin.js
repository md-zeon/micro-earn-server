const { usersCollection } = require("../config/mongodb");

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

module.exports = verifyAdmin;
