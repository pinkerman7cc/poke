window.addEventListener('DOMContentLoaded', (event) => {
    const walletBtn = document.getElementById('connect')
    const networkBtn = document.getElementById('network')
    const mintBtn = document.getElementById('mint')
    const addrText = document.getElementById('userWallet')
    window.userWalletAddress = null

    const loginWithMataMask = async () => {
        let accounts;
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        } catch (e) {
            console.error(e.message)
            return
        }
        window.userWalletAddress = accounts[0]
        addrText.innerHTML = `wallet: ${window.userWalletAddress}`
    }

    const connect = () => {
        if (!window.ethereum) {
            walletBtn.innerText = 'MetaMask is not installed'
            walletBtn.classList.remove('bg-purple-500', 'text-white')
            walletBtn.classList.add('bg-gray-500', 'text-gray-300', 'cursor-not-allowed')
            return false
        }

        walletBtn.addEventListener('click', loginWithMataMask)
    }

    const mint = async () => {
        if (window.userWalletAddress !== null) {
            ethereum
                .request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            from: window.userWalletAddress,
                            to: '0x1926ACaA886eD01875F58Ce01181e8563b624296',
                            data: contract.methods.mint(1).encodeABI()
                        },
                    ],
                })
                .then((txHash) => console.log(txHash))
                .catch((error) => console.error);
        }
    }

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(abi, '0x1926ACaA886eD01875F58Ce01181e8563b624296')

    const getID = async () => {
        return await web3.eth.net.getId()
    }


    const switchNetwork = async () => {
        const id = await getID()
        if (id !== 4) {
            networkBtn.innerHTML = `<p class="button-text">Incorrect Network</p>`
        } else {
            networkBtn.innerHTML = `<p class="button-text">Rinkeby</p>`
        }

    }

    connect();
    switchNetwork();
    networkBtn.addEventListener('click', async () => {
        try {
            accounts = await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x4' }]
            })

        } catch (e) {
            console.error(e.message)
        }
        networkBtn.innerHTML = `<p class="button-text">Rinkeby</p>`
    })
    mintBtn.addEventListener('click', mint)
});