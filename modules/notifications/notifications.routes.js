const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const notificationsController = require("./notifications.controller");
const router = express.Router();

// Get Notifications based on user email
router.get("/", verifyFirebaseToken, notificationsController.getNotifications);

const notificationsRoutes = router;
module.exports = notificationsRoutes;
