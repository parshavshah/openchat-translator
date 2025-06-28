
const User = require('../models/User');

class UserController {
  constructor(db) {
    this.userModel = new User(db);
  }

  async getActiveUsers(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      // Update current user's last activity
      await this.userModel.updateActivity(req.session.userId);

      // Get all active users except current user
      const users = await this.userModel.getActiveUsers(req.session.userId);

      res.json({ users });
    } catch (error) {
      console.error('Error loading users:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = UserController;
