// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoteToken.sol";

contract VotingSystem {
    struct Election {
        string title;
        string[] candidates;
        uint256 deadline;
        bool finalized;
        mapping(uint256 => uint256) votes;
        mapping(address => bool) hasVoted;
    }

    uint256 public electionCount;
    mapping(uint256 => Election) private elections;

    VoteToken public voteToken;

    event ElectionCreated(uint256 electionId, string title, uint256 deadline);
    event VoteCast(uint256 electionId, address voter, uint256 candidateId);
    event ElectionFinalized(uint256 electionId);

    constructor(address _voteToken) {
        voteToken = VoteToken(_voteToken);
    }

    function createElection(
        string memory _title,
        string[] memory _candidates,
        uint256 _duration
    ) external {
        require(_candidates.length >= 2, "At least 2 candidates required");

        Election storage e = elections[electionCount];
        e.title = _title;
        e.candidates = _candidates;
        e.deadline = block.timestamp + _duration;

        emit ElectionCreated(electionCount, _title, e.deadline);
        electionCount++;
    }

    function vote(uint256 _electionId, uint256 _candidateId) external {
        Election storage e = elections[_electionId];

        require(block.timestamp < e.deadline, "Voting ended");
        require(!e.hasVoted[msg.sender], "Already voted");
        require(_candidateId < e.candidates.length, "Invalid candidate");

        e.votes[_candidateId]++;
        e.hasVoted[msg.sender] = true;

        voteToken.mint(msg.sender, 10 * 10 ** 18);

        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    function finalizeElection(uint256 _electionId) external {
        Election storage e = elections[_electionId];
        require(block.timestamp >= e.deadline, "Voting still active");
        require(!e.finalized, "Already finalized");

        e.finalized = true;
        emit ElectionFinalized(_electionId);
    }

    function getElection(uint256 _electionId)
    external
    view
    returns (
        string memory title,
        string[] memory candidates,
        uint256 deadline,
        bool finalized
    )
    {
        Election storage e = elections[_electionId];
        return (e.title, e.candidates, e.deadline, e.finalized);
    }

    function getVotes(uint256 _electionId, uint256 _candidateId)
    external
    view
    returns (uint256)
    {
        return elections[_electionId].votes[_candidateId];
    }
}