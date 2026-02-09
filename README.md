
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
git clone https://github.com/aigerimaskarova11/voting.git
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
const CROWDFUNDING_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
const TOKEN_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
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
	
```

