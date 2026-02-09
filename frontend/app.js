let provider, signer, crowdfunding, rewardToken;

const CROWDFUNDING_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
const TOKEN_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";

const CROWDFUNDING_ABI = [
    "function createCampaign(string,uint256,uint256)",
    "function contribute(uint256) payable",
    "function finalize(uint256)",
    "function campaignCount() view returns(uint256)"
];

const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)"
];

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

        document.getElementById("wallet").innerText = "Connected: " + await signer.getAddress();
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
        if (!crowdfunding) throw new Error("Connect MetaMask first");

        const title = document.getElementById("title").value;
        const goal = ethers.parseEther(document.getElementById("goal").value);
        const duration = Number(document.getElementById("duration").value);

        const tx = await crowdfunding.createCampaign(title, goal, duration);
        await tx.wait();
        alert("Campaign created successfully");
    } catch (err) {
        console.error(err);
        alert("Create campaign failed: " + (err.reason || err.message));
    }
};

document.getElementById("contribute").onclick = async () => {
    try {
        if (!crowdfunding) throw new Error("Connect MetaMask first");

        const id = Number(document.getElementById("campaignId").value);
        const eth = document.getElementById("amount").value;
        if (!eth || eth <= 0) throw new Error("Enter a positive ETH amount");

        const tx = await crowdfunding.contribute(id, { value: ethers.parseEther(eth) });
        await tx.wait();

        await updateBalances();
        alert("Contribution successful!");
    } catch (err) {
        console.error(err);
        alert("Contribution failed: " + (err.reason || err.message));
    }
};
