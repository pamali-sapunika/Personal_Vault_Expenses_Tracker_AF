// routes/reportRoutes.js
const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getSpendingTrends,
  getIncomeVsExpenses,
  getBudgetSummary,
} = require("../controllers/reportController");

const router = express.Router();

// Route to get spending trends over time
router.get("/spending-trends", protect, getSpendingTrends);

// Route to get income vs expenses summary
router.get("/income-vs-expenses", protect, getIncomeVsExpenses);

// Route to get budget summary for a specific date range
router.get("/budget-summary", protect, getBudgetSummary);

module.exports = router;