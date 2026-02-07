const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
  let voteToken;
  let votingSystem;
  let owner;
  let voter1;
  let voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const VoteToken = await ethers.getContractFactory("VoteToken");
    voteToken = await VoteToken.deploy();
    await voteToken.waitForDeployment();

    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystem.deploy(await voteToken.getAddress());
    await votingSystem.waitForDeployment();

    await voteToken.transferOwnership(await votingSystem.getAddress());
  });

  it("creates an election with correct parameters", async function () {
    await votingSystem.createElection(
      "Favorite Programming Language",
      ["Solidity", "JavaScript"],
      3600
    );

    const election = await votingSystem.getElection(0);

    expect(election.title).to.equal("Favorite Programming Language");
    expect(election.candidates.length).to.equal(2);
    expect(election.finalized).to.equal(false);
  });

  it("allows a user to vote and receive reward tokens", async function () {
    await votingSystem.createElection(
      "Favorite Programming Language",
      ["Solidity", "JavaScript"],
      3600
    );

    await votingSystem.connect(voter1).vote(0, 0);

    const votes = await votingSystem.getVotes(0, 0);
    expect(votes).to.equal(1n);

    const balance = await voteToken.balanceOf(voter1.address);
    expect(balance).to.equal(ethers.parseUnits("10", 18));
  });

  it("prevents a user from voting twice", async function () {
    await votingSystem.createElection(
      "Favorite Programming Language",
      ["Solidity", "JavaScript"],
      3600
    );

    await votingSystem.connect(voter1).vote(0, 0);

    await expect(
      votingSystem.connect(voter1).vote(0, 1)
    ).to.be.revertedWith("Already voted");
  });

  it("rejects voting after the deadline has passed", async function () {
    await votingSystem.createElection(
      "Short Election",
      ["Option A", "Option B"],
      1
    );

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    await expect(
      votingSystem.connect(voter1).vote(0, 0)
    ).to.be.revertedWith("Voting ended");
  });

  it("finalizes an election after the deadline", async function () {
    await votingSystem.createElection(
      "Finalize Test",
      ["Yes", "No"],
      1
    );

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    await votingSystem.finalizeElection(0);

    const election = await votingSystem.getElection(0);
    expect(election.finalized).to.equal(true);
  });
});
