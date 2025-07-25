import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 10 },  // Ramp up to 10 users
        { duration: '30s', target: 50 },  // Stay at 50 users
        { duration: '10s', target: 0 },   // Ramp down
    ],
};

const BASE_URL = 'http://localhost:5000/api/reports';  // Replace with your actual URL
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGZhOGQzMGY0ZjcwOGVkNjI3MTFhZCIsImlhdCI6MTc0MjcxMTAxNSwiZXhwIjoxNzQ1MzAzMDE1fQ.p1dGLWTReorFDyOZ1ezLyP1ZpmBIr6bahrsdSAHQnE8'; // Replace with an actual auth token

export default function () {
    let authHeaders = { headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' } };

    group('🔹 Get Spending Trends', function () {
        let queryParams = {
            startDate: '2025-01-01', 
            endDate: '2025-02-01',
        };
        let url = `${BASE_URL}/spending-trends?startDate=${queryParams.startDate}&endDate=${queryParams.endDate}`;

        let res = http.get(url, authHeaders);
        check(res, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Spending trends failed: ${res.body}`);
    });

    group('🔹 Get Income vs Expenses', function () {
        let queryParams = {
            startDate: '2025-01-01', 
            endDate: '2025-02-01',
        };
        let url = `${BASE_URL}/income-vs-expenses?startDate=${queryParams.startDate}&endDate=${queryParams.endDate}`;

        let res = http.get(url, authHeaders);
        check(res, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Income vs expenses failed: ${res.body}`);
    });

    group('🔹 Get Budget Summary', function () {
        let queryParams = {
            startDate: '2025-01-01', 
            endDate: '2025-02-01',
        };
        let url = `${BASE_URL}/budget-summary?startDate=${queryParams.startDate}&endDate=${queryParams.endDate}`;

        let res = http.get(url, authHeaders);
        check(res, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Budget summary failed: ${res.body}`);
    });

    sleep(1);  // Sleep between each iteration to simulate user delay
}
