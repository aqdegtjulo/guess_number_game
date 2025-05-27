import React from 'react';

function PlayersList({ players, currentAccount }) {
  // 截断地址，只显示开头和结尾部分
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 检查地址是否是当前连接的钱包
  const isCurrentAccount = (address) => {
    return address.toLowerCase() === (currentAccount || '').toLowerCase();
  };

  return (
    <div>
      <h3>参与玩家 ({players.length})</h3>
      {players.length > 0 ? (
        <div className="players-list">
          {players.map((player, index) => (
            <div key={index} className="player-item">
              <span className="player-address">
                玩家 #{index + 1}: {truncateAddress(player)}
              </span>
              {isCurrentAccount(player) && <span>(当前钱包)</span>}
            </div>
          ))}
        </div>
      ) : (
        <p>暂无玩家参与</p>
      )}
    </div>
  );
}

export default PlayersList;
