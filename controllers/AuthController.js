
const User = require('../models/User');

class AuthController {
  constructor(db) {
    this.userModel = new User(db);
  }

  async login(req, res) {
    const { name, language } = req.body;

    if (!name || !language) {
      return res.status(400).json({ error: 'Name and language are required' });
    }

    try {
      // Check if user already exists and is active
      const existingUser = await this.userModel.findByName(name);

      if (existingUser) {
        // User already logged in
        req.session.userId = existingUser.id;
        req.session.userName = existingUser.name;
        req.session.userLanguage = existingUser.language;

        // Update last activity
        await this.userModel.updateActivity(existingUser.id);

        return res.json({
          success: true,
          user: {
            id: existingUser.id,
            name: existingUser.name,
            language: existingUser.language
          }
        });
      }

      // Create new user or reactivate existing user
      const user = await this.userModel.create(name, language);

      req.session.userId = user.id;
      req.session.userName = name;
      req.session.userLanguage = language;

      res.json({ success: true, user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  async logout(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      // Mark user as inactive
      await this.userModel.deactivate(req.session.userId);

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to destroy session' });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  }

  getCurrentUser(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      id: req.session.userId,
      name: req.session.userName,
      language: req.session.userLanguage
    });
  }
}

module.exports = AuthController;
