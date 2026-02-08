window.addEventListener("DOMContentLoaded", () => {

  let provider, signer, contract, rewardToken;

  const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const CONTRACT_ABI = [
    "function createElection(string,string[],uint256)",
    "function vote(uint256,uint256)",
    "function getElection(uint256) view returns (string,string[],uint256,bool)",
    "function getVotes(uint256,uint256) view returns (uint256)"
  ];

  const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)"
  ];

  const walletEl = document.getElementById("wallet");
  const statusEl = document.getElementById("status");
  const balanceEl = document.getElementById("tokenBalance");

  const eventInfoEl = document.getElementById("eventInfo");
  const eventTitleEl = document.getElementById("eventTitle");
  const eventDeadlineEl = document.getElementById("eventDeadline");
  const optionListEl = document.getElementById("optionList");
  const participationListEl = document.getElementById("participationList");


  document.getElementById("connect").addEventListener("click", async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();

      const address = await signer.getAddress();
      walletEl.innerText = "Connected: " + address;

      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      rewardToken = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

      const balance = await rewardToken.balanceOf(address);
      balanceEl.innerText = ethers.formatUnits(balance, 18);

    } catch (err) {
      console.error(err);
      statusEl.innerText = "Wallet connection failed";
    }
  });


  document.getElementById("create").addEventListener("click", async () => {
    try {
      const title = document.getElementById("title").value;
      const o1 = document.getElementById("option1").value;
      const o2 = document.getElementById("option2").value;
      const duration = document.getElementById("duration").value;

      const options = [o1, o2];
      await (await contract.createElection(title, options, duration)).wait();

      alert("Event created successfully");

    } catch (err) {
      console.error(err);
      alert("Event creation failed");
    }
  });


  document.getElementById("viewEvent").addEventListener("click", async () => {
    try {
      const eventId = document.getElementById("eventId").value;
      const [title, options, deadline] = await contract.getElection(eventId);

      eventTitleEl.innerText = title;
      eventDeadlineEl.innerText = new Date(Number(deadline) * 1000).toLocaleString();

      optionListEl.innerHTML = "";
      participationListEl.innerHTML = "";

      for (let i = 0; i < options.length; i++) {
        optionListEl.innerHTML += `<li>[${i}] ${options[i]}</li>`;
        const count = await contract.getVotes(eventId, i);
        participationListEl.innerHTML += `<li>${count.toString()} participations</li>`;
      }

      eventInfoEl.style.display = "block";

    } catch (err) {
      console.error(err);
      alert("Failed to load event");
    }
  });


  document.getElementById("participate").addEventListener("click", async () => {
    try {
      const eventId = document.getElementById("eventId").value;
      const optionId = document.getElementById("optionId").value;

      await (await contract.vote(eventId, optionId)).wait();
      alert("Participation recorded");

      const address = await signer.getAddress();
      const balance = await rewardToken.balanceOf(address);
      balanceEl.innerText = ethers.formatUnits(balance, 18);

    } catch (err) {
      console.error(err);
      alert("Participation failed");
    }
  });

  
  document.getElementById("refreshBalance").addEventListener("click", async () => {
    try {
      const address = await signer.getAddress();
      const balance = await rewardToken.balanceOf(address);
      balanceEl.innerText = ethers.formatUnits(balance, 18);
    } catch (err) {
      console.error(err);
    }
  });

});
