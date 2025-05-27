// 专门测试开始新游戏功能的脚本
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("测试开始新游戏功能...");

  // 获取账户
  const [deployer, player1, player2, player3, player4, player5] = await hre.ethers.getSigners();
  console.log("使用部署账户:", deployer.address);

  // 读取现有合约地址（如果部署过）
  let gameContract;
  let contractAddress;
  
  try {
    // 尝试从合约地址文件读取
    const frontendDir = path.resolve(__dirname, "../../frontend/public");
    const addressesPath = path.join(frontendDir, "contract-address.json");
    
    if (fs.existsSync(addressesPath)) {
      const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
      contractAddress = addresses.GAME_CONTRACT;
      console.log("使用现有合约地址:", contractAddress);
      
      // 获取已部署合约
      const GuessNumberGameETH = await hre.ethers.getContractFactory("GuessNumberGameETH");
      gameContract = await GuessNumberGameETH.attach(contractAddress);
    } else {
      // 重新部署合约
      console.log("找不到已部署合约地址，重新部署合约...");
      const GuessNumberGameETH = await hre.ethers.getContractFactory("GuessNumberGameETH");
      gameContract = await GuessNumberGameETH.deploy();
      await gameContract.deployed();
      contractAddress = gameContract.address;
      console.log("合约已部署到地址:", contractAddress);
      
      // 保存合约地址
      if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
      }
      
      fs.writeFileSync(
        addressesPath,
        JSON.stringify({ GAME_CONTRACT: contractAddress }, null, 2)
      );
      console.log("合约地址已保存到:", addressesPath);
    }
    
    // 检查当前游戏状态
    const gameStatus = await gameContract.getGameStatus();
    console.log("\n当前游戏状态:");
    console.log(`游戏ID: ${gameStatus.gameId}`);
    console.log(`玩家数量: ${gameStatus.totalPlayers}`);
    console.log(`总下注额: ${hre.ethers.utils.formatEther(gameStatus.totalBets)} ETH`);
    console.log(`游戏是否活跃: ${gameStatus.isActive}`);
    console.log(`游戏是否已开奖: ${gameStatus.isDrawn}`);
    
    // 如果游戏尚未开奖，模拟完整游戏过程
    if (!gameStatus.isDrawn) {
      console.log("\n模拟游戏过程...");
      
      // 检查是否已有玩家下注
      if (gameStatus.totalPlayers < 5) {
        const betAmount = hre.ethers.utils.parseEther("0.01");
        const remainingPlayers = 5 - gameStatus.totalPlayers;
        const players = [player1, player2, player3, player4, player5].slice(0, remainingPlayers);
        
        for (let i = 0; i < players.length; i++) {
          await gameContract.connect(players[i]).placeBet(10 + i * 10, { value: betAmount });
          console.log(`玩家${i+1}下注成功`);
        }
      }
      
      // 开奖
      console.log("\n执行开奖...");
      await gameContract.drawWinner();
      
      const afterDrawStatus = await gameContract.getGameStatus();
      console.log("\n开奖后游戏状态:");
      console.log(`游戏是否活跃: ${afterDrawStatus.isActive}`);
      console.log(`游戏是否已开奖: ${afterDrawStatus.isDrawn}`);
      console.log(`中奖数字: ${afterDrawStatus.winningNumber}`);
    }
    
    // 测试开始新游戏功能
    console.log("\n测试开始新游戏功能...");
    console.log("使用账户:", deployer.address);
    
    // 增加gas限制，避免交易失败
    const tx = await gameContract.startNewGame({
      gasLimit: 500000
    });
    
    // 等待交易确认
    console.log("等待交易确认...");
    await tx.wait();
    console.log("交易已确认，Hash:", tx.hash);
    
    // 检查新游戏状态
    const newGameStatus = await gameContract.getGameStatus();
    console.log("\n新游戏状态:");
    console.log(`游戏ID: ${newGameStatus.gameId}`);
    console.log(`玩家数量: ${newGameStatus.totalPlayers}`);
    console.log(`游戏是否活跃: ${newGameStatus.isActive}`);
    console.log(`游戏是否已开奖: ${newGameStatus.isDrawn}`);
    
    console.log("\n测试完成！");
  } catch (error) {
    console.error("测试过程中发生错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
