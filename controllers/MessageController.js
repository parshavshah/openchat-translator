
const User = require('../models/User');
const Message = require('../models/Message');
const TranslationService = require('../services/TranslationService');

class MessageController {
  constructor(db) {
    this.userModel = new User(db);
    this.messageModel = new Message(db);
    this.translationService = new TranslationService();
  }

  async sendMessage(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({ error: 'Recipient ID and message are required' });
    }

    try {
      // Get recipient's information
      const recipient = await this.userModel.findById(recipientId);

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found or offline' });
      }

      // Translate message if languages are different
      const translatedMessage = await this.translationService.translate(
        message,
        req.session.userLanguage,
        recipient.language
      );

      // Save message to database
      const savedMessage = await this.messageModel.create(
        req.session.userId,
        recipientId,
        message,
        translatedMessage,
        req.session.userLanguage,
        recipient.language
      );

      // Update sender's last activity
      await this.userModel.updateActivity(req.session.userId);

      res.json({
        success: true,
        messageId: savedMessage.id,
        originalMessage: savedMessage.originalMessage,
        translatedMessage: savedMessage.translatedMessage
      });
    } catch (error) {
      console.error('Message sending error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  async getMessages(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      // Update current user's last activity
      await this.userModel.updateActivity(req.session.userId);

      // Get messages for current user
      const messages = await this.messageModel.getByUserId(req.session.userId);

      res.json({ messages });
    } catch (error) {
      console.error('Error loading messages:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = MessageController;
