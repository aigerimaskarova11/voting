// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RewardToken.sol";

contract CrowdFunding {

    struct Campaign {
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        bool finalized;
        address creator;
    }

    RewardToken public rewardToken;
    uint256 public campaignCount;

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    constructor(address _rewardToken) {
        require(_rewardToken != address(0), "Invalid token address");
        rewardToken = RewardToken(_rewardToken);
    }

    function createCampaign(
        string calldata _title,
        uint256 _goal,
        uint256 _duration
    ) external {
        require(bytes(_title).length > 0, "Title required");
        require(_goal > 0, "Goal must be > 0");
        require(_duration > 0, "Duration must be > 0");

        campaigns[campaignCount] = Campaign({
            title: _title,
            goal: _goal,
            deadline: block.timestamp + _duration,
            totalRaised: 0,
            finalized: false,
            creator: msg.sender
        });

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

        // Mint reward tokens: 1 ETH = 100 RWD
        rewardToken.mint(msg.sender, msg.value * 100);
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
