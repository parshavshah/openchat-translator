class User {
  constructor(db) {
    this.db = db;
  }

  // Create user or reactivate existing user
  async create(name, language) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO users (name, language, last_activity, is_active) VALUES (?, ?, CURRENT_TIMESTAMP, 1)`,
        [name, language],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, language });
        }
      );
    });
  }

  // Find user by name and active status
  async findByName(name) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE name = ? AND is_active = 1`,
        [name],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Get all active users except current user
  async getActiveUsers(excludeId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, name, language FROM users WHERE is_active = 1 AND id != ?`,
        [excludeId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Update user's last activity
  async updateActivity(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = ?`,
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Mark user as inactive
  async deactivate(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET is_active = 0 WHERE id = ?`,
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Auto-logout inactive users
  async deactivateInactive() {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET is_active = 0 WHERE last_activity < ? AND is_active = 1`,
        [oneHourAgo],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Find user by ID
  async findById(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE id = ? AND is_active = 1`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
}

module.exports = User;
