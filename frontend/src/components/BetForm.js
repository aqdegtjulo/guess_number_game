import React, { useState } from 'react';

function BetForm({ placeBet, isLoading, hasBet, totalPlayers, maxPlayers, maxPlayersSet }) {
  const [number, setNumber] = useState('');
  const [betAmount, setBetAmount] = useState(0.01);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (maxPlayersSet && totalPlayers >= maxPlayers) {
      setError('游戏玩家数量已达上限，无法继续下注');
      return;
    }

    if (!number || betAmount < 0.01) {
      setError('请填写完整的投注信息');
      return;
    }

    try {
      // 显示交易确认对话框
      const confirmed = window.confirm(
        `您即将投注 ${betAmount} ETH 猜数字 ${number}。\n\n` +
        `注意：这将消耗一定的网络费用。\n` +
        `是否确认投注？`
      );

      if (!confirmed) return;

      await placeBet(number, betAmount);
    } catch (err) {
      console.error('投注失败:', err);

      // 更友好的错误提示
      let errorMessage = '投注失败';
      if (err.code === 4001) {
        errorMessage = '您取消了交易';
      } else if (err.message.includes('gas')) {
        errorMessage = '网络费用不足，请稍后重试';
      } else if (err.message.includes('reverted')) {
        errorMessage = '合约操作被拒绝，请检查投注条件';
      }

      setError(`${errorMessage}: ${err.message}`);
    }
  };

  const isPlayerLimitReached = maxPlayersSet && totalPlayers >= maxPlayers;
  const isMaxPlayersNotSet = !maxPlayersSet;

  return (
    <form onSubmit={handleSubmit}>
      <h3>下注</h3>
      {maxPlayersSet && (
        <p className="player-count">
          当前玩家: {totalPlayers}/{maxPlayers}
        </p>
      )}
      {(() => {
        if (isMaxPlayersNotSet) {
          return (
            <div className="error-message">
              请等待管理员设置游戏参与人数后再进行下注
            </div>
          );
        }

        if (hasBet) {
          return <p>您已完成下注，请等待其他玩家参与游戏。</p>;
        }
        
        if (isPlayerLimitReached) {
          return (
            <div className="error-message">
              游戏玩家数量已达上限({maxPlayers})，无法继续下注
            </div>
          );
        }
        
        return (
          <>
            <div className="input-group">
              <label>
                猜测数字 (1-100):
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                  disabled={isLoading || isPlayerLimitReached}
                />
              </label>
            </div>
            <div className="input-group bet-amount">
              <label>
                下注金额 (ETH):
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  required
                  disabled={isLoading || isPlayerLimitReached}
                />
              </label>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={isLoading || !number || betAmount < 0.01}>
              {isLoading ? "处理中..." : "确认下注"}
            </button>
          </>
        );
      })()}
    </form>
  );
}

export default BetForm;