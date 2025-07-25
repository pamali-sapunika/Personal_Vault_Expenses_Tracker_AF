const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Set a new budget
const setBudget = async (req, res) => {
  const { category, limit, month } = req.body;

  try {
    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      month,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: "Error setting budget", error: error.message });
  }
};

// Get all budgets for the user
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(400).json({ message: "Error fetching budgets", error: error.message });
  }
};

// Update a budget
const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { limit } = req.body;

  try {
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this budget" });
    }

    budget.limit = limit;
    await budget.save();

    res.status(200).json(budget);
  } catch (error) {
    res.status(400).json({ message: "Error updating budget", error: error.message });
  }
};

// Delete a budget
const deleteBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this budget" });
    }

    await budget.deleteOne();
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting budget", error: error.message });
  }
};

// Check if user is nearing or exceeding budgets
const checkBudgetNotifications = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id });

    const notifications = budgets.map((budget) => {
      const totalSpent = transactions
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentageUsed = (totalSpent / budget.limit) * 100;

      return {
        category: budget.category,
        limit: budget.limit,
        totalSpent,
        percentageUsed,
        notification:
          percentageUsed >= 80
            ? `You are nearing your budget limit for ${budget.category} (${percentageUsed.toFixed(2)}%)`
            : percentageUsed >= 100
            ? `You have exceeded your budget limit for ${budget.category} (${percentageUsed.toFixed(2)}%)`
            : null,
      };
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ message: "Error checking notifications", error: error.message });
  }
};

// Get budget adjustment recommendations
const getBudgetRecommendations = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id });

    const recommendations = budgets.map((budget) => {
      const totalSpent = transactions
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const averageSpending = totalSpent / (new Date().getDate()); // Average spending per day
      const projectedSpending = averageSpending * 30; // Projected monthly spending

      return {
        category: budget.category,
        currentLimit: budget.limit,
        projectedSpending,
        recommendation:
          projectedSpending > budget.limit
            ? `Consider increasing your budget for ${budget.category} to at least ${projectedSpending.toFixed(2)}`
            : `Your budget for ${budget.category} is sufficient.`,
      };
    });

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(400).json({ message: "Error fetching recommendations", error: error.message });
  }
};

module.exports = {
  setBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetNotifications,
  getBudgetRecommendations,
};