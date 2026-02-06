const hre = require("hardhat");

async function main() {
    const VoteToken = await hre.ethers.getContractFactory("VoteToken");
    const voteToken = await VoteToken.deploy();
    await voteToken.waitForDeployment();

    console.log("VoteToken deployed to:", await voteToken.getAddress());

    const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy(
        await voteToken.getAddress()
    );
    await votingSystem.waitForDeployment();

    console.log("VotingSystem deployed to:", await votingSystem.getAddress());

    await voteToken.transferOwnership(await votingSystem.getAddress());
    console.log("Ownership transferred to VotingSystem");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});