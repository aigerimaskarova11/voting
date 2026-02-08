window.addEventListener("DOMContentLoaded", () => {

  let provider, signer, votingContract, voteTokenContract;

  const VOTING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const VOTETOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const VOTING_ABI = [
    "function createElection(string,string[],uint256)",
    "function vote(uint256,uint256)",
    "function getElection(uint256) view returns (string,string[],uint256,bool)",
    "function getVotes(uint256,uint256) view returns (uint256)"
  ];

  const VOTETOKEN_ABI = ["function balanceOf(address) view returns (uint256)"];

  const LOCAL_CHAIN_ID = 31337;

  const walletEl = document.getElementById("wallet");
  const networkEl = document.getElementById("network");
  const statusEl = document.getElementById("status");
  const balanceEl = document.getElementById("tokenBalance");

  const electionInfoEl = document.getElementById("electionInfo");
  const electionTitleEl = document.getElementById("electionTitle");
  const electionDeadlineEl = document.getElementById("electionDeadline");
  const candidateListEl = document.getElementById("candidateList");
  const votesListEl = document.getElementById("votesList");


  document.getElementById("connect").addEventListener("click", async () => {
    try {
      statusEl.innerText = "";

      if (!window.ethereum) {
        statusEl.innerText = "MetaMask not installed";
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      let chainId = window.ethereum.chainId;
      if (typeof chainId === "string" && chainId.startsWith("0x")) {
        chainId = parseInt(chainId, 16);
      }

      if (chainId !== LOCAL_CHAIN_ID) {
        statusEl.innerText = `Please switch MetaMask to Localhost 8545 (chainId 31337). Current chainId: ${chainId}`;
        return;
      }

      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();

      const address = await signer.getAddress();
      walletEl.innerText = "Connected: " + address;
      networkEl.innerText = "Network: Localhost (Hardhat)";

      votingContract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);
      voteTokenContract = new ethers.Contract(VOTETOKEN_ADDRESS, VOTETOKEN_ABI, signer);

      const balance = await voteTokenContract.balanceOf(address);
      balanceEl.innerText = "VoteToken Balance: " + ethers.formatUnits(balance, 18);

    } catch (err) {
      console.error(err);
      statusEl.innerText = "Connection failed: " + (err.message || err);
    }
  });


  document.getElementById("create").addEventListener("click", async () => {
    try {
      const title = document.getElementById("title").value;
      const c1 = document.getElementById("candidate1").value;
      const c2 = document.getElementById("candidate2").value;
      const duration = document.getElementById("duration").value;

      if (!title || !c1 || !c2 || !duration) {
        alert("Fill all fields");
        return;
      }

      const candidates = [c1, c2];
      const tx = await votingContract.createElection(title, candidates, duration);
      await tx.wait();
      alert("Election created successfully");

    } catch (err) {
      console.error(err);
      alert("Election creation failed: " + (err.message || err));
    }
  });

  document.getElementById("viewElection").addEventListener("click", async () => {
    try {
      const electionId = document.getElementById("viewElectionId").value;
      const [title, candidates, deadline, finalized] = await votingContract.getElection(electionId);

      electionTitleEl.innerText = title;
      electionDeadlineEl.innerText = new Date(Number(deadline)*1000).toLocaleString();
      candidateListEl.innerHTML = "";
      votesListEl.innerHTML = "";

      for (let i = 0; i < candidates.length; i++) {
        candidateListEl.innerHTML += `<li>[${i}] ${candidates[i]}</li>`;
        const votes = await votingContract.getVotes(electionId, i);
        votesListEl.innerHTML += `<li>${votes.toString()} votes</li>`;
      }

      electionInfoEl.style.display = "block";

      const now = Math.floor(Date.now() / 1000);
      document.getElementById("vote").disabled = finalized || now >= Number(deadline);

    } catch (err) {
      console.error(err);
      alert("Failed to load election: " + (err.message || err));
    }
  });

  document.getElementById("vote").addEventListener("click", async () => {
    try {
      const electionId = document.getElementById("viewElectionId").value;
      const candidateId = document.getElementById("candidateId").value;

      const tx = await votingContract.vote(electionId, candidateId);
      await tx.wait();
      alert("Vote cast successfully");

      const address = await signer.getAddress();
      const balance = await voteTokenContract.balanceOf(address);
      balanceEl.innerText = "VoteToken Balance: " + ethers.formatUnits(balance, 18);

    } catch (err) {
      console.error(err);
      alert("Voting failed: " + (err.message || err));
    }
  });

  document.getElementById("refreshBalance").addEventListener("click", async () => {
    try {
      const address = await signer.getAddress();
      const balance = await voteTokenContract.balanceOf(address);
      balanceEl.innerText = "VoteToken Balance: " + ethers.formatUnits(balance, 18);
    } catch (err) {
      console.error(err);
      alert("Failed to refresh balance: " + (err.message || err));
    }
  });

});
