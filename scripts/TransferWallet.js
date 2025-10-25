const { ethers } = require("hardhat");

async function main() {
    const factoryAddress = "0xBed8Bc8d55DcBA0A5E49EEfAe81107B218Ad36e0";

    const Factory = await ethers.getContractFactory("TransferWalletFactory");
    const factory = await Factory.attach(factoryAddress);

    const salt = ethers.keccak256(ethers.toUtf8Bytes("0xshahai"));
    console.log("Salt:", salt);

    // ✅ JS 预测地址
    const bytecode = await factory.getWalletBytecode();
    const hash = ethers.keccak256(
        ethers.concat([
            "0xff",
            factoryAddress,
            salt,
            ethers.keccak256(bytecode)
        ])
    );
    const predicted = "0x" + hash.slice(-40);
    console.log("预测钱包地址:", predicted);

    // 🚀 部署
    const tx = await factory.deployWallet(salt);
    const receipt = await tx.wait();
    console.log("部署交易哈希:", receipt.hash);

    // 📝 获取实际钱包地址
    const walletEvent = receipt.logs
        .map(log => {
            try { return factory.interface.parseLog(log); } catch { return null; }
        })
        .filter(e => e && e.name === "WalletDeployed")[0];

    if (!walletEvent) {
        console.warn("⚠️ 未检测到 WalletDeployed 事件");
        return;
    }

    const walletAddress = walletEvent.args.walletAddress;
    console.log("实际部署钱包地址:", walletAddress);

    console.log("✅ 预测与实际地址一致:", predicted.toLowerCase() === walletAddress.toLowerCase());
}

main().catch(console.error);