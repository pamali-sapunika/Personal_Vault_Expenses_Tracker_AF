const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.route("/")
  .post(protect, createTransaction)
  .get(protect, getTransactions);

router.route("/:id")
  .get(protect, getTransactionById)
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;