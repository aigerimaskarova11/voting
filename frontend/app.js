window.addEventListener("DOMContentLoaded", () => {

    let provider;
    let signer;
    let votingContract;
    let voteTokenContract;

    async function updateVoteTokenBalance() {
        if (!voteTokenContract || !signer) return;
        const address = await signer.getAddress();
        const balance = await voteTokenContract.balanceOf(address);
        alert("Your VOTE token balance: " + ethers.formatUnits(balance, 18));
    }

    const VOTING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const VOTING_ABI = [
        "function createElection(string,string[],uint256)",
        "function vote(uint256,uint256)",
        "function getElection(uint256) view returns (string title, string[] memory candidates, uint256 deadline, bool finalized)",
        "function getVotes(uint256,uint256) view returns (uint256)",
        "function voteToken() view returns (address)"
    ];
    const LOCAL_CHAIN_ID = 31337;

    const connectBtn = document.getElementById("connect");
    const walletEl = document.getElementById("wallet");
    const networkEl = document.getElementById("network");
    const statusEl = document.getElementById("status");

    connectBtn.addEventListener("click", async () => {
        try {
            statusEl.innerText = "";

            if (!window.ethereum) {
                statusEl.innerText = "MetaMask is not installed";
                return;
            }

            await window.ethereum.request({ method: "eth_requestAccounts" });

            provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();

            if (Number(network.chainId) !== LOCAL_CHAIN_ID) {
                statusEl.innerText = "Please switch MetaMask to Localhost 8545";
                return;
            }

            signer = await provider.getSigner();
            const address = await signer.getAddress();

            walletEl.innerText = "Connected: " + address;
            networkEl.innerText = "Network: Localhost (Hardhat)";

            votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

            const voteTokenAddress = await votingContract.voteToken();
            voteTokenContract = new ethers.Contract(voteTokenAddress, [
                "function balanceOf(address) view returns (uint256)"
            ], signer);

            updateVoteTokenBalance();

        } catch (err) {
            console.error(err);
            statusEl.innerText = "Connection failed";
        }
    });

    document.getElementById("create").addEventListener("click", async () => {
        try {
            const title = document.getElementById("title").value;
            const candidates = document.getElementById("candidates").value
                .split(",")
                .map(c => c.trim());
            const duration = document.getElementById("duration").value;

            const tx = await votingContract.createElection(title, candidates, duration);
            await tx.wait();

            alert("Election created successfully");

        } catch (err) {
            console.error(err);
            alert("Election creation failed");
        }
    });

    document.getElementById("vote").addEventListener("click", async () => {
        try {
            const electionId = document.getElementById("electionId").value;
            const candidateId = document.getElementById("candidateId").value;

            const tx = await votingContract.vote(electionId, candidateId);
            await tx.wait();

            alert("Vote cast successfully");
            updateVoteTokenBalance();

        } catch (err) {
            console.error(err);
            alert("Voting failed");
        }
    });

    async function showElectionInfo() {
        const electionId = document.getElementById("electionId").value;
        const election = await votingContract.getElection(electionId);
        const title = election[0];
        const candidates = election[1];
        const deadline = new Date(Number(election[2]) * 1000).toLocaleString();
        const finalized = election[3];

        let votesStr = "";
        for (let i = 0; i < candidates.length; i++) {
            const votes = await votingContract.getVotes(electionId, i);
            votesStr += `${candidates[i]}: ${votes} votes\n`;
        }

        alert(`Election: ${title}\nDeadline: ${deadline}\nFinalized: ${finalized}\nVotes:\n${votesStr}`);
    }

    document.getElementById("showElection").addEventListener("click", showElectionInfo);

});
