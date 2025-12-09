const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyWorker = require("../../middlewares/verifyWorker");
const submissionController = require("./submission.controller");
const verifyBuyer = require("../../middlewares/verifyBuyer");
const router = express.Router();

// Submit Task (Worker)
router.post(
	"/",
	verifyFirebaseToken,
	verifyWorker,
	submissionController.submitTask,
);

// Get submissions (Worker)
router.get(
	"/",
	verifyFirebaseToken,
	verifyWorker,
	submissionController.getSubmissions,
);

// accept / reject submissions
router.patch(
	"/status-update",
	verifyFirebaseToken,
	verifyBuyer,
	submissionController.updateSubmissionStatus,
);

// Get all submissions for a buyer's tasks
//! WARN: /buyer-submissions => /submissions/buyer (need to change the front-end accordingly)
router.get(
	"/buyer",
	verifyFirebaseToken,
	verifyBuyer,
	submissionController.getBuyerSubmissions,
);

const submissionRoutes = router;
module.exports = submissionRoutes;
