const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyBuyer = require("../../middlewares/verifyBuyer");
const paymentsController = require("./payments.controller");
const router = express.Router();

// Payment Intent
router.post(
	"/create-payment-intent",
	verifyFirebaseToken,
	paymentsController.createPaymentIntent,
);

// Save payment info
router.post(
	"/",
	verifyFirebaseToken,
	verifyBuyer,
	paymentsController.savePaymentInfo,
);

// get All Payments
router.get(
	"/",
	verifyFirebaseToken,
	verifyBuyer,
	paymentsController.getAllPayments,
);

const paymentsRoutes = router;
module.exports = paymentsRoutes;
