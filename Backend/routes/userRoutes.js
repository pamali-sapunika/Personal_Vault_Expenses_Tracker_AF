const express = require("express");
const {
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
} = require("../controllers/userController");

const router = express.Router();

// Route for user login
router.post("/login", authUser);

// Route for registering a new user
router.post("/register", registerUser);

// Route for getting the profile of the authenticated user
router.get("/profile", getUserProfile);

// Route for getting all users
router.get("/", getUsers);

// Route for getting a user by ID
router.get("/:id", getUserById);

// Route for updating user details
router.put("/:id", updateUser);

// Route for deleting a user
router.delete("/:id", deleteUser);

// Route for setting the base currency for a user
router.put("/baseCurrency", setBaseCurrency);

// Route for notifying a user about unusual spending
router.post("/notifyUnusualSpending", notifyUnusualSpending);

// Route for scheduling a bill payment reminder
router.post("/scheduleBillReminder", scheduleBillReminder);

module.exports = router;