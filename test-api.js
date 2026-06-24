const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5005,
  path: '/api/events',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data || 'empty'));
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
