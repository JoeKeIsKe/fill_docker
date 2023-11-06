import { ethers } from "ethers";

let provider: any = null;
let signer: any = null;

if (typeof window !== "undefined" && typeof window?.ethereum !== "undefined") {
  provider = new ethers.providers.Web3Provider(window?.ethereum, "any");
  signer = provider.getSigner();
}

export { provider, signer };
