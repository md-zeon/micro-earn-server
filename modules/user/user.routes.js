const express = require("express");
const userController = require("./user.controller");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyAdmin = require("../../middlewares/verifyAdmin");
const router = express.Router();

// Add New User
router.post("/", userController.createUser);

// get all users (admin only)
router.get("/", verifyFirebaseToken, verifyAdmin, userController.getAllUsers);

// get user role
router.get("/role", verifyFirebaseToken, userController.getUserRole);

// get available Coins
router.get(
	"/available-coins",
	verifyFirebaseToken,
	userController.getAvailableCoins,
);

// Update Micro Coins (increase/decrease)
router.patch(
	"/user/update-coins/:email",
	verifyFirebaseToken,
	userController.updateMicroCoins,
);

// delete a user (admin only)
router.delete(
	"/:id",
	verifyFirebaseToken,
	verifyAdmin,
	userController.deleteUser,
);

// Update user role
router.patch(
	"/update-role/:id",
	verifyFirebaseToken,
	verifyAdmin,
	userController.updateUserRole,
);

// Top 6 workers
router.get("/top-workers", userController.getTopWorkers);

// Update User Profile
router.patch(
	"/update-profile",
	verifyFirebaseToken,
	userController.updateUserProfile,
);

const userRoutes = router;
module.exports = userRoutes;
