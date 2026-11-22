const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// Serve frontend files
app.use(express.static(path.join(__dirname, '../')));


// File paths
const bookingsFile = path.join(__dirname, 'bookings.json');
const feedbackFile = path.join(__dirname, 'feedback.json');

// Helper functions
function readData(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- USER APIs ----------

// Save booking
app.post('/api/booking', (req, res) => {
  const bookings = readData(bookingsFile);
  bookings.push(req.body);
  writeData(bookingsFile, bookings);
  res.json({ message: 'Booking saved successfully' });
});

// Save feedback
app.post('/api/feedback', (req, res) => {
  const feedback = readData(feedbackFile);
  feedback.push(req.body);
  writeData(feedbackFile, feedback);
  res.json({ message: 'Feedback saved successfully' });
});

// ---------- ADMIN APIs ----------

// Simple admin auth (exam purpose)
function adminOnly(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== 'admin123') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
}

// Download bookings
app.get('/api/admin/bookings', adminOnly, (req, res) => {
  res.download(bookingsFile);
});

// Download feedback
app.get('/api/admin/feedback', adminOnly, (req, res) => {
  res.download(feedbackFile);
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
