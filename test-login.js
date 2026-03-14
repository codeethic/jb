// Quick test script for login endpoint
const http = require('http');

const data = JSON.stringify({
  email: 'chef@demo.com',
  password: 'password123',
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
    try {
      const parsed = JSON.parse(body);
      console.log('PARSED:', JSON.stringify(parsed, null, 2));
    } catch {}
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
  console.error('Make sure the API is running: cd apps/api && pnpm dev');
});

req.write(data);
req.end();
