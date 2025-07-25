import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 10 },  // Ramp up to 10 users
        { duration: '30s', target: 50 },  // Stay at 50 users
        { duration: '10s', target: 0 },   // Ramp down
    ],
};

const BASE_URL = 'http://localhost:5000/api/budgets'; // Replace with your actual base URL
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGZhOGQzMGY0ZjcwOGVkNjI3MTFhZCIsImlhdCI6MTc0MjcxMTAxNSwiZXhwIjoxNzQ1MzAzMDE1fQ.p1dGLWTReorFDyOZ1ezLyP1ZpmBIr6bahrsdSAHQnE8'; // Replace with an actual auth token

export default function () {
    let authHeaders = { headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' } };

    group('🔹 Set a New Budget', function () {
        let budgetData = JSON.stringify({
            category: 'Food',
            limit: 500,
            month: '2025-03',
        });

        let setRes = http.post(`${BASE_URL}`, budgetData, authHeaders);
        check(setRes, { '✅ is status 201': (r) => r.status === 201 }) || console.error(`❌ Budget creation failed: ${setRes.body}`);
    });

    group('🔹 Get All Budgets', function () {
        let getRes = http.get(`${BASE_URL}`, authHeaders);
        check(getRes, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Fetch budgets failed: ${getRes.body}`);
    });

    group('🔹 Check Budget Notifications', function () {
        let notificationsRes = http.get(`${BASE_URL}/notifications`, authHeaders);
        check(notificationsRes, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Fetch notifications failed: ${notificationsRes.body}`);
    });

    group('🔹 Get Budget Adjustment Recommendations', function () {
        let recommendationsRes = http.get(`${BASE_URL}/recommendations`, authHeaders);
        check(recommendationsRes, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Fetch recommendations failed: ${recommendationsRes.body}`);
    });

    sleep(1); // Sleep to simulate delay between requests
}
