import React from 'react';

function WalletConnect({ isConnected, currentAccount, connectWallet, isLoading }) {
  // 截断账户地址，只显示开头和结尾
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-info">
      {isConnected ? (
        <div>
          <span>当前钱包: </span>
          <span className="address-display">{truncateAddress(currentAccount)}</span>
        </div>
      ) : (
        <div>未连接钱包</div>
      )}
      <button 
        className={isConnected ? "switch-wallet" : "connect-wallet"}
        onClick={connectWallet} 
        disabled={isLoading}
      >
        {isLoading ? "处理中..." : (isConnected ? "切换钱包" : "连接钱包")}
      </button>
    </div>
  );
}

export default WalletConnect;
