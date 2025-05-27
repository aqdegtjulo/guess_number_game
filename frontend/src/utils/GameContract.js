// 与GuessNumberGameETH智能合约交互的工具类
import { ethers } from 'ethers';

// GuessNumberGameETH合约的ABI
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "action",
        "type": "string"
      }
    ],
    "name": "AdminAction",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "number",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winningNumber",
        "type": "uint256"
      }
    ],
    "name": "GameEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "GameReady",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "GameStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxPlayers",
        "type": "uint256"
      }
    ],
    "name": "MaxPlayersSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "currentPlayers",
        "type": "uint256"
      }
    ],
    "name": "PlayerJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardsDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      }
    ],
    "name": "TestModeChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_NUMBER",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_BET",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_NUMBER",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentGame",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "winningNumber",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalBets",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalPlayers",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isDrawn",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "drawWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGameStatus",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalBets",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalPlayers",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isDrawn",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "winningNumber",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentMaxPlayers",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "maxPlayersSet",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerBet",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "betAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "number",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTestMode",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinnerCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isAdmin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isMaxPlayersSet",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxPlayers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "number",
        "type": "uint256"
      }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxPlayers",
        "type": "uint256"
      }
    ],
    "name": "setMaxPlayers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_enabled",
        "type": "bool"
      }
    ],
    "name": "setTestMode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_number",
        "type": "uint256"
      }
    ],
    "name": "setWinningNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startNewGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "testMode",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// 从合约地址文件中获取合约地址
const GameContract = async (web3Instance) => {
  try {
    // 验证web3实例
    if (!web3Instance || !web3Instance.eth) {
      throw new Error("无效的web3实例，请确保浏览器已连接到以太坊网络");
    }

    // 先测试网络连通性
    let isNodeRunning = false;
    try {
      await web3Instance.eth.getBlockNumber();
      isNodeRunning = true;
    } catch (netError) {
      console.error("无法连接到区块链节点，请确保节点已启动: ", netError);
      throw new Error("无法连接到区块链节点，请确保 Hardhat 节点已启动并运行在端口 8545");
    }

    // 获取合约地址
    let contractAddress;
    try {
      // 使用更可靠的方式加载合约地址文件
      const response = await fetch('/contract-address.json', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`加载合约地址文件失败: ${response.status} ${response.statusText}`);
      }
      
      const addresses = await response.json();
      contractAddress = addresses.GAME_CONTRACT;
      
      if (!contractAddress) {
        throw new Error("合约地址文件中没有找到GAME_CONTRACT地址");
      }
      
      console.log("从配置文件加载的合约地址:", contractAddress);
    } catch (error) {
      console.warn("加载合约地址文件失败，使用Hardhat默认地址:", error);
      // Hardhat本地网络的默认部署地址
      contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    }

    // 检查网络是否是Hardhat网络
    try {
      const networkId = await web3Instance.eth.net.getId();
      console.log("当前网络ID:", networkId);
      
      if (networkId !== 1337 && networkId !== 31337) {
        console.warn(`警告：当前连接的网络 ID ${networkId} 不是Hardhat本地网络 (chainId: 1337/31337)，可能会导致连接问题。`);
      }
    } catch (error) {
      console.warn("无法获取网络信息:", error);
    }

    // 验证合约地址
    if (!web3Instance.utils.isAddress(contractAddress)) {
      throw new Error(`无效的合约地址: ${contractAddress}`);
    }

    // 创建合约实例
    const contract = new web3Instance.eth.Contract(
      contractABI,
      contractAddress
    );
    
    // 验证合约存在
    try {
      await contract.methods.getGameStatus().call();
    } catch (error) {
      console.error("无法调用合约方法，可能合约未部署或地址错误:", error);
      throw new Error("无法连接到游戏合约，请确保合约已部署并且地址正确");
    }
    
    return contract;
  } catch (error) {
    console.error("创建合约实例失败:", error);
    throw error;
  }
};

export default GameContract;