// config
const NETWORK_ID = 4;
// const CONTRACT_ADDR = '0x3f179Bb801dd1DF3263724C0AA7a959ACa8A5c08';
// const TOTAL_SUPPLY = 5000;
// const FREE_SUPPLY = 2000;
// const MAX_MINT = 2;
// const PRICE = 0.00777;
const CONTRACT_ADDR = '0xc3f2CC8C9f7F859e1b0F6368d674c8E53F78d0b5';
const TOTAL_SUPPLY = 10;
const FREE_SUPPLY = 5;
const MAX_MINT = 2;
const PRICE = 0.00777;


// lib
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(abi, CONTRACT_ADDR)
window.userWalletAddress = null

// DOM
const walletTopBtn = document.getElementById('connect-wallet-top');
const walletBtn = document.getElementById('connect');
const walletText = document.getElementById('wallet-text');
const connectedWallet = document.getElementById('connected-wallet');

const mintBtn = document.getElementById('mint');
const mintText = document.getElementById('mint-text');
const minus = document.getElementById('minus');
const plus = document.getElementById('plus');
const mintAmount = document.getElementById('mint-amount');
const mintedText = document.getElementById('minted');

const loginWithMataMask = async () => {
    walletBtn.classList.add('disabled')
    walletTopBtn.classList.add('disabled')
    walletText.innerText = 'Connecting...'
    let accounts;
    try {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    } catch (err) {
        alert(err.message)
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

const getID = async () => {
    return await web3.eth.net.getId()
}

const switchNetwork = async () => {
    let id
    try {
        id = await web3.eth.net.getId()
    } catch (err) {
        alert(err.message)
    }

    if (id !== NETWORK_ID) {
        try {
            accounts = await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${NETWORK_ID}` }]
            })
        } catch (e) {
            alert(e.message)
        }
    }

    ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });
}

const minted = async () => {
    return await contract.methods.minted().call();
}

const updateMinted = async () => {
    const mintedNFT = Number(await minted());
    mintedText.innerText = `${mintedNFT} `;
    if (mintedNFT == TOTAL_SUPPLY) {

    }
}

const freeMinted = async () => {
    return await contract.methods.freeMinted().call();
}

const addressClaimed = async (addr) => {
    let claimed = 0;

    try {
        claimed = await contract.methods.addressClaimed(addr).call();
    } catch (err) {
        alert(err.message)
        console.log(err.message)
    }
    return claimed
};

const exceedMaxMint = async (addr) => {
    const claimed = await addressClaimed(addr);
    if (claimed == MAX_MINT) {
        return true
    } else {
        return false
    }
}

const freeMintFinished = async () => {
    const num = await freeMinted();
    if (num == FREE_SUPPLY) {
        return true
    }
    return false
}

const mintFinished = async () => {
    const num = await minted();
    if (num == TOTAL_SUPPLY) {
        return true
    }
    return false
}

const mint = async () => {
    await switchNetwork();

    const amount = Number(mintAmount.innerText);
    const claimed = Number(await addressClaimed(window.userWalletAddress));

    if (claimed + amount > MAX_MINT) {
        alert("Exceed max mint")
        return
    }

    const mintedNFT = Number(await minted());
    if (mintedNFT + amount > TOTAL_SUPPLY) {
        alert("Exceed total supply")
        return
    }

    const freeOver = await freeMintFinished();
    const freeQuota = FREE_SUPPLY - Number(await freeMinted());
    let freeAmount = 0;
    if (window.userWalletAddress !== null) {
        if (freeQuota > MAX_MINT) {
            freeAmount = amount;
        } else if (freeQuota > 0) {
            freeAmount = freeQuota;
        } else {
            freeAmount = 0;
        }


        const requiredValue = (amount - freeAmount) * PRICE;
        try {
            await contract.methods.mint(amount).send({
                from: window.userWalletAddress,
                value: web3.utils.toWei(requiredValue.toString(), 'ether'),
            })
        } catch (err) {
            alert(err.message)
        }

        updateMinted();
    }
}

const mintAmountBtn = () => {
    plus.addEventListener('click', () => {
        mintAmount.innerText = 2
    })
    minus.addEventListener('click', () => {
        mintAmount.innerText = 1
    })
}

window.addEventListener('DOMContentLoaded', async (event) => {
    updateMinted();
    if (connectable()) {
        await switchNetwork()
        await loginWithMataMask()
        accountChange()
        mintAmountBtn()
        mintBtn.addEventListener('click', mint)
    }
})