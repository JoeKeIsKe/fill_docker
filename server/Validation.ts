import Valid from "@/server/jsons/Validation_metadata.json";
import { Validation_contract } from "@/contract";
import { ethers } from "ethers";

let provider: any = null;
let signer: any = null;

if (typeof window !== "undefined" && typeof window?.ethereum !== "undefined") {
  provider = new ethers.providers.Web3Provider(window?.ethereum);
  signer = provider.getSigner();
}

class Validation {
  [x: string]: any;
  contractAbi: any;
  contractAddress: string;
  myContract: any;

  constructor() {
    this.contractAbi = JSON.parse(JSON.stringify(Valid.output.abi));
    this.contractAddress = Validation_contract;
    this.myContract = new ethers.Contract(
      this.contractAddress,
      this.contractAbi,
      signer
    );
  }

  async getSigningMsg(type: string) {
    const result = await this.myContract.callStatic.getSigningMsg(type);
    return result;
  }
}

const validation = new Validation();
export default validation;

/*
./keytool message build --from=f028180 --to=f029299 --method=30 --args='{"NewBeneficiary":"f028180","NewQuota":"0","NewExpiration":0}'
*/
