

const OpenAI = require('openai');

class TranslationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async translate(message, fromLanguage, toLanguage) {
    if (fromLanguage === toLanguage) {
      return message;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a translator. Translate the following message from ${fromLanguage} to ${toLanguage}. Only return the translated text, nothing else.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation error:', error);
      return `[Translation failed] ${message}`;
    }
  }
}

module.exports = TranslationService;
