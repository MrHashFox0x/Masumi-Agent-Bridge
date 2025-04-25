const TelegramBot = require('node-telegram-bot-api');
const messageProcessor = require('../processors/messageProcessor');
const ethers = require('ethers');
const contractABI = require('../../artifacts/contracts/AgentBridgeAuth.sol/AgentBridgeAuth.json').abi;

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
bot.setWebHook(`${process.env.SERVER_URL}/webhook/telegram`);

// Initialize contract interaction
const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

// Bot command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Bienvenue sur AgentBridge! Je vais vous aider à interagir avec les agents Masumi. Voici quelques commandes:\n\n" +
    "/link <adresse_wallet> - Lier votre portefeuille\n" +
    "/agent <nom_agent> - Sélectionner un agent Masumi\n" +
    "/help - Afficher l'aide");
});

// Link wallet command
bot.onText(/\/link (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const walletAddress = match[1];
  
  try {
    // Vérifier si l'adresse est valide
    if (!ethers.utils.isAddress(walletAddress)) {
      bot.sendMessage(chatId, "Adresse invalide. Veuillez fournir une adresse Ethereum valide.");
      return;
    }
    
    bot.sendMessage(chatId, `Pour lier votre compte, veuillez signer un message avec votre portefeuille. Instructions envoyées par message privé.`);
    
    // Dans un vrai projet, vous auriez ici un flow de signature pour vérifier
    // que l'utilisateur possède bien le portefeuille
  } catch (error) {
    console.error('Error linking wallet:', error);
    bot.sendMessage(chatId, "Une erreur s'est produite lors de la liaison de votre portefeuille.");
  }
});

// Handle regular messages
async function handleWebhook(data) {
  if (!data.message) return;
  
  const chatId = data.message.chat.id;
  const text = data.message.text;
  
  if (text && !text.startsWith('/')) {
    try {
      // Vérifier si l'utilisateur est enregistré
      const telegramId = chatId.toString();
      const userAddress = await contract.getAddressFromTelegram(telegramId);
      
      if (userAddress === '0x0000000000000000000000000000000000000000') {
        bot.sendMessage(chatId, "Vous devez d'abord lier votre portefeuille avec /link <adresse_wallet>");
        return;
      }
      
      // Traiter le message
      const response = await messageProcessor.processMessage(text, 'telegram', telegramId);
      bot.sendMessage(chatId, response);
      
    } catch (error) {
      console.error('Error processing message:', error);
      bot.sendMessage(chatId, "Une erreur s'est produite lors du traitement de votre message.");
    }
  }
}

module.exports = {
  bot,
  handleWebhook
};
