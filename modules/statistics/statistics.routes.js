const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyWorker = require("../../middlewares/verifyWorker");
const statisticsController = require("./statistics.controller");
const verifyBuyer = require("../../middlewares/verifyBuyer");
const verifyAdmin = require("../../middlewares/verifyAdmin");
const router = express.Router();

// Worker earnings statistics
//! WARN: /worker/earnings-stats => /statistics/worker/earnings-stats (updated route - need to change in frontend as well)
router.get(
	"/worker/earnings-stats",
	verifyFirebaseToken,
	verifyWorker,
	statisticsController.getWorkerEarningsStatistics,
);

// Worker submission statistics
//! WARN: /worker/submission-stats => /statistics/worker/submission-stats (updated route - need to change in frontend as well)
router.get(
	"/worker/submission-stats",
	verifyFirebaseToken,
	verifyWorker,
	statisticsController.getWorkerSubmissionStatistics,
);

// Buyer task statistics
//! WARN: /buyer/task-stats => /statistics/buyer/task-stats (updated route - need to change in frontend as well)
router.get(
	"/buyer/task-stats",
	verifyFirebaseToken,
	verifyBuyer,
	statisticsController.getBuyerTaskStatistics,
);

// Buyer payment statistics
//! WARN: /buyer/payment-stats => /statistics/buyer/payment-stats (updated route - need to change in frontend as well)
router.get(
	"/buyer/payment-stats",
	verifyFirebaseToken,
	verifyBuyer,
	statisticsController.getBuyerPaymentStatistics,
);

// Admin task statistics
//! WARN: /admin/task-stats => /statistics/admin/task-stats (updated route - need to change in frontend as well)
router.get(
	"/admin/task-stats",
	verifyFirebaseToken,
	verifyAdmin,
	statisticsController.getAdminTaskStatistics,
);

// Admin user statistics
//! WARN: /admin/user-stats => /statistics/admin/user-stats (updated route - need to change in frontend as well)
router.get(
	"/admin/user-stats",
	verifyFirebaseToken,
	verifyAdmin,
	statisticsController.getAdminUserStatistics,
);

// Admin total stats
//! WARN: /admin/stats => /statistics/admin/stats (updated route - need to change in frontend as well)
router.get(
	"/admin/stats",
	verifyFirebaseToken,
	verifyAdmin,
	statisticsController.getAdminTotalStatistics,
);

// total stats data
//! WARN: /stats => /statistics/ (updated route - need to change in frontend as well)
router.get("/", statisticsController.getTotalStatistics);

const statisticsRoutes = router;
module.exports = statisticsRoutes;
