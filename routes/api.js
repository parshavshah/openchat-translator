
const express = require('express');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const MessageController = require('../controllers/MessageController');

function createApiRoutes(db) {
  const router = express.Router();

  // Initialize controllers
  const authController = new AuthController(db);
  const userController = new UserController(db);
  const messageController = new MessageController(db);

  // Auth routes
  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/logout', (req, res) => authController.logout(req, res));
  router.get('/me', (req, res) => authController.getCurrentUser(req, res));

  // User routes
  router.get('/users', (req, res) => userController.getActiveUsers(req, res));

  // Message routes
  router.post('/messages', (req, res) => messageController.sendMessage(req, res));
  router.get('/messages', (req, res) => messageController.getMessages(req, res));

  return router;
}

module.exports = createApiRoutes;
