const { usersCollection } = require("../config/mongodb");

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

module.exports = verifyBuyer;
