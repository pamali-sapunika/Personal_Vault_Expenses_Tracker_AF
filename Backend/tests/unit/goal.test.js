const request = require('supertest');
const app = require('../../server'); // Import your Express app
const Goal = require('../../models/Goal');
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
  await Goal.deleteMany({});
  await mongoose.connection.close();
  console.log('Database connection closed.');
});

// Test suite for Goal Controller
describe('Goal Controller', () => {
  // Test case: Create a new goal
  describe('POST /api/goals', () => {
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
      expect(response.body.targetAmount).toBe(10000);
      expect(response.body.savedAmount).toBe(0); // Default value
    });
  });

  // Test case: Get all goals for the authenticated user
  describe('GET /api/goals', () => {
    it('should get all goals for the authenticated user', async () => {
      // Create a test goal
      await Goal.create({
        user: userId,
        title: 'Buy a Car',
        targetAmount: 10000,
        targetDate: '2023-12-31',
        description: 'Save money to buy a car',
      });

      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // Test case: Get a goal by ID
  describe('GET /api/goals/:id', () => {
    it('should get a goal by ID', async () => {
      const goal = await Goal.create({
        user: userId,
        title: 'Buy a Car',
        targetAmount: 10000,
        targetDate: '2023-12-31',
        description: 'Save money to buy a car',
      });

      const response = await request(app)
        .get(`/api/goals/${goal._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(goal._id.toString());
      expect(response.body.title).toBe('Buy a Car');
    });

    it('should return 404 if goal is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/goals/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Goal not found');
    });
  });

  // Test case: Update a goal
  describe('PUT /api/goals/:id', () => {
    it('should update a goal', async () => {
      const goal = await Goal.create({
        user: userId,
        title: 'Buy a Car',
        targetAmount: 10000,
        targetDate: '2023-12-31',
        description: 'Save money to buy a car',
      });

      const response = await request(app)
        .put(`/api/goals/${goal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Buy a New Car',
          targetAmount: 15000,
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Buy a New Car');
      expect(response.body.targetAmount).toBe(15000);
    });

    it('should return 404 if goal is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/goals/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Buy a New Car',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Goal not found');
    });
  });

  // Test case: Delete a goal
  describe('DELETE /api/goals/:id', () => {
    it('should return 404 if goal is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/goals/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Goal not found');
    });
  });

  // Test case: Add savings to a goal
  describe('PUT /api/goals/:id/add-savings', () => {
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

    it('should mark the goal as completed if savedAmount >= targetAmount', async () => {
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
          amount: 10000,
        });

      expect(response.status).toBe(200);
      expect(response.body.savedAmount).toBe(10000);
      expect(response.body.isCompleted).toBe(true);
    });

    it('should return 404 if goal is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/goals/${nonExistentId}/add-savings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 5000,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Goal not found');
    });
  });
});