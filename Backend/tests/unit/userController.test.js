const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../Server"); // Import the exported app
const User = require("../../models/User");

// Mock the database connection before running tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear the database after each test
afterEach(async () => {
  await User.deleteMany({});
});

// Close the database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Controller Tests", () => {
  // Test for user registration
  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          role: "user",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Test User");
      expect(res.body).toHaveProperty("email", "test@example.com");
      expect(res.body).toHaveProperty("token");
    },10000);

    it("should not register a user with an existing email", async () => {
      // Create a user first
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      const res = await request(app)
        .post("/api/users/register")
        .send({
          name: "Test User 2",
          email: "test@example.com",
          password: "password123",
          role: "user",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("User already exists");
    });
  });

  // Test for user login
  describe("POST /api/users/login", () => {
    it("should authenticate a user and return a token", async () => {
      // Create a user first
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      const res = await request(app)
        .post("/api/users/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Test User");
      expect(res.body).toHaveProperty("email", "test@example.com");
      expect(res.body).toHaveProperty("token");
    });

    it("should not authenticate a user with invalid credentials", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual("Invalid email or password");
    });
  });
});