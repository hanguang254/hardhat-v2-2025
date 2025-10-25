// scripts/deploy-factory.js
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署 TransferWalletFactory...");
    
    // 获取部署者信息
    const [deployer] = await ethers.getSigners();
    console.log("📝 部署者地址:", deployer.address);
    console.log("💰 部署者余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // 部署工厂合约
    const Factory = await ethers.getContractFactory("TransferWalletFactory");
    console.log("⏳ 正在部署工厂合约...");
    
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ TransferWalletFactory 部署成功!");
    console.log("📌 合约地址:", factoryAddress);
    
    // 验证部署
    const code = await ethers.provider.getCode(factoryAddress);
    if (code !== "0x") {
        console.log("🔍 合约代码验证: ✅ 成功");
    } else {
        console.log("🔍 合约代码验证: ❌ 失败");
    }
    
    // 保存部署信息
    console.log("\n📋 部署信息:");
    console.log("   网络:", network.name);
    console.log("   区块:", await ethers.provider.getBlockNumber());
    console.log("   交易哈希:", factory.deploymentTransaction().hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });