class Message {
  constructor(db) {
    this.db = db;
  }

  // Create a new message
  async create(senderId, recipientId, originalMessage, translatedMessage, senderLanguage, recipientLanguage) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO messages (sender_id, recipient_id, original_message, translated_message, sender_language, recipient_language) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [senderId, recipientId, originalMessage, translatedMessage, senderLanguage, recipientLanguage],
        function (err) {
          if (err) reject(err);
          else resolve({
            id: this.lastID,
            originalMessage,
            translatedMessage
          });
        }
      );
    });
  }

  // Get messages for a user (sent or received)
  async getByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT m.*, 
                sender.name as sender_name, 
                recipient.name as recipient_name,
                sender.language as sender_language,
                recipient.language as recipient_language
         FROM messages m
         JOIN users sender ON m.sender_id = sender.id
         JOIN users recipient ON m.recipient_id = recipient.id
         WHERE m.sender_id = ? OR m.recipient_id = ?
         ORDER BY m.timestamp DESC
         LIMIT 50`,
        [userId, userId],
        (err, rows) => {
          if (err) reject(err);
          else {
            const messages = rows.map(row => ({
              id: row.id,
              senderName: row.sender_name,
              recipientName: row.recipient_name,
              originalMessage: row.original_message,
              translatedMessage: row.translated_message,
              senderLanguage: row.sender_language,
              recipientLanguage: row.recipient_language,
              timestamp: row.timestamp,
              isSent: row.sender_id === userId,
              displayMessage: row.sender_id === userId ? row.original_message : row.translated_message
            }));
            resolve(messages);
          }
        }
      );
    });
  }
}

module.exports = Message;
