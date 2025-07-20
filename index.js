const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
	res.send("MicroEarn Server is running...");
});

// Start server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
