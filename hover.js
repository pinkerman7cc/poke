const explorer = document.getElementById("explorer");
const opensea = document.getElementById("opensea");
const twitter = document.getElementById("twitter");
const walletTop = document.getElementById("connect-wallet-top");

explorer.addEventListener('mouseover', () => {
    explorer.src = "./images/etherscan-hover.png"
})

explorer.addEventListener('mouseleave', () => {
    explorer.src = "./images/etherscan.png"
})

opensea.addEventListener('mouseover', () => {
    opensea.src = "./images/opensea-hover.png"
})

opensea.addEventListener('mouseleave', () => {
    opensea.src = "./images/opensea.png"
})

twitter.addEventListener('mouseover', () => {
    twitter.src = "./images/twitter-hover.png"
})

twitter.addEventListener('mouseleave', () => {
    twitter.src = "./images/twitter.png"
})

walletTop.addEventListener('mouseover', () => {
    walletTop.src = "./images/wallet-hover.png"
})

walletTop.addEventListener('mouseleave', () => {
    walletTop.src = "./images/wallet.png"
})