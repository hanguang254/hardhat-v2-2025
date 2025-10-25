require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      // {
      //   version: "0.8.0", // 老合约用
      // },
      // {
      //   version: "0.8.18", // 老合约用
      // },
      {
        version: "0.8.23", // openzeppelin ^0.8.20 用
      },
    ],
  },

  networks: {
    // 本地测试网络
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.PRIVATE_KEY || "0x" + "0".repeat(64)],
    },
    // Xone 测试网
    xonetest: {
      url: process.env.XONETEST_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 33772211,
      gasPrice: "auto",
    },
    // Xone 主网
    xonemain: {
      url: process.env.XONEMAIN_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 3721,
      gasPrice: "auto",
    },
    // Ethereum 主网
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1,
      gasPrice: "auto",
    },
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 56,
      gasPrice: "auto",
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com/",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137,
      gasPrice: "auto",
    },
    // Arbitrum 主网
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42161,
      gasPrice: "auto",
    },
    // Optimism 主网
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10,
      gasPrice: "auto",
    },
    // Ethereum Goerli 测试网
    // goerli: {
    //   url: process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
    //   accounts: [process.env.PRIVATE_KEY],
    //   chainId: 5,
    //   gasPrice: "auto",
    // },
    // BSC 主网
    
    // BSC 测试网
    // bsctest: {
    //   url: process.env.BSC_TEST_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
    //   accounts: [process.env.PRIVATE_KEY],
    //   chainId: 97,
    //   gasPrice: "auto",
    // },
    // Polygon 主网
    
  },
  etherscan: {
    apiKey: {
      xonetest: "dummy-api-key", // 有些链不校验 API Key，随便写
      xonemain: "dummy-api-key"
    },
    customChains: [
      {
        network: "xonetest",
        chainId: 33772211,
        urls: {
          apiURL: "https://testnet.xscscan.com/api/",   // 你们区块浏览器的 API 地址
          browserURL: "https://testnet.xscscan.com/",       // 浏览器访问地址
        },
      },
      {
        network: "xonemain",
        chainId: 3721,
        urls: {
          apiURL: "https://xonescan.com/api/",   // 你们区块浏览器的 API 地址
          browserURL: "https://xonescan.com/",       // 浏览器访问地址
        },
      },
    ],
  },
};