const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const messageProcessor = require('../processors/messageProcessor');
const ethers = require('ethers');
const contractABI = require('../../artifacts/contracts/AgentBridgeAuth.sol/AgentBridgeAuth.json').abi;

// Initialize WhatsApp client
const client = new Client({
  puppeteer: {
    args: ['--no-sandbox']
  }
});

// Initialize contract interaction
const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

// Generate QR Code for WhatsApp Web
client.on('qr', (qr) => {
  console.log('QR REÇU, scannez-le avec WhatsApp sur votre téléphone:');
  qrcode.generate(qr, { small: true });
});

// Handle ready event
client.on('ready', () => {
  console.log('Client WhatsApp connecté!');
});

// Handle message events
client.on('message', async msg => {
  const content = msg.body;
  
  // Process commands
  if (content.startsWith('!')) {
    const command = content.slice(1).split(' ')[0];
    const args = content.slice(command.length + 2);
    
    if (command === 'link') {
      // Process wallet linking
      try {
        const walletAddress = args.trim();
        
        if (!ethers.utils.isAddress(walletAddress)) {
          msg.reply("Adresse invalide. Veuillez fournir une adresse Ethereum valide.");
          return;
        }
        
        msg.reply(`Pour lier votre compte à l'adresse ${walletAddress}, veuillez signer un message avec votre portefeuille.`);
        
        // Dans un vrai projet, vous auriez ici un flow de signature
      } catch (error) {
        console.error('Error linking wallet:', error);
        msg.reply("Une erreur s'est produite lors de la liaison de votre portefeuille.");
      }
    } else if (command === 'help') {
      msg.reply("Voici les commandes disponibles:\n\n" +
               "!link <adresse_wallet> - Lier votre portefeuille\n" +
               "!agent <nom_agent> - Sélectionner un agent Masumi\n" +
               "!help - Afficher cette aide");
    }
  } else {
    // Handle regular messages
    try {
      // Vérifier si l'utilisateur est enregistré
      const whatsappId = msg.from;
      const userAddress = await contract.getAddressFromWhatsapp(whatsappId);
      
      if (userAddress === '0x0000000000000000000000000000000000000000') {
        msg.reply("Vous devez d'abord lier votre portefeuille avec !link <adresse_wallet>");
        return;
      }
      
      const response = await messageProcessor.processMessage(content, 'whatsapp', whatsappId);
      msg.reply(response);
      
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      msg.reply("Une erreur s'est produite lors du traitement de votre message.");
    }
  }
});

// Initialize WhatsApp client
client.initialize();

// Pour la version hackathon, nous utilisons un webhook simulé
async function handleWebhook(data) {
  console.log("Webhook WhatsApp reçu, mais cette fonctionnalité n'est pas implémentée dans la version simplifiée");
  // Dans un vrai projet, vous devriez intégrer l'API Business de WhatsApp
  return true;
}

module.exports = {
  client,
  handleWebhook
};
