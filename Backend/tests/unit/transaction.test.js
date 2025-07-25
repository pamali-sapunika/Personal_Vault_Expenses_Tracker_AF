const request = require('supertest');
const app = require('../../server'); // Import your Express app
const Transaction = require('../../models/Transaction');
const User = require('../../models/User');
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
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  console.log('Test user created.');

  console.log('Logging in...');
  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email: 'test@example.com',
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
  await mongoose.connection.close();
  console.log('Database connection closed.');
});

// Test suite for Transaction Controller
describe('Transaction Controller', () => {
  // Test case: Create a new transaction
  describe('POST /api/transactions', () => {
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
      expect(response.body.amount).toBe(100);
      expect(response.body.category).toBe('Food');
    });
  });

  // Test case: Get all transactions for the authenticated user
  describe('GET /api/transactions', () => {
    it('should get all transactions for the authenticated user', async () => {
      // Create a test transaction
      await Transaction.create({
        user: userId,
        type: 'income',
        amount: 500,
        currency: 'USD',
        category: 'Salary',
        description: 'Monthly salary',
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // Test case: Get a transaction by ID
  describe('GET /api/transactions/:id', () => {
    it('should get a transaction by ID', async () => {
      const transaction = await Transaction.create({
        user: userId,
        type: 'expense',
        amount: 50,
        currency: 'USD',
        category: 'Transportation',
        description: 'Bus fare',
      });

      const response = await request(app)
        .get(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(transaction._id.toString());
      expect(response.body.amount).toBe(50);
    });

    it('should return 404 if transaction is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/transactions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transaction not found');
    });
  });

  // Test case: Update a transaction
  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction', async () => {
      const transaction = await Transaction.create({
        user: userId,
        type: 'expense',
        amount: 30,
        currency: 'USD',
        category: 'Entertainment',
        description: 'Movie ticket',
      });

      const response = await request(app)
        .put(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 40,
          description: 'Updated movie ticket',
        });

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(40);
      expect(response.body.description).toBe('Updated movie ticket');
    });

    it('should return 404 if transaction is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/transactions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 40,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transaction not found');
    });
  });

  // Test case: Delete a transaction
  describe('DELETE /api/transactions/:id', () => {
    it('should return 404 if transaction is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/transactions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transaction not found');
    });
  });
});