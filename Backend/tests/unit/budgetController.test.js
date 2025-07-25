const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../Server"); // Import the Express app
const Budget = require("../../models/Budget");
const User = require("../../models/User");
const Transaction = require("../../models/Transaction");

// Increase Jest timeout to 30 seconds
jest.setTimeout(30000);

// Mock user and token for authentication
let testUser;
let authToken;

// Mock database connection and setup
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear the database before running tests
  await User.deleteMany({});
  await Budget.deleteMany({});
  await Transaction.deleteMany({});

  // Create a test user
  testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "user",
  });

  // Generate a token for the test user
  const loginResponse = await request(app)
    .post("/api/users/login")
    .send({
      email: "test@example.com",
      password: "password123",
    });

  authToken = loginResponse.body.token;
});

// Clear the database after each test
afterEach(async () => {
  await Budget.deleteMany({});
  await Transaction.deleteMany({});
});

// Close the database connection after all tests are done
afterAll(async () => {
  await User.deleteMany({});
  await Budget.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.connection.close();
});

describe("Budget Controller Tests", () => {
  // Test for setting a new budget
  describe("POST /api/budgets", () => {
    it("should set a new budget for the user", async () => {
      const res = await request(app)
        .post("/api/budgets")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          category: "Food",
          limit: 500,
          month: "2023-10",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.category).toEqual("Food");
      expect(res.body.limit).toEqual(500);
      expect(res.body.month).toEqual("2023-10");
    });

    it("should not set a budget without required fields", async () => {
      const res = await request(app)
        .post("/api/budgets")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          category: "Food",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("Error setting budget");
    });
  });

  // Test for getting all budgets for the user
  describe("GET /api/budgets", () => {
    it("should get all budgets for the user", async () => {
      // Create a budget for the test user
      await Budget.create({
        user: testUser._id,
        category: "Food",
        limit: 500,
        month: "2023-10",
      });

      const res = await request(app)
        .get("/api/budgets")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].category).toEqual("Food");
    });
  });

  // Test for updating a budget
  describe("PUT /api/budgets/:id", () => {
    it("should update a budget", async () => {
      // Create a budget for the test user
      const budget = await Budget.create({
        user: testUser._id,
        category: "Food",
        limit: 500,
        month: "2023-10",
      });

      const res = await request(app)
        .put(`/api/budgets/${budget._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          limit: 600,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.limit).toEqual(600);
    });

    it("should not update a budget with invalid ID", async () => {
      const res = await request(app)
        .put("/api/budgets/invalidId")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          limit: 600,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("Error updating budget");
    });
  });

  // Test for checking budget notifications
  describe("GET /api/budgets/notifications", () => {
    it("should check budget notifications", async () => {
      // Create a budget and transactions for the test user
      await Budget.create({
        user: testUser._id,
        category: "Food",
        limit: 500,
        month: "2023-10",
      });

      await Transaction.create({
        user: testUser._id,
        type: "expense",
        amount: 450,
        currency: "USD",
        category: "Food",
      });

      const res = await request(app)
        .get("/api/budgets/notifications")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].notification).toContain("nearing your budget limit");
    });
  });
});