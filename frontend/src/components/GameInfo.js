import React, { useState } from 'react';

function GameInfo({ gameInfo, userBet, isConnected, isAdmin, onSetMaxPlayers }) {
  const [maxPlayersInput, setMaxPlayersInput] = useState('');
  
  // 格式化数字为两位小数
  const formatEth = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(4);
  };
  
  const handleSetMaxPlayers = (e) => {
    e.preventDefault();
    const maxPlayers = parseInt(maxPlayersInput);
    if (maxPlayers > 0) {
      onSetMaxPlayers(maxPlayers);
      setMaxPlayersInput('');
    }
  };
  
  return (
    <div className="game-info">
      <h3>游戏信息</h3>
      <p>游戏ID: {gameInfo.gameId}</p>
      <p>总下注金额: {gameInfo.totalBets} ETH</p>
      <p>已参与玩家: {gameInfo.totalPlayers} / {gameInfo.maxPlayersSet ? gameInfo.currentMaxPlayers : '未设置'}</p>
      <p>游戏状态: {gameInfo.isActive ? "进行中" : "已结束"}</p>
      {gameInfo.isDrawn && <p>中奖数字: {gameInfo.winningNumber}</p>}
      
      {isConnected && (
        <div className="admin-info-box">
          <h4>管理员状态</h4>
          <p>您{isAdmin ? '是' : '不是'}游戏管理员</p>
          {!isAdmin && <p>注意: 只有管理员可以开奖和开始新游戏</p>}
          
          {isAdmin && gameInfo.isActive && !gameInfo.maxPlayersSet && (
            <div className="admin-controls">
              <h4>设置最大玩家数</h4>
              <form onSubmit={handleSetMaxPlayers}>
                <input
                  type="number"
                  min="1"
                  value={maxPlayersInput}
                  onChange={(e) => setMaxPlayersInput(e.target.value)}
                  placeholder="输入最大玩家数"
                  required
                />
                <button type="submit">设置</button>
              </form>
            </div>
          )}
        </div>
      )}
      
      {isConnected && (
        <div className="player-bet-info">
          <h3>您的下注信息</h3>
          {parseFloat(userBet.betAmount) > 0 ? (
            <div>
              <p>下注金额: {userBet.betAmount} ETH</p>
              <p>猜测数字: {userBet.userGuess}</p>
            </div>
          ) : (
            <p>您还未下注</p>
          )}
        </div>
      )}
    </div>
  );
}

export default GameInfo;