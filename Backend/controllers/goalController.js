const asyncHandler = require("express-async-handler");
const Goal = require("../models/Goal");

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  const { title, targetAmount, targetDate, description } = req.body;

  const goal = await Goal.create({
    user: req.user._id,
    title,
    targetAmount,
    savedAmount: 0,
    targetDate,
    description,
  });

  res.status(201).json(goal);
});

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id });
  res.json(goals);
});

// @desc    Get a goal by ID
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    res.json(goal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  const { title, targetAmount, savedAmount, targetDate, description, isCompleted } = req.body;

  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    goal.title = title || goal.title;
    goal.targetAmount = targetAmount || goal.targetAmount;
    goal.savedAmount = savedAmount || goal.savedAmount;
    goal.targetDate = targetDate || goal.targetDate;
    goal.description = description || goal.description;
    goal.isCompleted = isCompleted || goal.isCompleted;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    await goal.deleteOne();
    res.json({ message: "Goal removed" });
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

// @desc    Add savings to a goal
// @route   PUT /api/goals/:id/add-savings
// @access  Private
const addSavingsToGoal = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    goal.savedAmount += amount;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addSavingsToGoal,
};