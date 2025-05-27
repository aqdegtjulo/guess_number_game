// Hardhat辅助工具，用于与Hardhat网络进行交互
const { ethers } = require("hardhat");

/**
 * 在Hardhat网络上测试游戏交互
 */
async function testGameInteraction() {
  console.log("开始测试游戏交互...");
  
  // 获取账户
  const [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();
  console.log("测试账户:");
  console.log(`账户1: ${owner.address}`);
  console.log(`账户2: ${player1.address}`);
  console.log(`账户3: ${player2.address}`);
  console.log(`账户4: ${player3.address}`);
  console.log(`账户5: ${player4.address}`);
  console.log(`账户6: ${player5.address}`);
  
  // 部署合约
  console.log("\n部署游戏合约...");
  const GuessNumberGameETH = await ethers.getContractFactory("GuessNumberGameETH");
  const gameContract = await GuessNumberGameETH.deploy();
  await gameContract.deployed();
  console.log(`合约已部署到地址: ${gameContract.address}`);
  
  // 测试下注
  console.log("\n测试下注功能...");
  const betAmount = ethers.utils.parseEther("0.01");
  
  await gameContract.connect(player2).placeBet(10, { value: betAmount });
  console.log("玩家1下注成功");
  
  await gameContract.connect(player3).placeBet(20, { value: betAmount });
  console.log("玩家2下注成功");
  
  await gameContract.connect(player4).placeBet(30, { value: betAmount });
  console.log("玩家3下注成功");
  
  await gameContract.connect(player5).placeBet(40, { value: betAmount });
  console.log("玩家4下注成功");
  
  await gameContract.connect(player6).placeBet(50, { value: betAmount });
  console.log("玩家5下注成功");
  
  // 检查游戏状态
  const gameStatus = await gameContract.getGameStatus();
  console.log("\n游戏状态:");
  console.log(`游戏ID: ${gameStatus.gameId}`);
  console.log(`玩家数量: ${gameStatus.totalPlayers}`);
  console.log(`游戏是否活跃: ${gameStatus.isActive}`);
  console.log(`游戏是否已开奖: ${gameStatus.isDrawn}`);
  
  // 开奖
  console.log("\n执行开奖...");
  await gameContract.drawWinner();
  
  // 检查开奖后状态
  const afterDrawStatus = await gameContract.getGameStatus();
  console.log("\n开奖后游戏状态:");
  console.log(`游戏是否活跃: ${afterDrawStatus.isActive}`);
  console.log(`游戏是否已开奖: ${afterDrawStatus.isDrawn}`);
  console.log(`中奖数字: ${afterDrawStatus.winningNumber}`);
  
  // 测试开始新游戏
  console.log("\n测试开始新游戏...");
  await gameContract.startNewGame();
  
  // 检查新游戏状态
  const newGameStatus = await gameContract.getGameStatus();
  console.log("\n新游戏状态:");
  console.log(`游戏ID: ${newGameStatus.gameId}`);
  console.log(`玩家数量: ${newGameStatus.totalPlayers}`);
  console.log(`游戏是否活跃: ${newGameStatus.isActive}`);
  console.log(`游戏是否已开奖: ${newGameStatus.isDrawn}`);
  
  console.log("\n测试完成！");
}

// 导出辅助函数
module.exports = {
  testGameInteraction
};
