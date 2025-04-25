// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgentBridgeAuth {
    address public owner;
    
    // Mapping from user address to their messaging platform IDs
    mapping(address => string) public telegramIds;
    mapping(address => string) public whatsappIds;
    mapping(address => string) public discordIds;
    
    // Mapping from messaging platform IDs to user addresses
    mapping(string => address) public telegramToAddress;
    mapping(string => address) public whatsappToAddress;
    mapping(string => address) public discordToAddress;
    
    // User preferences
    struct UserPreferences {
        bool receiveAlerts;
        string preferredAgent;
        string language;
    }
    
    mapping(address => UserPreferences) public userPreferences;
    
    event UserLinked(address indexed user, string platform, string platformId);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function linkTelegramAccount(string memory telegramId) public {
        telegramIds[msg.sender] = telegramId;
        telegramToAddress[telegramId] = msg.sender;
        emit UserLinked(msg.sender, "telegram", telegramId);
    }
    
    function linkWhatsappAccount(string memory whatsappId) public {
        whatsappIds[msg.sender] = whatsappId;
        whatsappToAddress[whatsappId] = msg.sender;
        emit UserLinked(msg.sender, "whatsapp", whatsappId);
    }
    
    function linkDiscordAccount(string memory discordId) public {
        discordIds[msg.sender] = discordId;
        discordToAddress[discordId] = msg.sender;
        emit UserLinked(msg.sender, "discord", discordId);
    }
    
    function setPreferences(bool _receiveAlerts, string memory _preferredAgent, string memory _language) public {
        userPreferences[msg.sender] = UserPreferences({
            receiveAlerts: _receiveAlerts,
            preferredAgent: _preferredAgent,
            language: _language
        });
    }
    
    function getAddressFromTelegram(string memory telegramId) public view returns (address) {
        return telegramToAddress[telegramId];
    }
    
    function getAddressFromWhatsapp(string memory whatsappId) public view returns (address) {
        return whatsappToAddress[whatsappId];
    }
    
    function getAddressFromDiscord(string memory discordId) public view returns (address) {
        return discordToAddress[discordId];
    }
    
    function getUserPreferences(address user) public view returns (UserPreferences memory) {
        return userPreferences[user];
    }
}
