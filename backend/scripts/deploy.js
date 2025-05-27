const hre = require("hardhat");
 const fs = require("fs");
 const path = require("path");
 
 async function main() {
   // 部署GameToken合约
   const GameToken = await hre.ethers.getContractFactory("GameToken");
   const gameToken = await GameToken.deploy();
   await gameToken.deployed();
   console.log("GameToken deployed to:", gameToken.address);
 
   // 部署GuessNumberGame合约
   const GuessNumberGame = await hre.ethers.getContractFactory("GuessNumberGame");
   const guessNumberGame = await GuessNumberGame.deploy(gameToken.address);
   await guessNumberGame.deployed();
   console.log("GuessNumberGame deployed to:", guessNumberGame.address);
   
   // 更新后端.env文件
   updateEnvFile(
     path.join(__dirname, '..', '.env'),
     gameToken.address,
     guessNumberGame.address
   );
   
   // 更新前端合约地址文件
   updateFrontendConfig(
     path.join(__dirname, '..', '..', 'front_end', 'src', 'api', 'constants', 'contracts.js'),
     gameToken.address,
     guessNumberGame.address
   );
 }
 
 function updateEnvFile(envPath, tokenAddress, gameAddress) {
   try {
     let envContent = fs.readFileSync(envPath, 'utf8');
     envContent = envContent.replace(/GAME_TOKEN_ADDRESS=.*/, `GAME_TOKEN_ADDRESS=${tokenAddress}`);
     envContent = envContent.replace(/GUESS_NUMBER_GAME_ADDRESS=.*/, `GUESS_NUMBER_GAME_ADDRESS=${gameAddress}`);
     fs.writeFileSync(envPath, envContent);
     console.log('Updated .env file with new contract addresses');
   } catch (error) {
     console.error('Error updating .env file:', error);
   }
 }
 
 function updateFrontendConfig(configPath, tokenAddress, gameAddress) {
   try {
     let configContent = fs.readFileSync(configPath, 'utf8');
     const tokenRegex = /(TOKEN_CONTRACT:\s*['"]).*([\'"])/;
     const gameRegex = /(GAME_CONTRACT:\s*['"]).*([\'"])/;
     
     configContent = configContent.replace(tokenRegex, `$1${tokenAddress}$2`);
     configContent = configContent.replace(gameRegex, `$1${gameAddress}$2`);
     
     fs.writeFileSync(configPath, configContent);
     console.log('Updated frontend contract addresses');
   } catch (error) {
     console.error('Error updating frontend config:', error);
   }
 }
 
 main()
   .then(() => process.exit(0))
   .catch((error) => {
     console.error(error);
     process.exit(1);
   });