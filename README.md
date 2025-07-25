[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)

# Pamali Sapunika Ranasinghe

## Setup Instructions
2. *Install dependencies:*
   npm install

3. *Set up environment variables:*
   Create a .env file in the root directory and add the necessary environment variables.   
   PORT=3000
   MONGO_URI=mongodb+srv://kavishka:Kavishka!2002@cluster0.5unfk.mongodb.net/Pamali'


4. *Run the application:*

   node server

## API Endpoint Documentation

1.We will add Postman collection document  
   bash
User APIs
POST - /api/users/register (Register User)
POST - /api/users/login (User Login)
Transaction APIs
POST - /api/transactions (Create Transaction)
GET - /api/transactions/{id} (Get Transaction by ID)
PUT - /api/transactions/{id} (Update Transaction)
Budget APIs
POST - /api/budgets (Create Budget)
GET - /api/budgets (Get Budgets)
PUT - /api/budgets/{id} (Update Budget)
GET - /api/budgets/recommendations (Get Budget Recommendations)
Goal APIs
POST - /api/goals (Create Goal)
GET - /api/goals (Get All Goals)
PUT - /api/goals/{id} (Update Goal)
PUT - /api/goals/{id}/add-savings (Add Savings to Goal)
Report APIs
GET - /api/reports/income-vs-expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD (Income vs Expenses Report)
GET - /api/reports/budget-summary?startDate=YYYY-MM&endDate=YYYY-MM (Budget Summary Report)
Admin Dashboard APIs
GET - /api/dashboard/admin (Admin Dashboard Data)
User Dashbord APIs
GET - /api/dashboard/admin (User Dashboard Data)
   

## How to Run the performance Test

1. *Install k6:*
   Follow the instructions on the [k6 installation page](https://k6.io/docs/getting-started/installation/).

2. *Run the performance test:*
   bash
   performance/k6 run performance-test.js
   performance/k6 run budgetTest.js
   performance/k6 run reportTest.js
   performance/k6 run transaction-test.js
   
  
## How to Run the unit Test

1. *Install testing dependencies:*
   npm install --save-dev jest supertest.

2. *Run the unit test:*
      bash
   unit/npm test transaction.test.js    
   unit/npm test budgetController.test.js 
   unit/npm test goal.test.js 
   unit/npm test userController.test.js
      

## How to Run the integration Test

1. *Install testing dependencies:*
   npm install --save-dev jest supertest.

2. *Run the integration test:*
   integration/npm test integration.test.js
  
## How to Run the security Test

1. *Install testing dependencies:*
   npm install --save-dev mocha chai supertest.

2. *Run the integration test:*
   security/npx mocha useraut.test.js
  


## Project Architecture

- **/controllers**: Contains the logic for handling requests and responses.
- **/models**: Contains the database models.
- **/routes**: Contains the route definitions.
- **/middlewares**: Contains middleware functions.
- **/tests**: Contains test files.

## Challenges and How They Were Addressed

1. *Handling Authentication:*
   - *Challenge:* Ensuring secure authentication and authorization.
   - *Solution:* Implemented JWT-based authentication and used middleware to protect routes.

2. *Database Integration:*
   - *Challenge:* Seamless integration with the database.
   - *Solution:* Used an Mongodb for database operations and ensured proper error handling.

3. *Performance Testing:*
   - *Challenge:* Ensuring the application can handle high traffic.
   - *Solution:* Used k6 for performance testing and optimized the code based on test results.
