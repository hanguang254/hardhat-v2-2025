const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TranActive", function () {
  let TranActive, tranActive, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    TranActive = await ethers.getContractFactory("TranActive");
    tranActive = await TranActive.deploy();
  });

  it("存款后余额和配额正确", async function () {
    await tranActive.connect(addr1).deposit({ value: ethers.parseEther("1") });
    expect(await tranActive.depositquota(addr1.address)).to.equal(ethers.parseEther("1"));
    expect(await tranActive.balanceOf()).to.equal(ethers.parseEther("1"));
  });

  it("批量转账后余额和配额变化正确", async function () {
    await tranActive.connect(addr1).deposit({ value: ethers.parseEther("2") });
    const recipients = [addr2.address, addr3.address]; // 补充这一行
    const amounts = [
      ethers.parseEther("0.5"),
      ethers.parseEther("1"),
    ];
    await tranActive.connect(addr1).transfer(recipients, amounts);

    expect(await tranActive.depositquota(addr1.address)).to.equal(ethers.parseEther("0.5"));
  });

  it("批量转账金额超出配额应失败", async function () {
    await tranActive.connect(addr1).deposit({ value: ethers.parseEther("1") });
    const recipients = [addr2.address, addr3.address]; // 补充这一行
    const amounts = [
      ethers.parseEther("0.6"),
      ethers.parseEther("0.5"),
    ];
    await expect(
      tranActive.connect(addr1).transfer(recipients, amounts)
    ).to.be.revertedWith("Address Insufficient deposit amount");
  });

  it("只有owner可以提现", async function () {
    await tranActive.connect(addr1).deposit({ value: ethers.parseEther("1") });
    await expect(
      tranActive.connect(addr1).withdraw(ethers.parseEther("0.5"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("owner提现成功并触发事件", async function () {
    await tranActive.connect(addr1).deposit({ value: ethers.parseEther("1") });
    await expect(
      tranActive.withdraw(ethers.parseEther("0.5"))
    ).to.emit(tranActive, "Withdraw").withArgs(owner.address, ethers.parseEther("0.5"));
  });
});