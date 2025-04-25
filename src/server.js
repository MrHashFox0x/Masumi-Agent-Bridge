const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import platform handlers
const telegramHandler = require('./platforms/telegram');
const whatsappHandler = require('./platforms/whatsapp');
const discordHandler = require('./platforms/discord');

// Import message processor
const messageProcessor = require('./processors/messageProcessor');

// Create Express app
const app = express();
app.use(bodyParser.json());

// Route for Telegram webhook
app.post('/webhook/telegram', (req, res) => {
  telegramHandler.handleWebhook(req.body)
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error('Error processing Telegram webhook:', err);
      res.sendStatus(500);
    });
});

// Route for WhatsApp webhook
app.post('/webhook/whatsapp', (req, res) => {
  whatsappHandler.handleWebhook(req.body)
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error('Error processing WhatsApp webhook:', err);
      res.sendStatus(500);
    });
});

// Start Discord bot (no webhook needed, it uses a different mechanism)
discordHandler.initialize();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
