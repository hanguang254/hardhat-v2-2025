const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ZnsModule", (m) => {
  const owner = m.getAccount(0); // 默认使用部署者账号

  // 传入 name, symbol, owner 三个参数
  const ZNS = m.contract("ZNS", [1000000000000, "ZNS", "ZNS"]);

  return { ZNS };
});
