const express = require("express");
const { protect } = require("../middleware/auth");
const {
  setBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetNotifications,
  getBudgetRecommendations,
} = require("../controllers/budgetController");

const router = express.Router();

// Budget management routes
router.post("/", protect, setBudget); // Set a new budget
router.get("/", protect, getBudgets); // Get all budgets for the user
router.put("/:id", protect, updateBudget); // Update a budget
router.delete("/:id", protect, deleteBudget); // Delete a budget

// Notification and recommendation routes
router.get("/notifications", protect, checkBudgetNotifications); // Check if user is nearing/exceeding budgets
router.get("/recommendations", protect, getBudgetRecommendations); // Get budget adjustment recommendations

module.exports = router;