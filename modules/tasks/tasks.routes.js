const express = require("express");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken");
const verifyBuyer = require("../../middlewares/verifyBuyer");
const tasksController = require("./tasks.controller");
const verifyWorker = require("../../middlewares/verifyWorker");
const verifyAdmin = require("../../middlewares/verifyAdmin");
const router = express.Router();

// Create New Task (Buyer)
router.post("/", verifyFirebaseToken, verifyBuyer, tasksController.createTask);

// All Tasks (Public Route)
router.get("/", tasksController.getAllTasks);

// GET ALL TASKS (Admin)
//! WARN /admin/tasks => /tasks/admin
router.get(
	"/admin",
	verifyFirebaseToken,
	verifyAdmin,
	tasksController.getAllTasksForAdmin,
);

// GET buyer's tasks (sorted by deadline DESC)
//! WARN: /my-tasks => /tasks/my-tasks (need to change in the frontend)
router.get(
	"/my-tasks",
	verifyFirebaseToken,
	verifyBuyer,
	tasksController.getMyTasks,
);

// Get single task by ID
router.get("/:id", verifyFirebaseToken, tasksController.getTaskById);

// Delete Task
router.delete(
	"/:id",
	verifyFirebaseToken,
	verifyBuyer,
	tasksController.deleteTask,
);

// Update Task
router.patch(
	"/:id",
	verifyFirebaseToken,
	verifyBuyer,
	tasksController.updateTask,
);

// Worker Routes
//! WARN /tasks-for-worker => /tasks/tasks-for-worker
router.get(
	"/tasks-for-worker",
	verifyFirebaseToken,
	verifyWorker,
	tasksController.getTasksForWorker,
);

// Update Workers (increase/decrease)
//! WARN /update-workers/:id => /tasks/update-workers/:id
router.patch(
	"/update-workers/:id",
	verifyFirebaseToken,
	tasksController.updateWorkers,
);

// DELETE task by Admin
//! WARN /admin/task/:id => /tasks/admin/:id
router.delete(
	"/admin/:id",
	verifyFirebaseToken,
	verifyAdmin,
	tasksController.deleteTaskByAdmin,
);

const tasksRoutes = router;
module.exports = tasksRoutes;
