const asyncHandler = require("express-async-handler");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { getExchangeRate } = require("../utils/exchangeRate");

// Create a new transaction
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, currency, category, tags, description, isRecurring, recurrencePattern, recurrenceEndDate } = req.body;

  const user = await User.findById(req.user._id);
  const baseCurrency = user.baseCurrency;

  // Convert amount to base currency
  let convertedAmount = amount;
  if (currency !== baseCurrency) {
    const exchangeRate = await getExchangeRate(currency, baseCurrency);
    convertedAmount = amount * exchangeRate;
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    amount: convertedAmount,
    currency: baseCurrency, 
    originalAmount: amount, 
    originalCurrency: currency, 
    category,
    tags,
    description,
    isRecurring,
    recurrencePattern,
    recurrenceEndDate,
  });

  res.status(201).json(transaction);
});

// Get all transactions for the authenticated user
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id });
  res.json(transactions);
});

// Get a transaction by ID
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error("Transaction not found");
  }
});

// Update a transaction by ID
const updateTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, tags, description, isRecurring, recurrencePattern, recurrenceEndDate } = req.body;

  const transaction = await Transaction.findById(req.params.id);

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;
    transaction.category = category || transaction.category;
    transaction.tags = tags || transaction.tags;
    transaction.description = description || transaction.description;
    transaction.isRecurring = isRecurring || transaction.isRecurring;
    transaction.recurrencePattern = recurrencePattern || transaction.recurrencePattern;
    transaction.recurrenceEndDate = recurrenceEndDate || transaction.recurrenceEndDate;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } else {
    res.status(404);
    throw new Error("Transaction not found");
  }
});

// Delete a transaction by ID
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    await transaction.remove();
    res.json({ message: "Transaction removed" });
  } else {
    res.status(404);
    throw new Error("Transaction not found");
  }
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};