const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
    "name": "getGameStatus",
    "outputs": [
      {
        "internalType": "enum GuessNumberGameETH.GameStatus",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const contract = new web3.eth.Contract(contractABI, contractAddress);

Promise.all([
  contract.methods.MIN_BET().call(),
  contract.methods.MIN_NUMBER().call(),
  contract.methods.MAX_NUMBER().call(),
  contract.methods.getGameStatus().call()
]).then(values => {
  console.log({
    MIN_BET: values[0],
    MIN_NUMBER: values[1],
    MAX_NUMBER: values[2],
    gameStatus: values[3]
  });
}).catch(error => {
  console.error('Error:', error);
});