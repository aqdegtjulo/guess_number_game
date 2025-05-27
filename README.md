# 猜数字游戏项目 - 零基础完整启动指南

## 🛠️ 环境准备

### 1. 安装必要软件

#### 1.1 安装Node.js
- 下载地址：[Node.js官网](https://nodejs.org/)
- 选择LTS版本(推荐18.x)
- 安装完成后验证：
  ```bash
  node -v
  npm -v
  ```
  > 正常应显示类似：v18.16.0 和 9.5.1

#### 1.2 安装Git
- 下载地址：[Git官网](https://git-scm.com/)
- 全部选择默认选项安装
- 安装后验证：
  ```bash
  git --version
  ```

#### 1.3 安装VS Code（推荐）
- 下载地址：[VS Code官网](https://code.visualstudio.com/)
- 安装后建议添加扩展：
  - Solidity (智能合约语法高亮)
  - ESLint (代码检查)
  - Prettier (代码格式化)

---

## 📥 获取项目代码

### 2.1 克隆仓库
```bash
git clone https://github.com/your-repo/guess_number-game.git
cd guess_number-game
```

### 2.2 项目结构说明
```
guess_number-game/
├── backend/          # 智能合约部分
│   ├── contracts/    # 合约源代码(.sol文件)
│   ├── scripts/      # 部署脚本
│   ├── test/         # 测试代码
│   └── hardhat.config.js  # 区块链网络配置
└── frontend/         # 前端界面(React)
    ├── public/       # 静态资源
    └── src/          # 前端源代码
```

---

## ⛓️ 后端部署

### 3.1 安装依赖
```bash
cd backend
npm install
```
✅ 安装成功标志：看到`added XXX packages`提示

### 3.2 启动本地测试链
```bash
npx hardhat node
```
保持这个终端窗口运行，你会看到：
- 本地区块链启动在http://localhost:8545
- 显示10个测试账户和对应的私钥

### 3.3 部署智能合约
```bash
# 新开一个终端窗口
npx hardhat run scripts/deploy.js --network localhost
```
📌 记录显示的合约地址，如：`0x5FbDB123...`

---

## 🖥️ 前端启动

### 4.1 安装依赖
```bash
cd ../frontend
npm install
```
安装过程可能需要2-5分钟

### 4.2 配置环境变量
1. 复制`.env.example`文件并重命名为`.env`
2. 编辑`.env`文件：
   ```ini
   REACT_APP_CONTRACT_ADDRESS=0x5FbDB123... # 替换为你的合约地址
   ```

### 4.3 启动前端
```bash
npm start
```
浏览器会自动打开 http://localhost:3000

---

## 🔍 测试流程

### 5.1 配置MetaMask
1. 安装MetaMask浏览器插件
2. 创建或导入钱包
3. 添加自定义网络：
   - 网络名称: Hardhat
   - RPC URL: http://localhost:8545 
   - 链ID: 31337
   - 货币符号: ETH

### 5.2 导入测试账户
1. 在MetaMask中选择"导入账户"
2. 使用hardhat node显示的私钥导入

### 5.3 测试游戏功能
1. 连接钱包
2. 参与猜数字游戏
3. 查看交易记录

---

## 🚨 常见问题解决

### ❌ 依赖安装失败
```bash
# 解决方案：
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### ❌ 合约部署失败
- 确保hardhat节点正在运行
- 检查网络配置是否正确

### ❌ 前端无法连接合约
- 确认`.env`文件中的合约地址正确
- 确认MetaMask连接的是Hardhat网络

---

## 📋 命令速查表

| 功能 | 命令 |
|------|------|
| 启动本地链 | `npx hardhat node` |
| 部署合约 | `npx hardhat run scripts/deploy.js --network localhost` |
| 运行前端 | `npm start` |
| 运行测试 | `npx hardhat test` |
| 清理依赖 | `rm -rf node_modules package-lock.json` |

---

## 📜 使用说明

1. 本指南适用于Windows/macOS/Linux系统
2. 所有命令均在终端/PowerShell中执行
3. 遇到问题时请先检查常见问题解决部分
4. 确保所有服务按正确顺序启动

# guess_number_game
