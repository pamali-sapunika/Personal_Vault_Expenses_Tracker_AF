import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 10 },  // Ramp up to 10 users
        { duration: '30s', target: 50 },  // Stay at 50 users
        { duration: '10s', target: 0 },   // Ramp down
    ],
};

const BASE_URL = 'http://localhost:5000/api/transactions'; // Replace with your actual base URL
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGZhOGQzMGY0ZjcwOGVkNjI3MTFhZCIsImlhdCI6MTc0MjcxMTAxNSwiZXhwIjoxNzQ1MzAzMDE1fQ.p1dGLWTReorFDyOZ1ezLyP1ZpmBIr6bahrsdSAHQnE8'; // Replace with an actual auth token

export default function () {
    let authHeaders = { headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' } };

    group('🔹 Create a New Transaction', function () {
        let transactionData = JSON.stringify({
            type: 'expense',
            amount: 100,
            currency: 'USD',
            category: 'Food',
            tags: ['groceries', 'weekly'],
            description: 'Grocery shopping',
            isRecurring: false,
        });

        let createRes = http.post(`${BASE_URL}`, transactionData, authHeaders);
        check(createRes, { '✅ is status 201': (r) => r.status === 201 }) || console.error(`❌ Transaction creation failed: ${createRes.body}`);
    });

    group('🔹 Get All Transactions', function () {
        let getRes = http.get(`${BASE_URL}`, authHeaders);
        check(getRes, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Fetch transactions failed: ${getRes.body}`);
    });

  

    sleep(1); // Sleep to simulate delay between requests
}
