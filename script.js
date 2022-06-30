// config
const NETWORK_ID = 4;
const CONTRACT_ADDR = '0x3f179Bb801dd1DF3263724C0AA7a959ACa8A5c08';
const TOTAL_SUPPLY = 5000;
const MAX_MINT = 2;
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(abi, CONTRACT_ADDR)

// DOM
const walletTopBtn = document.getElementById('connect-wallet-top');
const walletBtn = document.getElementById('connect');
const walletText = document.getElementById('wallet-text');
const mintBtn = document.getElementById('mint');
const mintText = document.getElementById('mint-text');
const connectedWallet = document.getElementById('connected-wallet');
const mintedText = document.getElementById('minted');
window.userWalletAddress = null

const loginWithMataMask = async () => {
    walletBtn.classList.add('disabled')
    walletTopBtn.classList.add('disabled')
    walletText.innerText = 'Connecting...'
    let accounts;
    try {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    } catch (e) {
        console.error(e.message)
        walletBtn.classList.remove('disabled')
        walletTopBtn.classList.remove('disabled')
        walletText.innerText = 'Connect Wallet'
        return
    }

    window.userWalletAddress = accounts[0]
    connectedWallet.innerText = `Connected to: ${window.userWalletAddress}`
    walletBtn.classList.add('disabled')
    walletTopBtn.classList.add('disabled')
    walletText.innerText = 'Connected'
}

const accountChange = () => {
    ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            window.userWalletAddress = accounts[0]
            connectedWallet.innerText = `Connected to: ${window.userWalletAddress}`
            exceedMaxMint(window.userWalletAddress)
        } else {
            connectedWallet.innerText = ``
            walletText.innerText = 'Connect Wallet'
        }
    });
}


const connectable = () => {
    if (!window.ethereum) {
        alert('MetaMask is not installed')
        walletText.innerText = 'Install Metamask'
        walletBtn.classList.add('disabled')
        mintBtn.classList.add('disabled')
        return false
    }

    walletBtn.addEventListener('click', loginWithMataMask)
    walletTopBtn.addEventListener('click', loginWithMataMask)
    return true
}

const mint1 = async () => {
    try {
        await mint(1);
    } catch (err) {
        console.error(err.message)
    }
}

const mint2 = async () => {
    try {
        await mint(2);
    } catch (err) {
        console.error(err.message)
    }
}

const mint = async () => {
    const network = await getID()
    if (network !== NETWORK_ID) {
        try {
            await switchNetwork()
        } catch (err) {
            console.error(err.message)
        }
    }

    mintBtn.classList.add('disabled')
    mintText.innerText = "Minting..."
    if (window.userWalletAddress !== null) {
        try {
            const receipt = await contract.methods.mint(2).send({
                from: window.userWalletAddress
            })

            await exceedMaxMint(window.userWalletAddress);
            await wroteMinted();
        } catch (err) {
            console.error(err)
        }
    }
}

const getID = async () => {
    return await web3.eth.net.getId()
}

const switchNetwork = async () => {
    let id
    try {
        id = await web3.eth.net.getId()
    } catch (err) {
        console.error(err)
    }

    if (id !== NETWORK_ID) {
        try {
            accounts = await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${NETWORK_ID}` }]
            })
        } catch (e) {
            console.error(e.message)
        }
    }

    ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });
}

const minted = async () => {
    return await contract.methods.minted().call();
}

const wroteMinted = async () => {
    const mintedNFT = await minted();
    mintedText.innerText = `${mintedNFT} `;
}

const freeMinted = async () => {
    return await contract.methods.freeMinted().call();
}

const addressClaimed = async (addr) => {
    return await contract.methods.addressClaimed(addr).call();
};

const exceedMaxMint = async (addr) => {
    const claimed = await addressClaimed(addr);
    console.log(claimed);
    if (claimed == 2) {
        mintBtn.classList.add('disabled')
        mintText.innerText = "Max Mint: 2"
    } else {
        mintBtn.classList.remove('disabled')
        mintText.innerText = "Mint: 2"
    }
}

window.addEventListener('DOMContentLoaded', async (event) => {
    if (connectable()) {
        await switchNetwork()
        await loginWithMataMask()
        await exceedMaxMint(window.userWalletAddress);
        accountChange()
        mintBtn.addEventListener('click', mint)
        wroteMinted();
    }
});