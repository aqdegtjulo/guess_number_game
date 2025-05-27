import React, { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import GameContract from './utils/GameContract';
import WalletConnect from './components/WalletConnect';
import GameInfo from './components/GameInfo';
import BetForm from './components/BetForm';
import PlayersList from './components/PlayersList';
import GameRules from './components/GameRules';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [gameInfo, setGameInfo] = useState({
    gameId: 0,
    totalBets: 0,
    totalPlayers: 0,
    isActive: false,
    isDrawn: false,
    winningNumber: 0,
    currentMaxPlayers: 0,
    maxPlayersSet: false
  });
  const [players, setPlayers] = useState([]);
  const [userBet, setUserBet] = useState({ betAmount: 0, number: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // info, warning, error
  const [gameResult, setGameResult] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // 添加测试模式相关状态
  const [isTestMode, setIsTestMode] = useState(false);
  const [predefinedWinningNumber, setPredefinedWinningNumber] = useState(1);

  // 初始化Web3和合约
  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        // 使用MetaMask的provider
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // 获取合约实例
        const contractInstance = await GameContract(web3Instance);
        setContract(contractInstance);
        
        // 初始状态下刷新游戏数据
        refreshGameData(contractInstance);
      } catch (error) {
        console.error("初始化Web3或合约失败:", error);
        setStatusMessage("初始化Web3或合约失败，请检查控制台获取详细信息。");
        setStatusType('error');
      }
    } else {
      setStatusMessage("请安装MetaMask以使用此应用程序。");
      setStatusType('warning');
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);
        setStatusMessage(`已成功连接到钱包 ${accounts[0]}`);
        setStatusType('info');
      } else {
        setStatusMessage("未找到以太坊提供程序，请安装MetaMask。");
        setStatusType('error');
      }
    } catch (error) {
      console.error("连接钱包时出错:", error);
      setStatusMessage("连接钱包失败。");
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新游戏数据
  const refreshGameData = async (contractInstance) => {
    if (!contractInstance || !web3) return;

    try {
      console.log("刷新游戏数据...");
      
      // 检查当前账户
      if (accounts.length === 0) {
        console.log("未连接账户，不刷新数据");
        return;
      }
      
      // 首先检查是否为管理员（先于其他数据检查，确保UI正确显示）
      console.log("检查管理员状态，当前账户:", accounts[0]);
      try {
        const isUserAdmin = await contractInstance.methods.isAdmin(accounts[0]).call();
        console.log("管理员状态:", isUserAdmin);
        // 确保将返回值转换为布尔值
        setIsAdmin(Boolean(isUserAdmin === true || isUserAdmin === "true"));
        
        // 如果是管理员，获取测试模式状态
        if (isUserAdmin) {
          try {
            const testMode = await contractInstance.methods.getTestMode().call();
            setIsTestMode(testMode);
            console.log("测试模式状态:", testMode);
          } catch (error) {
            console.error("获取测试模式状态失败:", error);
            setIsTestMode(false);
          }
        }
      } catch (error) {
        console.error("检查管理员状态失败:", error);
        // 默认设为非管理员，避免误操作
        setIsAdmin(false);
      }

      // 获取游戏状态
      const gameStatus = await contractInstance.methods.getGameStatus().call();
      console.log("游戏状态:", gameStatus);
      
      setGameInfo({
        gameId: parseInt(gameStatus.gameId),
        totalBets: web3.utils.fromWei(gameStatus.totalBets, 'ether'),
        totalPlayers: parseInt(gameStatus.totalPlayers),
        isActive: gameStatus.isActive,
        isDrawn: gameStatus.isDrawn,
        winningNumber: parseInt(gameStatus.winningNumber),
        currentMaxPlayers: parseInt(gameStatus.currentMaxPlayers),
        maxPlayersSet: gameStatus.maxPlayersSet
      });

      // 获取玩家列表
      const playersList = await contractInstance.methods.getPlayers().call();
      setPlayers(playersList);

      // 获取用户下注信息
      const playerBet = await contractInstance.methods.getPlayerBet(accounts[0]).call();
      setUserBet({
        betAmount: web3.utils.fromWei(playerBet.betAmount, 'ether'),
        userGuess: parseInt(playerBet.number) // 确保属性名一致
      });
      
      // 如果游戏已经结束，获取获胜者信息
      if (gameStatus.isDrawn) {
        try {
          const winnerCount = await contractInstance.methods.getWinnerCount().call();
          console.log("游戏已开奖，获胜人数:", winnerCount);
          setGameResult({
            winningNumber: parseInt(gameStatus.winningNumber),
            winnerCount: parseInt(winnerCount)
          });
        } catch (error) {
          console.error("获取中奖信息失败:", error);
          // 确保仍然设置一个默认的游戏结果，以防显示异常
          setGameResult({
            winningNumber: parseInt(gameStatus.winningNumber),
            winnerCount: 0
          });
        }
      } else {
        // 如果游戏未结束，清空游戏结果
        setGameResult(null);
      }
    } catch (error) {
      console.error("刷新游戏数据时出错:", error);
      setStatusMessage("无法加载游戏数据。");
      setStatusType('error');
    }
  };

  // 切换测试模式
  const toggleTestMode = async () => {
    if (!isAdmin) {
      setStatusMessage("您不是管理员，无法切换测试模式");
      return;
    }
    
    try {
      setIsLoading(true);
      setStatusMessage("切换测试模式中，请等待...");
      
      const newTestModeState = !isTestMode;
      
      await contract.methods.setTestMode(newTestModeState).send({
        from: accounts[0],
        gas: 300000
      });
      
      setIsTestMode(newTestModeState);
      setStatusMessage(`测试模式已${newTestModeState ? '开启' : '关闭'}`);
      setStatusType('info');
      
      // 刷新游戏数据
      refreshGameData(contract);
    } catch (error) {
      console.error("切换测试模式失败:", error);
      setStatusMessage(`切换测试模式失败: ${error.message}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 设置预定义中奖数字
  const setPredefinedNumber = async () => {
    if (!isAdmin || !isTestMode) {
      setStatusMessage("您不是管理员或测试模式未开启");
      return;
    }
    
    try {
      setIsLoading(true);
      setStatusMessage("设置中奖数字中，请等待...");
      
      await contract.methods.setWinningNumber(predefinedWinningNumber).send({
        from: accounts[0],
        gas: 300000
      });
      
      setStatusMessage(`中奖数字已设置为: ${predefinedWinningNumber}`);
      setStatusType('info');
    } catch (error) {
      console.error("设置中奖数字失败:", error);
      setStatusMessage(`设置中奖数字失败: ${error.message}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 下注
  const placeBet = async (number, betAmount) => {
    if (!web3 || !contract || accounts.length === 0) {
      setStatusMessage("请先连接钱包");
      setStatusType('warning');
      return;
    }

    setIsLoading(true);
    try {
      const betAmountWei = web3.utils.toWei(betAmount.toString(), 'ether');
      
      console.log(`下注数字: ${number}, 金额: ${betAmount} ETH (${betAmountWei} Wei)`);
      
      // 动态获取gas价格
      const gasPrice = await web3.eth.getGasPrice();
      const increasedGasPrice = Math.floor(Number(gasPrice) * 1.2); // 增加20%以防价格波动
      
      await contract.methods.placeBet(parseInt(number)).send({
        from: accounts[0],
        value: betAmountWei,
        gas: 500000, // 增加gas限制
        gasPrice: increasedGasPrice
      });

      setStatusMessage(`下注成功！数字: ${number}, 金额: ${betAmount} ETH`);
      setStatusType('info');
      
      // 更新游戏数据
      refreshGameData(contract);
    } catch (error) {
      console.error("下注失败:", error);
      if (error.message) {
        setStatusMessage(`下注失败: ${error.message.substring(0, 100)}...`);
      } else {
        setStatusMessage("下注失败，请查看控制台获取详细信息。");
      }
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 开奖
  const drawWinner = async () => {
    // 首先检查是否为管理员
    if (!isAdmin) {
      setStatusMessage("您不是管理员，无法开奖");
      return;
    }
    
    if (gameInfo.isDrawn) {
      setStatusMessage("游戏已经开奖");
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage("开奖中，请等待...");
      
      const contract = await GameContract(web3);
      
      const tx = await contract.methods.drawWinner().send({
        from: accounts[0],
        gas: 3000000
      });
      
      console.log("开奖交易已提交:", tx);
      
      // 刷新游戏信息和结果
      await refreshGameData(contract);
      
      setIsLoading(false);
      setStatusMessage("开奖成功！");
      
    } catch (error) {
      console.error("开奖失败:", error);
      setIsLoading(false);
      
      if (error.message.includes("Only owner") || error.message.includes("not the owner")) {
        setStatusMessage("您不是管理员，无法开奖");
      } else {
        setStatusMessage(`开奖失败: ${error.message}`);
      }
    }
  };

  // 开始新游戏
  const startNewGame = async () => {
    // 首先检查是否为管理员
    if (!isAdmin) {
      setStatusMessage("您不是管理员，无法开始新游戏");
      return;
    }
    
    try {
      setIsLoading(true);
      setStatusMessage("开始新游戏中，请等待...");
      
      const contract = await GameContract(web3);
      
      const tx = await contract.methods.startNewGame().send({
        from: accounts[0],
        gas: 3000000
      });
      
      console.log("开始新游戏交易已提交:", tx);
      
      // 重置游戏状态
      setGameResult(null);
      setUserBet({ betAmount: "0", userGuess: "0" });
      setPlayers([]);
      
      // 刷新游戏信息
      await refreshGameData(contract);
      
      setIsLoading(false);
      setStatusMessage("新游戏已开始！");
      
    } catch (error) {
      console.error("开始新游戏失败:", error);
      setIsLoading(false);
      
      if (error.message.includes("Only owner") || error.message.includes("not the owner")) {
        setStatusMessage("您不是管理员，无法开始新游戏");
      } else {
        setStatusMessage(`开始新游戏失败: ${error.message}`);
      }
    }
  };

  // 设置最大玩家数
  const handleSetMaxPlayers = async (maxPlayers) => {
    // 首先检查是否为管理员
    if (!isAdmin) {
      setStatusMessage("您不是管理员，无法设置最大玩家数");
      return;
    }
    
    if (!gameInfo.isActive) {
      setStatusMessage("只能在游戏进行中设置最大玩家数");
      return;
    }

    if (gameInfo.maxPlayersSet) {
      setStatusMessage("本局游戏已设置过最大玩家数");
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage("设置最大玩家数中，请等待...");
      
      await contract.methods.setMaxPlayers(maxPlayers).send({
        from: accounts[0],
        gas: 300000
      });
      
      // 刷新游戏信息
      await refreshGameData(contract);
      
      setIsLoading(false);
      setStatusMessage(`已成功设置最大玩家数为 ${maxPlayers}`);
      
    } catch (error) {
      console.error("设置最大玩家数失败:", error);
      setIsLoading(false);
      
      if (error.message.includes("Only owner") || error.message.includes("not the owner")) {
        setStatusMessage("您不是管理员，无法设置最大玩家数");
      } else {
        setStatusMessage(`设置最大玩家数失败: ${error.message}`);
      }
    }
  };

  // 监听 MetaMask 账户变更
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccounts(accounts);
        if (accounts.length > 0) {
          setStatusMessage(`已切换到钱包: ${accounts[0]}`);
          setStatusType('info');
        } else {
          setStatusMessage("未连接到钱包");
          setStatusType('warning');
        }
      });
    }

    initializeWeb3();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // 当合约或账户变更时，刷新游戏数据
  useEffect(() => {
    if (contract && accounts.length > 0) {
      refreshGameData(contract);
    }
  }, [contract, accounts]);

  // 每隔5秒自动刷新游戏数据
  useEffect(() => {
    const interval = setInterval(() => {
      if (contract) {
        refreshGameData(contract);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [contract]);

  // 管理员权限相关功能已在合约中实现
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>区块链猜数字游戏</h1>
      </header>
      
      <div className="game-container">
        <WalletConnect 
          isConnected={accounts.length > 0} 
          currentAccount={accounts[0]} 
          connectWallet={connectWallet} 
          isLoading={isLoading}
        />
        
        {statusMessage && (
          <div className={`status-message ${statusType}`}>
            {statusMessage}
          </div>
        )}

        <GameInfo 
          gameInfo={gameInfo} 
          userBet={userBet}
          isConnected={accounts.length > 0}
          isAdmin={isAdmin}
          isTestMode={isTestMode}
          onSetMaxPlayers={handleSetMaxPlayers}
        />
        
        {/* 管理员测试模式控制面板 */}
        {accounts.length > 0 && isAdmin && (
          <div className="admin-panel">
            <h3>管理员控制面板</h3>
            <div className="test-mode-controls">
              <button 
                onClick={toggleTestMode} 
                disabled={isLoading}
                className={`test-mode-button ${isTestMode ? 'active' : ''}`}
              >
                {isTestMode ? '关闭测试模式' : '开启测试模式'}
              </button>
              
              {isTestMode && (
                <div className="winning-number-setter">
                  <label>
                    设置中奖数字 (1-100):
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={predefinedWinningNumber} 
                      onChange={(e) => setPredefinedWinningNumber(parseInt(e.target.value))}
                      disabled={isLoading}
                    />
                  </label>
                  <button 
                    onClick={setPredefinedNumber} 
                    disabled={isLoading}
                    className="set-number-button"
                  >
                    确认设置
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {accounts.length > 0 && !gameInfo.isDrawn && !isAdmin && (
          <BetForm 
            placeBet={placeBet} 
            isLoading={isLoading} 
            hasBet={parseFloat(userBet.betAmount) > 0}
            totalPlayers={gameInfo.totalPlayers}
            maxPlayers={gameInfo.currentMaxPlayers}
            maxPlayersSet={gameInfo.maxPlayersSet}
          />
        )}
        
        {accounts.length > 0 && !gameInfo.isDrawn && isAdmin && (
          <div className="admin-message">
            <h3>管理员模式</h3>
            <p>作为游戏管理员，您不能参与游戏下注。您的角色是管理游戏进程。</p>
            {isTestMode && <p className="test-mode-active">测试模式已开启，开奖将使用预设的中奖数字。</p>}
          </div>
        )}
        
        <PlayersList players={players} currentAccount={accounts[0]} />
        
        {/* 开奖按钮和等待提示 */}
        {gameInfo.maxPlayersSet && gameInfo.totalPlayers >= gameInfo.currentMaxPlayers && !gameInfo.isDrawn && (
          <div className="draw-section">
            {/* 只有管理员能看到开奖按钮 */}
            {isAdmin ? (
              <>
                <p className="admin-note">您是管理员，可以开奖</p>
                {isTestMode && <p className="test-mode-note">测试模式已开启，将使用预设的中奖数字: {predefinedWinningNumber}</p>}
                <button 
                  className="draw-button" 
                  onClick={drawWinner} 
                  disabled={isLoading}
                >
                  开奖
                </button>
              </>
            ) : (
              <div className="waiting-message">
                <p>玩家数量已满，等待管理员开奖...</p>
              </div>
            )}
          </div>
        )}
        
        {/* 游戏结果显示 */}
        {gameInfo.isDrawn && gameResult && (
          <div className="result-container">
            <h3>游戏结果</h3>
            <p>中奖数字: {gameResult.winningNumber}</p>
            <p>中奖人数: {gameResult.winnerCount}</p>
            {gameResult.winnerCount > 0 ? (
              <p>奖金已分配给中奖玩家</p>
            ) : (
              <p>没有玩家猜中，所有玩家已收到退款</p>
            )}
            
            {/* 检查管理员状态并显示对应按钮 */}
            <div className="admin-controls" style={{marginTop: '15px'}}>
              {isAdmin ? (
                <>
                  <p className="admin-note">您是管理员，可以开始新游戏</p>
                  <button 
                    onClick={startNewGame} 
                    disabled={isLoading}
                    className="admin-button"
                  >
                    开始新游戏
                  </button>
                </>
              ) : (
                <p className="waiting-admin">游戏已结束，等待管理员开始新游戏</p>
              )}
            </div>
          </div>
        )}
        
        <GameRules />
      </div>
    </div>
  );
}

export default App;