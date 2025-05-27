// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GuessNumberGameETH is ReentrancyGuard, Ownable {
    
    struct Game {
        uint256 gameId;
        uint256 winningNumber;
        uint256 totalBets;
        uint256 totalPlayers;
        bool isActive;
        bool isDrawn;
        mapping(address => uint256) playerBets;
        mapping(address => uint256) playerNumbers;
        address[] players;
    }
    
    Game public currentGame;
    uint256 public constant MIN_NUMBER = 1;
    uint256 public constant MAX_NUMBER = 100;
    uint256 public constant MIN_BET = 0.01 ether; // 最小下注金额为0.01 ETH
    uint256 public maxPlayers; // 最大玩家数量，由管理员设置
    bool public isMaxPlayersSet; // 是否已设置最大玩家数
    
    // 添加测试模式标志
    bool public testMode = false;
    
    // 管理员角色(已通过Ownable实现)
    
    event BetPlaced(address indexed player, uint256 number, uint256 amount);
    event GameStarted(uint256 gameId);
    event GameEnded(uint256 gameId, uint256 winningNumber);
    event RewardsDistributed(address indexed winner, uint256 amount);
    event PlayerJoined(address indexed player, uint256 currentPlayers);
    event GameReady(uint256 timestamp);
    event AdminAction(address indexed admin, string action);
    event TestModeChanged(bool enabled);
    event MaxPlayersSet(uint256 maxPlayers);
    
    constructor() {
        startNewGame();
    }
    
    // 添加设置测试模式的函数
    function setTestMode(bool _enabled) external {
        require(msg.sender == owner(), "Only contract owner can change test mode");
        testMode = _enabled;
        emit TestModeChanged(_enabled);
        emit AdminAction(msg.sender, _enabled ? "Enabled test mode" : "Disabled test mode");
    }
    
    // 添加设置中奖数字的函数（仅测试模式可用）
    function setWinningNumber(uint256 _number) external onlyOwner {
        require(testMode, "Cannot set winning number: test mode is not enabled");
        require(_number >= MIN_NUMBER && _number <= MAX_NUMBER, 
            string(abi.encodePacked(
                "Invalid winning number: must be between ",
                toString(MIN_NUMBER),
                " and ",
                toString(MAX_NUMBER)
            ))
        );
        currentGame.winningNumber = _number;
        emit AdminAction(msg.sender, "Set winning number for test");
    }
    
    /**
     * @dev 设置本局游戏的最大参与人数
     * @param _maxPlayers 最大参与人数
     */
    function setMaxPlayers(uint256 _maxPlayers) external onlyOwner {
        require(currentGame.isActive, "Cannot set max players: game is not active");
        require(!isMaxPlayersSet, "Cannot set max players: maximum players limit has already been set for this game");
        require(_maxPlayers > 0, "Invalid max players: value must be greater than 0");
        require(_maxPlayers <= 100, "Invalid max players: value cannot exceed 100 due to gas limit considerations");
        maxPlayers = _maxPlayers;
        isMaxPlayersSet = true;
        emit MaxPlayersSet(maxPlayers);
        emit AdminAction(msg.sender, string(abi.encodePacked("Set max players to ", toString(_maxPlayers))));
    }
    
    function startNewGame() public {
        require(msg.sender == owner(), "Only contract owner can start new game");
        require(!currentGame.isActive || currentGame.isDrawn, "Cannot start a new game: current game is still active and not drawn");
        // 只有在游戏结束后才能开始新游戏
        
        // 清空上一局游戏数据
        for (uint256 i = 0; i < currentGame.players.length; i++) {
            address player = currentGame.players[i];
            delete currentGame.playerBets[player];
            delete currentGame.playerNumbers[player];
        }
        
        delete currentGame.players;
        
        // 初始化新游戏
        currentGame.gameId++;
        currentGame.isActive = true;
        currentGame.isDrawn = false;
        currentGame.totalBets = 0;
        currentGame.totalPlayers = 0;
        isMaxPlayersSet = false; // 重置最大玩家设置状态
        
        emit GameStarted(currentGame.gameId);
        emit AdminAction(msg.sender, "Started new game");
    }
    
    function placeBet(uint256 number) external payable nonReentrant {
        require(currentGame.isActive, "Cannot place bet: game is not active");
        require(!currentGame.isDrawn, "Cannot place bet: game has already been drawn");
        require(isMaxPlayersSet, "Cannot place bet: maximum players limit has not been set by admin");
        require(number >= MIN_NUMBER, string(abi.encodePacked("Invalid number: must be at least ", toString(MIN_NUMBER))));
        require(number <= MAX_NUMBER, string(abi.encodePacked("Invalid number: must be at most ", toString(MAX_NUMBER))));
        require(msg.value >= MIN_BET, string(abi.encodePacked("Insufficient bet amount: minimum required is ", toString(MIN_BET), " wei (0.01 ETH)")));
        require(currentGame.totalPlayers < maxPlayers, string(abi.encodePacked("Game is full: current players ", toString(currentGame.totalPlayers), " has reached maximum ", toString(maxPlayers))));
        require(currentGame.playerBets[msg.sender] == 0, "Cannot place multiple bets: you have already placed a bet in this game");
        require(msg.sender != owner(), "Admin is not allowed to participate in the game");
        
        // 记录玩家下注
        currentGame.players.push(msg.sender);
        currentGame.totalPlayers++;
        currentGame.playerBets[msg.sender] = msg.value;
        currentGame.playerNumbers[msg.sender] = number;
        currentGame.totalBets += msg.value;
        
        emit BetPlaced(msg.sender, number, msg.value);
        emit PlayerJoined(msg.sender, currentGame.totalPlayers);
        
        // 如果达到最大玩家数量，允许开奖
        if (currentGame.totalPlayers == maxPlayers) {
            emit GameReady(block.timestamp);
        }       
    }
    
    // 辅助函数：将uint256转换为string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function drawWinner() external onlyOwner nonReentrant {
        require(msg.sender == owner(), "Only contract owner can draw winner");
        require(currentGame.isActive, "Cannot draw winner: game is not active");
        require(!currentGame.isDrawn, "Cannot draw winner: game has already been drawn");
        require(isMaxPlayersSet, "Cannot draw winner: maximum players limit has not been set yet");
        require(currentGame.totalPlayers > 0, "Cannot draw winner: there are no players in the game");
        require(currentGame.totalPlayers == maxPlayers, string(abi.encodePacked("Cannot draw winner: not enough players. Current players: ", toString(currentGame.totalPlayers), ", required: ", toString(maxPlayers))));
        
        // 在测试模式下使用预设的中奖数字，否则生成随机数
        if (!testMode) {
            currentGame.winningNumber = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                currentGame.totalBets
            ))) % MAX_NUMBER + 1;
        }
        // 如果是测试模式，则使用已经设置的 winningNumber
        
        currentGame.isDrawn = true;
        currentGame.isActive = false;
        
        emit GameEnded(currentGame.gameId, currentGame.winningNumber);
        emit AdminAction(msg.sender, testMode ? "Drew winner (test mode)" : "Drew winner");
        
        distributeRewards();
    }
    
    function distributeRewards() internal {
        require(currentGame.isDrawn, "Game must be drawn before distributing rewards");
        require(currentGame.players.length > 0, "No players in the game");
        
        address[] memory winners = new address[](currentGame.players.length);
        uint256 winnerCount = 0;
        
        // 找出所有赢家
        for (uint256 i = 0; i < currentGame.players.length; i++) {
            address player = currentGame.players[i];
            if (currentGame.playerNumbers[player] == currentGame.winningNumber) {
                winners[winnerCount] = player;
                winnerCount++;
            }
        }
        
        if (winnerCount > 0) {
            // 计算未中奖玩家的总投注额
            uint256 losersTotalBets = 0;
            for (uint256 i = 0; i < currentGame.players.length; i++) {
                address player = currentGame.players[i];
                if (currentGame.playerNumbers[player] != currentGame.winningNumber) {
                    losersTotalBets += currentGame.playerBets[player];
                }
            }
            
            // 计算每个赢家应得的额外奖金（未中奖玩家的投注平分）
            uint256 extraRewardPerWinner = losersTotalBets / winnerCount;
            
            // 分发奖金给赢家（原始投注 + 额外奖金）
            for (uint256 i = 0; i < winnerCount; i++) {
                address payable winner = payable(winners[i]);
                require(winner != address(0), "Invalid winner address");
                
                uint256 originalBet = currentGame.playerBets[winner];
                uint256 totalReward = originalBet + extraRewardPerWinner;
                
                (bool success, ) = winner.call{value: totalReward}("");
                require(success, string(abi.encodePacked(
                    "Failed to transfer reward of ",
                    toString(totalReward),
                    " wei to winner ",
                    toString(uint256(uint160(address(winner))))
                )));
                
                emit RewardsDistributed(winner, totalReward);
            }
        } else {
            // 如果没有赢家，返还每个玩家原始下注金额
            for (uint256 i = 0; i < currentGame.players.length; i++) {
                address player = currentGame.players[i];
                uint256 originalBet = currentGame.playerBets[player];
                
                require(player != address(0), "Invalid player address");
                (bool success, ) = payable(player).call{value: originalBet}("");
                require(success, string(abi.encodePacked(
                    "Failed to return bet of ",
                    toString(originalBet),
                    " wei to player ",
                    toString(uint256(uint160(address(player))))
                )));
                
                emit RewardsDistributed(player, originalBet);
            }
        }
    }
    
    function getGameStatus() external view returns (
        uint256 gameId,
        uint256 totalBets,
        uint256 totalPlayers,
        bool isActive,
        bool isDrawn,
        uint256 winningNumber,
        uint256 currentMaxPlayers,
        bool maxPlayersSet
    ) {
        return (
            currentGame.gameId,
            currentGame.totalBets,
            currentGame.totalPlayers,
            currentGame.isActive,
            currentGame.isDrawn,
            currentGame.winningNumber,
            maxPlayers,
            isMaxPlayersSet
        );
    }
    
    function getPlayerBet(address player) external view returns (uint256 betAmount, uint256 number) {
        return (currentGame.playerBets[player], currentGame.playerNumbers[player]);
    }
    
    // 获取玩家列表
    function getPlayers() external view returns (address[] memory) {
        return currentGame.players;
    }
    
    // 检查是否为管理员
    function isAdmin(address account) external view returns (bool) {
        return account == owner();
    }
    
    // 获取中奖玩家数量
    function getWinnerCount() external view returns (uint256) {
        require(currentGame.isDrawn, "Game has not been drawn yet, cannot get winner count");
        
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < currentGame.players.length; i++) {
            address player = currentGame.players[i];
            if (currentGame.playerNumbers[player] == currentGame.winningNumber) {
                winnerCount++;
            }
        }
        
        return winnerCount;
    }
    
    // 获取测试模式状态
    function getTestMode() external view returns (bool) {
        return testMode;
    }
}