const express = require('express');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Database = require('./config/database');
const User = require('./models/User');
const createApiRoutes = require('./routes/api');
const createWebRoutes = require('./routes/web');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const database = new Database();
const db = database.getConnection();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static('public'));

// Auto logout inactive users (run every 5 minutes)
const userModel = new User(db);
setInterval(async () => {
  try {
    await userModel.deactivateInactive();
  } catch (error) {
    console.error('Error deactivating inactive users:', error);
  }
}, 300000);

// Routes
app.use('/', createWebRoutes());
app.use('/api', createApiRoutes(db));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  database.close();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});