const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyBuyer = require("../../middlewares/verifyBuyer");
const paymentsController = require("./payments.controller");
const router = express.Router();

// Payment Intent
//! WARN: /create-payment-intent => /payments/create-payment-intent (need to change in frontend)
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
