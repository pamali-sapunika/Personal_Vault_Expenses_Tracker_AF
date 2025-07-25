const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

// Admin Dashboard: Get all users and their details
const getAdminDashboard = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}).select("-password");

    // Fetch system-wide financial summaries
    const totalTransactions = await Transaction.countDocuments();
    const totalIncome = await Transaction.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenses = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      users,
      totalTransactions,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin dashboard data", error });
  }
};

// User Dashboard: Get personalized summary for the logged-in user
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user details
    const user = await User.findById(userId).select("-password");

    // Fetch user transactions
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 }).limit(5);

    // Fetch user budgets
    const budgets = await Budget.find({ user: userId });

    // Fetch user goals
    const goals = await Goal.find({ user: userId });

    // Calculate total income and expenses for the user
    const income = await Transaction.aggregate([
      { $match: { user: userId, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const expenses = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      user,
      transactions,
      budgets,
      goals,
      totalIncome: income[0]?.total || 0,
      totalExpenses: expenses[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user dashboard data", error });
  }
};

module.exports = { getAdminDashboard, getUserDashboard };
