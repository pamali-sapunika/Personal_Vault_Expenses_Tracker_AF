import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 10 }, // Ramp up to 10 users
        { duration: '30s', target: 50 }, // Stay at 50 users
        { duration: '10s', target: 0 },  // Ramp down
    ],
};

const BASE_URL = 'http://localhost:5000/api/users';

export default function () {
    let authToken = '';

    group('🔹 Register a New User', function () {
        let registerPayload = JSON.stringify({
            name: 'New User',
            email: `newuser${Math.random()}@example.com`,
            password: 'password123',
            role: 'user'
        });

        let params = { headers: { 'Content-Type': 'application/json' } };
        let registerRes = http.post(`${BASE_URL}/register`, registerPayload, params);

        check(registerRes, { '✅ is status 201': (r) => r.status === 201 }) || console.error(`❌ Register failed: ${registerRes.body}`);
    },10000);

    group('🔹 Authenticate User', function () {
        let loginPayload = JSON.stringify({
              email: "pmli@gmail.com",
  password: "pmli"
        });

        let params = { headers: { 'Content-Type': 'application/json' } };
        let loginRes = http.post(`${BASE_URL}/login`, loginPayload, params);

        check(loginRes, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Login failed: ${loginRes.body}`);

        if (loginRes.status === 200) {
            try {
                let loginData = JSON.parse(loginRes.body);
                authToken = loginData.token;
            } catch (error) {
                console.error('❌ Error parsing login response:', error);
            }
        }
    });

    if (!authToken) {
        console.error('❌ No token received, stopping execution.');
        return;
    }

    let authHeaders = { headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' } };

    group('🔹 Fetch All Users', function () {
        let usersRes = http.get(`${BASE_URL}`, authHeaders);
        check(usersRes, { '✅ is status 200': (r) => r.status === 200 }) || console.error(`❌ Fetch users failed: ${usersRes.body}`);
    });

    sleep(1);
}
