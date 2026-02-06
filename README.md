
# Decentralized Voting System

## Description
A blockchain-based voting system deployed on Ethereum test networks.

## Features
- Create elections
- Vote securely
- ERC-20 participation rewards
- MetaMask integration

## Tech Stack
- Solidity
- Hardhat
- JavaScript
- MetaMask

---

## Prerequisites

1. Node.js & npm installed: [https://nodejs.org](https://nodejs.org)
2. MetaMask browser extension: [https://metamask.io](https://metamask.io)
3. Hardhat installed globally (optional):


## How to Run
1. Clone the repository
```bash
git clone https://github.com/aigerimaskarova11/final_block_Aigerim_Sagi_Sabira.git
```

2. Install dependencies
```bash
npm install
```
3. Start Hardhat local blockchain
```bash
npx hardhat node
```

4. Deploy contracts on localhost network

```bash
npx hardhat run scripts/deploy.js --network localhost
```

5. Copy the voting address into app.js

```bash
const VOTING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
```

6. Configure Metamask
```bash
	1.  Open MetaMask
	    
	2.  Add a new network:
	        
	    -   RPC URL: `http://127.0.0.1:8545`
	        
	    -   Chain ID: `31337`
	        
	3.  Import one of the private keys from Hardhat accounts
	    
	4.  You should get 10000 ETH tokens as a result
```

7. Start your frontend
```bash
npx serve frontend
```

8. 
```bash
	1. Connect to Metamask 
	2. Create Election by:
		1. Enter the title
		2. candidates (separate by comma)
		3. enter the duration of election
	3.Test vote
		1. Enter Clection ID
		2. Enter Candidate ID
		3. Click Cast Vote
	4. You are going to receive VoteToken(ERC-20) for participation
```

