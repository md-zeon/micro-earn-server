const { paymentsCollection } = require("../../config/mongodb");
const stripe = require("../../config/stripe");

const createPaymentIntent = async (req, res) => {
	const { amount } = req?.body || {};
	const paymentAmount = parseInt(amount * 100);
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: paymentAmount,
			currency: "usd",
			payment_method_types: ["card"],
		});
		res.send({
			clientSecret: paymentIntent?.client_secret,
		});
	} catch (error) {
		// console.error("Error creating payment intent:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const savePaymentInfo = async (req, res) => {
	try {
		const paymentData = req?.body || {};
		paymentData.createdAt = new Date().toISOString();
		const result = await paymentsCollection.insertOne(paymentData);
		res.send(result);
	} catch (error) {
		// console.error("Error saving payment:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const getAllPayments = async (req, res) => {
	try {
		const email = req?.decoded?.email;
		const payments = await paymentsCollection
			.find({ buyer_email: email })
			.sort({ payment_date: -1 })
			.toArray();
		res.send(payments);
	} catch (error) {
		// console.error("Error fetching payments:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

const paymentsController = {
	createPaymentIntent,
	savePaymentInfo,
	getAllPayments,
};

module.exports = paymentsController;
