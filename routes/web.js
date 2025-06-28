
const express = require('express');
const ViewController = require('../controllers/ViewController');

function createWebRoutes() {
  const router = express.Router();
  const viewController = new ViewController();

  // Web routes
  router.get('/', (req, res) => viewController.home(req, res));
  router.get('/login', (req, res) => viewController.login(req, res));
  router.get('/dashboard', (req, res) => viewController.dashboard(req, res));

  return router;
}

module.exports = createWebRoutes;
