const request = require('supertest');
const app = require('../../Server'); // Import your Express app
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Budget = require('../../models/Budget');
const Goal = require('../../models/Goal');
const mongoose = require('mongoose');

let authToken; // To store the authentication token
let userId; // To store the user ID

// Increase the timeout for all tests
jest.setTimeout(30000); // 30 seconds

// Before all tests, set up the database and create a test user
beforeAll(async () => {
  console.log('Connecting to the database...');
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Database connected.');

  console.log('Creating test user...');
  const user = await User.create({
    name: 'Integration Test User',
    email: 'integration@example.com',
    password: 'password123',
  });
  console.log('Test user created.');

  console.log('Logging in...');
  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email: 'integration@example.com',
      password: 'password123',
    });
  console.log('Logged in.');

  authToken = loginResponse.body.token; // Store the auth token
  userId = user._id; // Store the user ID
});

// After all tests, clean up the database and close the connection
afterAll(async () => {
  console.log('Cleaning up the database...');
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Budget.deleteMany({});
  await Goal.deleteMany({});
  await mongoose.connection.close();
  console.log('Database connection closed.');
});

// Integration Test Suite
describe('Integration Tests', () => {
  // Test User Registration and Login
  describe('User Module', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should not register a user with a duplicate email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Duplicate User',
          email: 'integration@example.com', // Duplicate email
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should log in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'integration@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should not log in with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'integration@example.com',
          password: 'wrongpassword', // Invalid password
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  // Test Transaction Creation and Retrieval
  describe('Transaction Module', () => {
    it('should create a new transaction', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 100,
          currency: 'USD',
          category: 'Food',
          description: 'Lunch at a restaurant',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe('expense');
    });

    it('should retrieve all transactions for the user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  // Test Budget Creation and Notifications
  describe('Budget Module', () => {
    it('should create a new budget', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Food',
          limit: 500,
          month: '2023-10',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.category).toBe('Food');
    });
  });

  // Test Goal Creation and Savings
  describe('Goal Module', () => {
    it('should create a new goal', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Buy a Car',
          targetAmount: 10000,
          targetDate: '2023-12-31',
          description: 'Save money to buy a car',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Buy a Car');
    });

    it('should add savings to a goal', async () => {
      const goal = await Goal.create({
        user: userId,
        title: 'Buy a Car',
        targetAmount: 10000,
        targetDate: '2023-12-31',
        description: 'Save money to buy a car',
      });

      const response = await request(app)
        .put(`/api/goals/${goal._id}/add-savings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 5000,
        });

      expect(response.status).toBe(200);
      expect(response.body.savedAmount).toBe(5000);
    });
  });

  // Test API Endpoints for Error Handling
  describe('Error Handling', () => {
    it('should return 401 for unauthorized access', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer invalidtoken'); // Invalid token

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistentroute')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});