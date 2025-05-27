require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337, // 使用与Ganache相同的链ID以方便前端兼容
      accounts: {
        count: 10, // 预设10个测试账户
        accountsBalance: "1000000000000000000000" // 每个账户1000 ETH
      },
      allowUnlimitedContractSize: true, // 允许大尺寸合约部署
      blockGasLimit: 12000000 // 设置区块gas限制
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};