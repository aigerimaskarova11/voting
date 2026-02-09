let provider, signer, crowdfunding, rewardToken;

const CROWDFUNDING_ADDRESS = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
const TOKEN_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const CROWDFUNDING_ABI = [
    "function createCampaign(string,uint256,uint256,string[2])",
    "function contribute(uint256) payable",
    "function vote(uint256,uint256)",
    "function getVotes(uint256) view returns(uint256[])",
    "function getOptions(uint256) view returns(string[])",
    "function campaignCount() view returns(uint256)",
    "function getCampaign(uint256) view returns(string,uint256,uint256,uint256,bool)",
    "function contributions(uint256,address) view returns(uint256)"
];

const TOKEN_ABI = ["function balanceOf(address) view returns(uint256)"];


document.getElementById("connect").onclick = async () => {
    try {
        if (!window.ethereum) throw new Error("MetaMask not installed");

        await window.ethereum.request({ method: "eth_requestAccounts" });

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        const chainId = parseInt(window.ethereum.chainId, 16);
        if (chainId !== 31337) throw new Error("Switch MetaMask to Localhost 8545");

        crowdfunding = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);
        rewardToken = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

        const addr = await signer.getAddress();
        document.getElementById("wallet").innerText = "Connected: " + addr;

        await updateBalances();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

async function updateBalances() {
    const addr = await signer.getAddress();
    const eth = await provider.getBalance(addr);
    const tok = await rewardToken.balanceOf(addr);

    document.getElementById("ethBalance").innerText = "ETH: " + ethers.formatEther(eth);
    document.getElementById("tokenBalance").innerText = "RWD: " + ethers.formatUnits(tok, 18);
}

document.getElementById("create").onclick = async () => {
    try {
        const title = document.getElementById("title").value;
        const goal = ethers.parseEther(document.getElementById("goal").value);
        const duration = Number(document.getElementById("duration").value);
        const option1 = document.getElementById("option1").value;
        const option2 = document.getElementById("option2").value;

        if (!title || !goal || !duration || !option1 || !option2)
            throw new Error("All fields required");

        const tx = await crowdfunding.createCampaign(title, goal, duration, [option1, option2]);
        await tx.wait();

        alert("Campaign created successfully!");
    } catch (err) {
        console.error(err);
        alert("Create campaign failed: " + (err.reason || err.message));
    }
};


document.getElementById("listCampaigns").onclick = async () => {
    try {
        if (!crowdfunding) throw new Error("Connect MetaMask first");

        const count = await crowdfunding.campaignCount();
        let html = "<ul class='list-group'>";

        for (let i = 0; i < count; i++) {
            const [title, goal, deadline, totalRaised, finalized] = await crowdfunding.getCampaign(i);
            html += `<li class='list-group-item'>
                <strong>ID:</strong> ${i} <br>
                <strong>Title:</strong> ${title} <br>
                <strong>Goal:</strong> ${ethers.formatEther(goal)} ETH <br>
                <strong>Total Raised:</strong> ${ethers.formatEther(totalRaised)} ETH <br>
                <strong>Deadline:</strong> ${new Date(Number(deadline)*1000).toLocaleString()} <br>
                <strong>Finalized:</strong> ${finalized}
            </li>`;
        }

        html += "</ul>";
        document.getElementById("campaignList").innerHTML = html;

    } catch (err) {
        console.error(err);
        alert("Failed to load campaigns: " + (err.reason || err.message));
    }
};


document.getElementById("contribute").onclick = async () => {
    try {
        const id = Number(document.getElementById("campaignId").value);
        const ethAmount = document.getElementById("amount").value;

        if (!id && id !== 0) throw new Error("Enter valid campaign ID");
        if (!ethAmount || Number(ethAmount) <= 0) throw new Error("Enter positive ETH amount");

        const tx = await crowdfunding.contribute(id, { value: ethers.parseEther(ethAmount) });
        await tx.wait();

        await updateBalances();
        alert("Contribution successful!");
    } catch (err) {
        console.error(err);
        alert("Contribution failed: " + (err.reason || err.message));
    }
};


document.getElementById("vote").onclick = async () => {
    try {
        const id = Number(document.getElementById("voteCampaignId").value);
        const optionIndex = Number(document.getElementById("voteOptionIndex").value);

        if (!id && id !== 0) throw new Error("Enter valid campaign ID");
        if (![0,1].includes(optionIndex)) throw new Error("Option index must be 0 or 1");

        const tx = await crowdfunding.vote(id, optionIndex);
        await tx.wait();

        await loadVotes(id);
        alert("Vote cast successfully!");
    } catch (err) {
        console.error(err);
        alert("Vote failed: " + (err.reason || err.message));
    }
};


async function loadVotes(campaignId) {
    try {
        const options = await crowdfunding.getOptions(campaignId);
        const votes = await crowdfunding.getVotes(campaignId);

        let html = "<ul>";
        for (let i = 0; i < options.length; i++) {
            html += `<li>${options[i]}: ${votes[i]} votes</li>`;
        }
        html += "</ul>";
        document.getElementById("voteResults").innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}


document.getElementById("voteCampaignId").addEventListener("change", async () => {
    const id = Number(document.getElementById("voteCampaignId").value);
    if (id || id === 0) await loadVotes(id);
});
