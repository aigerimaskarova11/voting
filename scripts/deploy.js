const hre = require("hardhat");

async function main() {
    const RewardToken = await hre.ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();

    const CrowdFundingVoting = await hre.ethers.getContractFactory("CrowdFundingVoting");
    const crowdfunding = await CrowdFundingVoting.deploy(await rewardToken.getAddress());
    await crowdfunding.waitForDeployment();

    await rewardToken.transferOwnership(await crowdfunding.getAddress());

    console.log("RewardToken:", await rewardToken.getAddress());
    console.log("CrowdFundingVoting:", await crowdfunding.getAddress());
}

main().catch((err) => { console.error(err); process.exit(1); });
