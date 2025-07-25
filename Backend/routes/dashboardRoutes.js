const express = require("express");
const { protect, admin } = require("../middleware/auth");
const { getAdminDashboard, getUserDashboard } = require("../controllers/dashboardController");

const router = express.Router();

// Admin dashboard route
router.get("/admin", protect, admin, getAdminDashboard);

// User dashboard route
router.get("/user", protect, getUserDashboard);

module.exports = router;