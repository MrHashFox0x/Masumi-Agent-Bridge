const { Client, GatewayIntentBits } = require('discord.js');
const messageProcessor = require('../processors/messageProcessor');
const ethers = require('ethers');
const contractABI = require('../../artifacts/contracts/AgentBridgeAuth.sol/AgentBridgeAuth.json').abi;

// Initialize Discord client
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Initialize contract interaction
const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

// Handle ready event
client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

// Handle message events
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Process commands
  if (message.content.startsWith('!')) {
    const command = message.content.slice(1).split(' ')[0];
    const args = message.content.slice(command.length + 2);
    
    if (command === 'link') {
      // Process wallet linking
      try {
        const walletAddress = args.trim();
        
        if (!ethers.utils.isAddress(walletAddress)) {
          message.reply("Adresse invalide. Veuillez fournir une adresse Ethereum valide.");
          return;
        }
        
        message.reply(`Pour lier votre compte Discord à l'adresse ${walletAddress}, veuillez signer un message avec votre portefeuille. Je vous ai envoyé les instructions en message privé.`);
        
        // Dans un vrai projet, vous auriez ici un flow de signature
      } catch (error) {
        console.error('Error linking wallet:', error);
        message.reply("Une erreur s'est produite lors de la liaison de votre portefeuille.");
      }
    } else if (command === 'help') {
      message.reply("Voici les commandes disponibles:\n\n" +
                   "!link <adresse_wallet> - Lier votre portefeuille\n" +
                   "!agent <nom_agent> - Sélectionner un agent Masumi\n" +
                   "!help - Afficher cette aide");
    }
  } else {
    // Handle regular messages
    try {
      // Vérifier si l'utilisateur est enregistré
      const discordId = message.author.id;
      const userAddress = await contract.getAddressFromDiscord(discordId);
      
      if (userAddress === '0x0000000000000000000000000000000000000000') {
        // Ignorer les messages des utilisateurs non liés (optionnel)
        return;
      }
      
      // Traiter le message uniquement s'il mentionne le bot ou est en message privé
      if (message.mentions.has(client.user) || message.channel.type === 'DM') {
        // Enlever la mention du bot si présente
        const content = message.content.replace(/<@!?\d+>/g, '').trim();
        
        if (content) {
          const response = await messageProcessor.processMessage(content, 'discord', discordId);
          message.reply(response);
        }
      }
      
    } catch (error) {
      console.error('Error processing Discord message:', error);
    }
  }
});

// Initialize the Discord bot
function initialize() {
  client.login(process.env.DISCORD_TOKEN);
}

module.exports = {
  client,
  initialize
};
