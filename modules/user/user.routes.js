const express = require("express");
const userController = require("./user.controller");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyAdmin = require("../../middlewares/verifyAdmin");
const router = express.Router();

// Add New User
router.post("/", userController.createUser);

// get all users (admin only)
//! /users => / => /user need to change in the frontend
router.get("/", verifyFirebaseToken, verifyAdmin, userController.getAllUsers);

// get user role
router.get("/role", verifyFirebaseToken, userController.getUserRole);

// get available Coins
//! [NOTE: /available-coins => /user/available-coins] need to change frontend accordingly later
router.get(
	"/available-coins",
	verifyFirebaseToken,
	userController.getAvailableCoins,
);

// Update Micro Coins (increase/decrease)
//! [NOTE: /update-coins/:email => /user/update-coins/:email] need to change frontend accordingly later
//! [NOTE: email is required in the request params, and coinsToUpdate and status are required in the request body]
router.patch(
	"/update-coins/:email",
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
//! NOTE: /update-role/user/:id => /update-role/:id => /user/update-role/:id
router.patch(
	"/update-role/:id",
	verifyFirebaseToken,
	verifyAdmin,
	userController.updateUserRole,
);

// Top 6 workers
//! NOTE: /top-workers => /user/top-workers
router.get("/top-workers", userController.getTopWorkers);

// Update User Profile
//! NOTE: /update-profile => /user/update-profile
router.patch(
	"/update-profile",
	verifyFirebaseToken,
	userController.updateUserProfile,
);

const userRoutes = router;
module.exports = userRoutes;
