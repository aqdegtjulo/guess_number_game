// 部署ETH版猜数字游戏合约的脚本（在Hardhat网络上）
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("开始部署GuessNumberGameETH合约到Hardhat网络...");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("使用账户地址:", deployer.address);
  console.log("账户余额:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // 部署GuessNumberGameETH合约
  const GuessNumberGameETH = await hre.ethers.getContractFactory("GuessNumberGameETH");
  const gameContract = await GuessNumberGameETH.deploy();

  await gameContract.deployed();
  console.log("GuessNumberGameETH合约已部署到地址:", gameContract.address);

  // 将合约地址保存到一个文件中，方便前端使用
  const contractAddresses = {
    GAME_CONTRACT: gameContract.address
  };

  // 准备目录路径
  const frontendDir = path.resolve(__dirname, "../../frontend/public");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const addressesPath = path.join(frontendDir, "contract-address.json");

  // 将合约地址写入到合约地址文件
  fs.writeFileSync(
    addressesPath,
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("合约地址已保存到文件:", addressesPath);

  // 提供测试账户信息
  console.log("\n可用于测试的账户:");
  const signers = await hre.ethers.getSigners();
  for (let i = 0; i < 5; i++) { // 只显示前5个账户
    console.log(`账户 ${i+1}: ${signers[i].address}`);
    console.log(`余额: ${hre.ethers.utils.formatEther(await signers[i].getBalance())} ETH\n`);
  }

  console.log("部署完成！使用 'npx hardhat node' 来启动本地节点并进行测试。");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
