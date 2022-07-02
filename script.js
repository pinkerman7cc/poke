// lib
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(abi, CONTRACT_ADDR)
window.userWalletAddress = null

// DOM
const walletTopBtn = document.getElementById('connect-wallet-top');
const walletBtn = document.getElementById('connect');
const walletText = document.getElementById('wallet-text');
const connectedWallet = document.getElementById('connected-wallet');
const logoutBtn = document.getElementById('logout');

const mintBtn = document.getElementById('mint');
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
    walletBtn.classList.add('hide')
    logoutBtn.classList.remove('hide')
    walletTopBtn.classList.add('hide')
    walletText.innerText = 'Connected'
}

const accountChangeHook = () => {
    ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            window.userWalletAddress = accounts[0]
            connectedWallet.innerText = `Connected to: ${window.userWalletAddress}`
            walletBtn.classList.add("hide")
            walletTopBtn.classList.add("hide")
            logoutBtn.classList.remove("hide")
        } else {
            logoutBtn.classList.add("hide")
            connectedWallet.innerText = ``
            walletBtn.classList.remove('disabled')
            walletBtn.classList.remove('hide')
            walletTopBtn.classList.remove('disabled')
            walletTopBtn.classList.remove('hide')
            walletText.innerText = 'Connect Wallet'
        }
    });
}

const connectable = () => {
    if (!window.ethereum) {
        alert('MetaMask is not installed')
        const mintFeatures = document.getElementById('mint-features');
        mintFeatures.classList.add("hide");
        walletTopBtn.classList.add("hide");
        return false
    }

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

const getMinted = async () => {
    return await contract.methods.minted().call();
}

const getStarted = async () => {
    return await contract.methods.started().call();
}

const updateMinted = async () => {
    const minted = Number(await getMinted());
    mintedText.innerText = `${minted} `;
    if (minted == TOTAL_SUPPLY) {
        const mintFeatures = document.getElementById('mint-features');
        mintFeatures.classList.add("hide");
        walletTopBtn.classList.add("hide");
        const progress = document.getElementById('progress');
        progress.childNodes[0].textContent = 'Sold out: ';
        return true
    }
}

const getFreeMinted = async () => {
    return await contract.methods.freeMinted().call();
}

const getClaimed = async (addr) => {
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
    const claimed = await getClaimed(addr);
    if (claimed == MAX_MINT) {
        return true
    } else {
        return false
    }
}

const freeMintFinished = async () => {
    const num = await getFreeMinted();
    if (num == FREE_SUPPLY) {
        return true
    }
    return false
}

const mintFinished = async () => {
    const num = await getMinted();
    if (num == TOTAL_SUPPLY) {
        return true
    }
    return false
}

const mint = async () => {
    const amount = Number(mintAmount.innerText);
    mintBtn.childNodes[0].textContent = "Minting... "
    mintBtn.childNodes[1].textContent = ""
    mintBtn.classList.add('disabled')
    await switchNetwork();

    const claimed = Number(await getClaimed(window.userWalletAddress));

    if (claimed + amount > MAX_MINT) {
        alert("Exceed max mint")
        mintBtn.childNodes[0].textContent = "Mint "
        mintBtn.childNodes[1].textContent = "1"
        mintBtn.classList.remove('disabled')
        return
    }

    const minted = Number(await getMinted());
    if (minted + amount > TOTAL_SUPPLY) {
        alert("Exceed total supply")
        mintBtn.childNodes[0].textContent = "Mint "
        mintBtn.childNodes[1].textContent = "1"
        mintBtn.classList.remove('disabled')
        return
    }

    const freeQuota = FREE_SUPPLY - Number(await getFreeMinted());
    let freeAmount = 0;
    if (window.userWalletAddress !== null) {
        if (freeQuota >= MAX_MINT) {
            freeAmount = amount;
        } else if (freeQuota > 0) {
            freeAmount = freeQuota;
        } else {
            freeAmount = 0;
        }


        const requiredValue = (amount - freeAmount) * PRICE;
        console.log(requiredValue)
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
    mintBtn.childNodes[0].textContent = "Mint "
    mintBtn.childNodes[1].textContent = "1"
    mintBtn.classList.remove('disabled')
}

const mintAmountHook = () => {
    plus.addEventListener('click', () => {
        mintAmount.innerText = 2
    })
    minus.addEventListener('click', () => {
        mintAmount.innerText = 1
    })
}

const mintHook = () => {
    mintBtn.addEventListener('click', mint)
}

const logoutHook = () => {
    logoutBtn.addEventListener('click', () => {
        connectedWallet.innerText = ``
        walletBtn.classList.remove('hide')
        walletBtn.classList.remove('disabled')
        logoutBtn.classList.add('hide')
        walletTopBtn.classList.remove('hide')
        walletTopBtn.classList.remove('disabled')
        walletText.innerText = 'Connect'
    })
}

const connectHook = () => {
    walletBtn.addEventListener('click', loginWithMataMask)
    walletTopBtn.addEventListener('click', loginWithMataMask)
}

window.addEventListener('DOMContentLoaded', async (event) => {
    logoutBtn.classList.add('hide');
    setInterval(() => { updateMinted() }, 1000);
    if (connectable()) {
        await switchNetwork();
        const started = await getStarted();

        if (!started) {
            alert("Mint not started yet")
            return
        }

        const soldOut = await updateMinted();
        if (!soldOut) {
            await loginWithMataMask();
            connectHook();
            logoutHook();
            mintAmountHook();
            mintHook();
            accountChangeHook();
        }
    }
})