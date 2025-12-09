const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyWorker = require("../../middlewares/verifyWorker");
const withdrawalsController = require("./withdrawals.controller");
const verifyAdmin = require("../../middlewares/verifyAdmin");
const router = express.Router();

// Create New WithDrawal
router.post(
	"/",
	verifyFirebaseToken,
	verifyWorker,
	withdrawalsController.createWithdrawal,
);

// Get Withdrawals
router.get(
	"/",
	verifyFirebaseToken,
	verifyWorker,
	withdrawalsController.getWithdrawals,
);

// Admin: Get All Withdraw Requests
//! /admin/withdraw-requests => /withdrawals/admin/withdraw-requests
router.get(
	"/admin/withdraw-requests",
	verifyFirebaseToken,
	verifyAdmin,
	withdrawalsController.getAllWithdrawRequests,
);

// Admin: Approve Withdraw Request
//! /admin/approve-withdraw/:id => /withdrawals/admin/approve-withdraw/:id
router.patch(
	"/admin/approve-withdraw/:id",
	verifyFirebaseToken,
	verifyAdmin,
	withdrawalsController.approveWithdrawRequest,
);

const withdrawalsRoutes = router;
module.exports = withdrawalsRoutes;
