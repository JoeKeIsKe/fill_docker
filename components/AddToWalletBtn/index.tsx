"use client";

import { Button, notification } from "antd";
import { FIT_contract, FIG_contract } from "@/contract";

interface Props {
  coinType: "FIT" | "FIG";
}

function AddToWalletBtn({ coinType }: Props) {
  const [api, contextHolder] = notification.useNotification();

  const CoinTypeMap = {
    FIT: {
      address: FIT_contract,
      symbol: "FIT",
    },
    FIG: {
      address: FIG_contract,
      symbol: "FIG",
    },
  };

  const handleAddToWallet = async () => {
    const res = await window?.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          decimals: 18,
          ...CoinTypeMap[coinType],
        },
      },
    });
    if (res) {
      api.success({
        message: "Token successfully added",
      });
    }
  };

  return (
    <>
      <Button
        className="bg-gray-400 text-[#fff] !text-xs !rounded-[24px] border-none hover:!text-[#fff] !h-[22px] ml-2"
        size="small"
        onClick={handleAddToWallet}
      >
        Add to wallet
      </Button>
      {contextHolder}
    </>
  );
}

export default AddToWalletBtn;
