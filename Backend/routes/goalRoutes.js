const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addSavingsToGoal,
} = require("../controllers/goalController");

const router = express.Router();

router.route("/")
  .post(protect, createGoal)
  .get(protect, getGoals);

router.route("/:id")
  .get(protect, getGoalById)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.route("/:id/add-savings")
  .put(protect, addSavingsToGoal);

module.exports = router;