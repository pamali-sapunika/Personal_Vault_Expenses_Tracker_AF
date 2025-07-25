const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendEmail, scheduleNotification } = require("../utils/notificationService");

// Authenticate user and get token
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// Set base currency for the user
const setBaseCurrency = asyncHandler(async (req, res) => {
  const { baseCurrency } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.baseCurrency = baseCurrency;
    await user.save();
    res.json({ message: "Base currency updated successfully", user });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Get all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update user details
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Notify user about unusual spending
const notifyUnusualSpending = asyncHandler(async (req, res) => {
  const { userId, message } = req.body;

  const user = await User.findById(userId);

  if (user) {
    sendEmail(user.email, 'Unusual Spending Alert', message);
    res.json({ message: 'Notification sent successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Schedule a bill reminder
const scheduleBillReminder = asyncHandler(async (req, res) => {
  const { userId, cronTime, message } = req.body;

  const user = await User.findById(userId);

  if (user) {
    scheduleNotification(cronTime, user.email, 'Bill Payment Reminder', message);
    res.json({ message: 'Reminder scheduled successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  setBaseCurrency,
  notifyUnusualSpending,
  scheduleBillReminder,
};