import Web3 from "web3";

let web3:any

if (typeof window !== 'undefined' && typeof window?.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
} else {
    // https://medium.com/jelly-market/how-to-get-infura-api-key-e7d552dd396f
    const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/56f2e560f10342caae022634319bed78");
    web3 = new Web3(provider);
}

export default web3
