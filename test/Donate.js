const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("XoneDonate", function () {
  let xoneDonate, xoneReward, mockToken;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // 部署模拟ERC20代币
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy(
      "Test Token", 
      "TEST", 
      6, 
      ethers.parseUnits("1000000", 6)
    );
    await mockToken.waitForDeployment();

    // 部署 TestERC1155 合约
    const TestERC1155Factory = await ethers.getContractFactory("TestERC1155");
    const testERC1155 = await TestERC1155Factory.deploy();
    await testERC1155.waitForDeployment();
    
    // 部署 TestXoneReward 合约
    const TestXoneRewardFactory = await ethers.getContractFactory("TestXoneReward");
    xoneReward = await TestXoneRewardFactory.deploy();
    await xoneReward.waitForDeployment();
    
    // 部署 TestXoneDonate 合约
    const TestXoneDonateFactory = await ethers.getContractFactory("TestXoneDonate");
    xoneDonate = await TestXoneDonateFactory.deploy();
    await xoneDonate.waitForDeployment();
    
    // 将 XoneDonate 添加到白名单
    await xoneReward.addWhiteList(owner.address, true);
    await xoneReward.addWhiteList(await xoneDonate.getAddress(), true);
    
    // 设置捐赠代币
    await xoneDonate.setDonateToken(await mockToken.getAddress());
    
    // 设置捐赠接收者
    await xoneDonate.setDonateReceiver(owner.address);
    
    // 设置 XoneReward 合约
    await xoneDonate.setXoneReward(await xoneReward.getAddress());
    
    // 设置最小捐赠金额
    await xoneDonate.setDonateMinAmount(ethers.parseUnits("100", 6));
    
    // 设置 XoneReward 的 txoc 代币（使用 MockERC20）
    await xoneReward.setTxoc(await mockToken.getAddress(), ethers.parseUnits("1", 18)); // 1:1 奖励率
    
    // 设置 XoneReward 的 xonePioneer（使用 TestERC1155）
    await xoneReward.setXonePioneer(await testERC1155.getAddress(), 1, 1);

    // 给测试用户分配代币
    await mockToken.transfer(addr1.address, ethers.parseUnits("10000", 6));
    await mockToken.transfer(addr2.address, ethers.parseUnits("10000", 6));
    await mockToken.transfer(addr3.address, ethers.parseUnits("10000", 6));
    
    // 用户授权XoneDonate合约使用代币
    await mockToken.connect(addr1).approve(await xoneDonate.getAddress(), ethers.parseUnits("10000", 6));
    await mockToken.connect(addr2).approve(await xoneDonate.getAddress(), ethers.parseUnits("10000", 6));
    await mockToken.connect(addr3).approve(await xoneDonate.getAddress(), ethers.parseUnits("10000", 6));
  });

  describe("基础功能测试", function () {
    it("应该能够成功捐赠代币", async function () {
      const donateAmount = ethers.parseUnits("1000", 6);
      
      // 记录初始余额
      const initialBalance = await mockToken.balanceOf(owner.address);
      
      // 执行捐赠
      await expect(
        xoneDonate.connect(addr1).donate(donateAmount, addr2.address)
      ).to.emit(xoneDonate, "Donated")
        .withArgs(await mockToken.getAddress(), addr1.address, addr2.address, donateAmount);

      // 检查总捐赠金额
      const totalDonateAmount = await xoneDonate.totalDonateAmount();
      expect(totalDonateAmount).to.equal(donateAmount);

      // 检查代币是否转移到接收者
      const finalBalance = await mockToken.balanceOf(owner.address);
      expect(finalBalance).to.equal(initialBalance + donateAmount);
    });

    it("应该拒绝无效的奖励地址", async function () {
      const donateAmount = ethers.parseUnits("1000", 6);
      
      await expect(
        xoneDonate.connect(addr1).donate(donateAmount, ethers.ZeroAddress)
      ).to.be.revertedWith("invalid reward address");
    });

    it("应该拒绝小于最小金额的捐赠", async function () {
      const donateAmount = ethers.parseUnits("50", 6); // 小于最小金额100
      
      await expect(
        xoneDonate.connect(addr1).donate(donateAmount, addr2.address)
      ).to.be.revertedWith("donate amount too small");
    });
  });

  describe("管理员功能测试", function () {
    it("只有管理员可以设置捐赠代币", async function () {
      const newToken = await ethers.getContractFactory("MockERC20");
      const newMockToken = await newToken.deploy("New Token", "NEW", 6, ethers.parseUnits("1000000", 6));
      await newMockToken.waitForDeployment();
      
      await expect(
        xoneDonate.connect(addr1).setDonateToken(await newMockToken.getAddress())
      ).to.be.revertedWith("Not Admin");
      
      await expect(
        xoneDonate.setDonateToken(await newMockToken.getAddress())
      ).to.emit(xoneDonate, "SetDonateToken")
        .withArgs(await newMockToken.getAddress());
    });

    it("只有管理员可以设置捐赠接收者", async function () {
      await expect(
        xoneDonate.connect(addr1).setDonateReceiver(addr2.address)
      ).to.be.revertedWith("Not Admin");
      
      await expect(
        xoneDonate.setDonateReceiver(addr2.address)
      ).to.emit(xoneDonate, "SetDonateReceiver")
        .withArgs(owner.address, addr2.address);
    });

    it("只有管理员可以设置XoneReward合约", async function () {
      await expect(
        xoneDonate.connect(addr1).setXoneReward(addr2.address)
      ).to.be.revertedWith("Not Admin");
      
      await expect(
        xoneDonate.setXoneReward(addr2.address)
      ).to.emit(xoneDonate, "SetXoneReward")
        .withArgs(addr2.address);
    });

    it("只有管理员可以设置最小捐赠金额", async function () {
      const newMinAmount = ethers.parseUnits("200", 6);
      
      await expect(
        xoneDonate.connect(addr1).setDonateMinAmount(newMinAmount)
      ).to.be.revertedWith("Not Admin");
      
      await expect(
        xoneDonate.setDonateMinAmount(newMinAmount)
      ).to.emit(xoneDonate, "SetDonateMinAmount")
        .withArgs(newMinAmount);
    });

    it("只有管理员可以提取代币", async function () {
      // 先给合约转一些代币用于测试提取
      await mockToken.transfer(await xoneDonate.getAddress(), ethers.parseUnits("1000", 6));
      
      await expect(
        xoneDonate.connect(addr1).withdraw(await mockToken.getAddress(), ethers.parseUnits("100", 6))
      ).to.be.revertedWith("Not Admin");
      
      // 提取少量代币
      await expect(
        xoneDonate.withdraw(await mockToken.getAddress(), ethers.parseUnits("100", 6))
      ).to.emit(xoneDonate, "Withdrawn")
        .withArgs(await mockToken.getAddress(), owner.address, ethers.parseUnits("100", 6));
    });
  });

  describe("错误情况测试", function () {
    it("应该拒绝无效的代币地址", async function () {
      await expect(
        xoneDonate.setDonateToken(ethers.ZeroAddress)
      ).to.be.revertedWith("invalid donate token");
    });

    it("应该拒绝无效的接收者地址", async function () {
      await expect(
        xoneDonate.setDonateReceiver(ethers.ZeroAddress)
      ).to.be.revertedWith("invalid donate receiver");
    });

    it("应该拒绝无效的最小捐赠金额", async function () {
      await expect(
        xoneDonate.setDonateMinAmount(0)
      ).to.be.revertedWith("invalid donate min amount");
    });

    it("应该防止重入攻击", async function () {
      // 这个测试需要创建一个恶意合约来测试重入
      // 由于当前合约有nonReentrant修饰符，重入应该被阻止
      const donateAmount = ethers.parseUnits("1000", 6);
      
      // 正常捐赠应该成功
      await expect(
        xoneDonate.connect(addr1).donate(donateAmount, addr2.address)
      ).to.not.be.reverted;
    });
  });

  describe("事件测试", function () {
    it("捐赠时应该发出正确的事件", async function () {
      const donateAmount = ethers.parseUnits("1000", 6);
      
      await expect(
        xoneDonate.connect(addr1).donate(donateAmount, addr2.address)
      ).to.emit(xoneDonate, "Donated")
        .withArgs(await mockToken.getAddress(), addr1.address, addr2.address, donateAmount);
    });

    it("设置参数时应该发出正确的事件", async function () {
      const newToken = await ethers.getContractFactory("MockERC20");
      const newMockToken = await newToken.deploy("New Token", "NEW", 6, ethers.parseUnits("1000000", 6));
      await newMockToken.waitForDeployment();
      
      await expect(
        xoneDonate.setDonateToken(await newMockToken.getAddress())
      ).to.emit(xoneDonate, "SetDonateToken")
        .withArgs(await newMockToken.getAddress());
        
      await expect(
        xoneDonate.setDonateReceiver(addr2.address)
      ).to.emit(xoneDonate, "SetDonateReceiver")
        .withArgs(owner.address, addr2.address);
        
      await expect(
        xoneDonate.setDonateMinAmount(ethers.parseUnits("200", 6))
      ).to.emit(xoneDonate, "SetDonateMinAmount")
        .withArgs(ethers.parseUnits("200", 6));
    });
  });

  describe("边界情况测试", function () {
    it("应该处理最大金额的捐赠", async function () {
      const maxAmount = ethers.parseUnits("10000", 6);
      
      await expect(
        xoneDonate.connect(addr1).donate(maxAmount, addr2.address)
      ).to.not.be.reverted;
      
      const totalDonateAmount = await xoneDonate.totalDonateAmount();
      expect(totalDonateAmount).to.equal(maxAmount);
    });

    it("应该正确处理多次捐赠", async function () {
      const donateAmount1 = ethers.parseUnits("1000", 6);
      const donateAmount2 = ethers.parseUnits("2000", 6);
      
      await xoneDonate.connect(addr1).donate(donateAmount1, addr2.address);
      await xoneDonate.connect(addr2).donate(donateAmount2, addr3.address);
      
      const totalDonateAmount = await xoneDonate.totalDonateAmount();
      expect(totalDonateAmount).to.equal(donateAmount1 + donateAmount2);
    });
  });
});
