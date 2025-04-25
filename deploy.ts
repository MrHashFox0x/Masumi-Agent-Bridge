const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`);
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Deploying contracts with the account:", wallet.address);
  
  const AgentBridgeAuth = await ethers.getContractFactory("AgentBridgeAuth", wallet);
  const auth = await AgentBridgeAuth.deploy();
  
  await auth.deployed();
  
  console.log("AgentBridgeAuth deployed to:", auth.address);
  
  // Ajoutez l'adresse du contrat à votre fichier .env
  console.log("Mise à jour de votre fichier .env avec l'adresse du contrat...");
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  const updatedEnv = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${auth.address}`);
  fs.writeFileSync('.env', updatedEnv);
  
  console.log("Configuration terminée!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
