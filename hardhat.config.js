require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0", // 老合约用
      },
      {
        version: "0.8.18", // 老合约用
      },
      {
        version: "0.8.23", // openzeppelin ^0.8.20 用
      },
    ],
  },

  networks: {
    xonetest: {
      url: process.env.XONETEST_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId:33772211,
    },
    // 你还可以加 goerli, arbitrum 等
    xonemain:{
      url: process.env.XONEMAIN_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId:3721,
    }
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