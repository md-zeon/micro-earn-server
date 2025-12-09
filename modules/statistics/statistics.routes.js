const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyWorker = require("../../middlewares/verifyWorker");
const statisticsController = require("./statistics.controller");
const verifyBuyer = require("../../middlewares/verifyBuyer");
const verifyAdmin = require("../../middlewares/verifyAdmin");
const router = express.Router();

// Worker earnings statistics
router.get(
	"/worker/earnings-stats",
	verifyFirebaseToken,
	verifyWorker,
	statisticsController.getWorkerEarningsStatistics,
);

// Worker submission statistics
router.get(
	"/worker/submission-stats",
	verifyFirebaseToken,
	verifyWorker,
	statisticsController.getWorkerSubmissionStatistics,
);

// Buyer task statistics
router.get(
	"/buyer/task-stats",
	verifyFirebaseToken,
	verifyBuyer,
	statisticsController.getBuyerTaskStatistics,
);

// Buyer payment statistics
router.get(
	"/buyer/payment-stats",
	verifyFirebaseToken,
	verifyBuyer,
	statisticsController.getBuyerPaymentStatistics,
);

// Admin task statistics
router.get(
	"/admin/task-stats",
	verifyFirebaseToken,
	verifyAdmin,
	statisticsController.getAdminTaskStatistics,
);

// Admin user statistics
router.get(
	"/admin/user-stats",
	verifyFirebaseToken,
	verifyAdmin,
	statisticsController.getAdminUserStatistics,
);

// Admin total stats
router.get(
	"/admin/stats",
	verifyFirebaseToken,
	verifyAdmin,
	statisticsController.getAdminTotalStatistics,
);

// total stats data
router.get("/", statisticsController.getTotalStatistics);

const statisticsRoutes = router;
module.exports = statisticsRoutes;
