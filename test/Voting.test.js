const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding Voting DApp", function () {
  let RewardToken, rewardToken;
  let CrowdFundingVoting, crowdfunding;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    
    RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();

 
    CrowdFundingVoting = await ethers.getContractFactory("CrowdFundingVoting");
    crowdfunding = await CrowdFundingVoting.deploy(await rewardToken.getAddress());
    await crowdfunding.waitForDeployment();

 
    await rewardToken.transferOwnership(await crowdfunding.getAddress());
  });

  it("Should create a campaign with two candidates", async function () {
    await crowdfunding.createCampaign("Test Campaign", ethers.parseEther("1"), 3600, ["Alice","Bob"]);

    const count = await crowdfunding.campaignCount();
    expect(count).to.equal(1);

    const campaign = await crowdfunding.getCampaign(0);
    expect(campaign[0]).to.equal("Test Campaign");
    expect(campaign[4]).to.equal(false); // finalized
  });

  it("Should allow contribution and mint reward tokens", async function () {
    await crowdfunding.createCampaign("Test Campaign", ethers.parseEther("1"), 3600, ["Alice","Bob"]);

    await crowdfunding.connect(user1).contribute(0, { value: ethers.parseEther("0.5") });

    const contrib = await crowdfunding.contributions(0, user1.address);
    expect(ethers.formatEther(contrib)).to.equal("0.5");

    const balance = await rewardToken.balanceOf(user1.address);
    expect(ethers.formatUnits(balance, 18)).to.equal("50"); // 0.5 ETH * 100
  });

  it("Should allow voting for contributors only", async function () {
    await crowdfunding.createCampaign("Test Campaign", ethers.parseEther("1"), 3600, ["Alice","Bob"]);

    await crowdfunding.connect(user1).contribute(0, { value: ethers.parseEther("0.5") });

    await crowdfunding.connect(user1).vote(0, 1); // Vote for Bob

    const votes = await crowdfunding.getVotes(0);
    expect(votes[1]).to.equal(1);
    expect(votes[0]).to.equal(0);

    
    await expect(crowdfunding.connect(user2).vote(0, 0)).to.be.revertedWith("Must contribute first");
  });

  it("Should finalize campaign after deadline and send ETH to creator", async function () {
    await crowdfunding.createCampaign("Test Campaign", ethers.parseEther("1"), 1, ["Alice","Bob"]);

    await crowdfunding.connect(user1).contribute(0, { value: ethers.parseEther("1") });

  
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    const creatorBalanceBefore = await ethers.provider.getBalance(owner.address);

    await crowdfunding.finalize(0);

    const creatorBalanceAfter = await ethers.provider.getBalance(owner.address);
    expect(creatorBalanceAfter.sub(creatorBalanceBefore)).to.equal(ethers.parseEther("1"));

    const campaign = await crowdfunding.getCampaign(0);
    expect(campaign[4]).to.equal(true); // finalized
  });
});
