import React from 'react';

function GameRules() {
  return (
    <div className="game-rules">
      <h3>游戏规则</h3>
      <ol>
        <li>每个玩家需要连接自己的MetaMask钱包参与游戏</li>
        <li>玩家需要猜测一个1到100之间的数字并下注一定数量的ETH（最低0.01 ETH）</li>
        <li>游戏需要玩家全部下注完成才能开奖</li>
        <li>如果有玩家猜中中奖数字，总下注金额将平均分配给所有猜中的玩家</li>
        <li>如果没有玩家猜中，每位玩家将获得退还的下注金额</li>
        <li>玩家可以通过切换MetaMask账户来模拟不同玩家参与游戏</li>
      </ol>
    </div>
  );
}

export default GameRules;
