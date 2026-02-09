// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RewardToken.sol";

contract CrowdFundingVoting {
    struct Campaign {
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        bool finalized;
        address creator;
        string[] options;                 
        mapping(uint => uint) votes;      
        mapping(address => bool) hasVoted; 
    }

    RewardToken public rewardToken;
    uint256 public campaignCount;
    mapping(uint256 => Campaign) private campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    constructor(address _rewardToken) {
        rewardToken = RewardToken(_rewardToken);
    }

    function createCampaign(
        string calldata _title,
        uint256 _goal,
        uint256 _duration,
        string[2] calldata _options 
    ) external {
        require(bytes(_title).length > 0, "Title required");
        require(_goal > 0, "Goal must be > 0");
        require(_duration > 0, "Duration must be > 0");

        Campaign storage c = campaigns[campaignCount];
        c.title = _title;
        c.goal = _goal;
        c.deadline = block.timestamp + _duration;
        c.creator = msg.sender;

        c.options.push(_options[0]);
        c.options.push(_options[1]);

        campaignCount++;
    }

    function contribute(uint256 _id) external payable {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage c = campaigns[_id];

        require(block.timestamp < c.deadline, "Campaign ended");
        require(!c.finalized, "Campaign finalized");
        require(msg.value > 0, "Send ETH");

        c.totalRaised += msg.value;
        contributions[_id][msg.sender] += msg.value;

        rewardToken.mint(msg.sender, msg.value * 100);
    }

    function vote(uint256 _id, uint256 _optionIndex) external {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage c = campaigns[_id];
        require(contributions[_id][msg.sender] > 0, "Must contribute first");
        require(!c.hasVoted[msg.sender], "Already voted");
        require(_optionIndex < c.options.length, "Invalid option");

        c.votes[_optionIndex]++;
        c.hasVoted[msg.sender] = true;
    }

    function getVotes(uint256 _id) external view returns (uint256[] memory) {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage c = campaigns[_id];

        uint256[] memory voteCounts = new uint256[](c.options.length);
        for (uint i = 0; i < c.options.length; i++) {
            voteCounts[i] = c.votes[i];
        }
        return voteCounts;
    }

    function getOptions(uint256 _id) external view returns (string[] memory) {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage c = campaigns[_id];
        return c.options;
    }

    function getCampaign(uint256 _id) external view returns (
        string memory, uint256, uint256, uint256, bool
    ) {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage c = campaigns[_id];
        return (c.title, c.goal, c.deadline, c.totalRaised, c.finalized);
    }

    function finalize(uint256 _id) external {
        require(_id < campaignCount, "Invalid campaign ID");
        Campaign storage c = campaigns[_id];
        require(block.timestamp >= c.deadline, "Too early");
        require(!c.finalized, "Already finalized");

        c.finalized = true;
        if (c.totalRaised >= c.goal) {
            payable(c.creator).transfer(c.totalRaised);
        }
    }
}
