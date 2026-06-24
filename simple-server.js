const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simple in-memory storage
let events = [];

app.get('/api/events', (req, res) => {
  console.log('GET /api/events - returning', events.length, 'events');
  res.json(events);
});

app.post('/api/events', (req, res) => {
  console.log('POST /api/events - saving event');
  events = req.body;
  res.json({ success: true });
});

app.get('/api/offices', (req, res) => {
  res.json({});
});

app.post('/api/offices', (req, res) => {
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  res.json([]);
});

app.post('/api/users', (req, res) => {
  res.json({ success: true });
});

app.get('/api/active-menu', (req, res) => {
  res.json({ menu: 'dashboard' });
});

app.post('/api/active-menu', (req, res) => {
  res.json({ success: true });
});

app.post('/api/sync-all', (req, res) => {
  if (req.body.events) events = req.body.events;
  res.json({ success: true });
});

const PORT = 5005;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test: curl http://localhost:${PORT}/api/events`);
});
