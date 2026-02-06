window.addEventListener("DOMContentLoaded", () => {

    let provider;
    let signer;
    let votingContract;

    const VOTING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const VOTING_ABI = [
        "function createElection(string,string[],uint256)",
        "function vote(uint256,uint256)"
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

            await window.ethereum.request({
                method: "eth_requestAccounts"
            });

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

            votingContract = new ethers.Contract(
                VOTING_ADDRESS,
                VOTING_ABI,
                signer
            );

        } catch (err) {
            console.error(err);
            statusEl.innerText = "Connection failed";
        }
    });
});