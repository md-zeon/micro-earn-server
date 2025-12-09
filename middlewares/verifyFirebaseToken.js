const { getAuth } = require("firebase-admin/auth");

const verifyFirebaseToken = async (req, res, next) => {
	const authHeader = req.headers?.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).send({ message: "Unauthorized: No token provided" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const decoded = await getAuth().verifyIdToken(token);
		req.decoded = decoded;
		next();
	} catch (err) {
		return res.status(400).send({ message: "Invalid token" });
	}
};

module.exports = verifyFirebaseToken;
