// controllers/reportController.js
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// Get spending trends over time
const getSpendingTrends = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      type: "expense",
    }).sort({ date: 1 });

    const spendingTrends = transactions.map((transaction) => ({
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
    }));

    res.status(200).json(spendingTrends);
  } catch (error) {
    res.status(500).json({ message: "Error fetching spending trends", error });
  }
};

// Get income vs expenses summary
const getIncomeVsExpenses = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const income = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          type: "income",
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          type: "expense",
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
        },
      },
    ]);

    const incomeVsExpenses = {
      totalIncome: income[0]?.totalIncome || 0,
      totalExpenses: expenses[0]?.totalExpenses || 0,
    };

    res.status(200).json(incomeVsExpenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching income vs expenses", error });
  }
};

// Get budget summary for a specific date range
const getBudgetSummary = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const budgets = await Budget.find({
      user: req.user._id,
      month: { $gte: startDate, $lte: endDate },
    });

    const budgetSummary = budgets.map((budget) => ({
      category: budget.category,
      limit: budget.limit,
      month: budget.month,
    }));

    res.status(200).json(budgetSummary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching budget summary", error });
  }
};

module.exports = { getSpendingTrends, getIncomeVsExpenses, getBudgetSummary };