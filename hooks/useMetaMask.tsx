"use client";

import {
  useState,
  useEffect,
  createContext,
  PropsWithChildren,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { Button, Space } from "antd";
import detectEthereumProvider from "@metamask/detect-provider";
import notification from "antd/es/notification";
import Modal from "@/packages/modal";
import { isIndent, formatBalance, setStorage } from "@/utils";
import { getSvg } from "@/svgTypes";
import { NETWORK } from "@/constants";

interface WalletState {
  accounts: any[];
  balance: string;
  chainId: string;
}

interface MetaMaskContextData {
  wallet: WalletState;
  currentAccount: string | undefined;
  hasProvider: boolean | null;
  error: boolean;
  errorMsg: string;
  isConnecting: boolean;
  isNetworkCorrect: boolean;
  connectButton: () => React.ReactNode;
  connectMetaMask: () => void;
  clearError: () => void;
}

const disconnectedState: WalletState = {
  accounts: [],
  balance: "",
  chainId: "",
};

const MetaMaskContext = createContext<MetaMaskContextData>(
  {} as MetaMaskContextData
);

export const MetaMaskContextProvider = ({ children }: PropsWithChildren) => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };

  const [errorMsg, setErrorMsg] = useState("");
  const clearError = () => setErrorMsg("");

  const [api, contextHolder] = notification.useNotification();

  const [wallet, setWallet] = useState(disconnectedState);
  const [currentAccount, setCurrentAccount] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setCurrentAccount(wallet?.accounts[0]);
    setStorage("network_info", {
      isNetworkCorrect,
      chainId: wallet?.chainId,
    });
  }, [wallet, wallet?.accounts]);

  const _updateWallet = useCallback(async (providedAccounts?: any) => {
    const accounts =
      providedAccounts ||
      (await window?.ethereum.request({ method: "eth_accounts" }));

    if (accounts.length === 0) {
      const chainId = await window?.ethereum.request({
        method: "eth_chainId",
      });
      // If there are no accounts, then the user is disconnected
      setWallet({ ...disconnectedState, chainId });
      return;
    }
    const balance = formatBalance(
      await window?.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })
    );
    const chainId = await window?.ethereum.request({
      method: "eth_chainId",
    });

    setWallet({ accounts, balance, chainId });
  }, []);

  const isNetworkCorrect = useMemo(() => {
    return NETWORK.some((item) => item.chainId === wallet?.chainId);
  }, [wallet, wallet?.chainId]);

  const updateWalletAndAccounts = useCallback(
    () => _updateWallet(),
    [_updateWallet]
  );
  const updateWallet = useCallback(
    (acounts: any) => _updateWallet(acounts),
    [_updateWallet]
  );

  const getProvider = async () => {
    let provider: any = await detectEthereumProvider({
      silent: true,
      mustBeMetaMask: true,
    });

    // If user has multiple wallets, find MetaMask Provider
    if (provider?.providers && typeof window !== "undefined") {
      provider.providers.forEach(async (p: any) => {
        if (p.isMetaMask) {
          provider = p;
        }
      });
      //  to do: window.ethereum is not supposed to be overwritten. try to find out a better way to deal with it.
      window.ethereum = provider;
    }

    setHasProvider(Boolean(provider));

    if (provider) {
      updateWalletAndAccounts();
      window?.ethereum.on("accountsChanged", updateWallet);
      window?.ethereum.on("chainChanged", updateWalletAndAccounts);
    }
  };

  useEffect(() => {
    getProvider();
    return () => {
      window?.ethereum?.removeListener("accountsChanged", updateWallet);
      window?.ethereum?.removeListener("chainChanged", updateWalletAndAccounts);
    };
  }, [updateWallet, updateWalletAndAccounts]);

  const connectMetaMask = async () => {
    if (!hasProvider) {
      api.warning({
        message: "Please install MetaMask!",
        placement: "top",
      });
      closeModal();
      return window?.open(
        "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en"
      );
    }
    setIsConnecting(true);
    try {
      const accounts = await window?.ethereum?.request({
        method: "eth_requestAccounts",
      });
      clearError();
      closeModal();
      updateWallet(accounts);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
    setIsConnecting(false);
  };

  const connectButton = () => {
    const { accounts = [] } = wallet;
    const len = accounts.length;
    if (len < 1) {
      return (
        <button className="connect-btn" onClick={openModal}>
          Connect Wallet
        </button>
      );
    }
    return (
      <Button type="primary" size="large">
        {isIndent(accounts[0])}
      </Button>
    );
  };

  useEffect(() => {
    if (Boolean(errorMsg)) {
      api.error({
        message: errorMsg,
      });
      clearError();
    }
  }, [errorMsg]);

  return (
    <MetaMaskContext.Provider
      value={{
        wallet,
        currentAccount,
        hasProvider,
        error: Boolean(errorMsg),
        errorMsg,
        isConnecting,
        isNetworkCorrect,
        connectButton,
        connectMetaMask,
        clearError,
      }}
    >
      {children}
      <Modal
        show={isOpen}
        title="Connect Wallet"
        onChange={closeModal}
        onCancel={closeModal}
      >
        <div className="space-y-6 mt-5">
          {/* for now only one wallet is supported */}
          {["MetaMask"].map((wallet) => {
            return (
              <div
                className="p-2 rounded cursor-pointer hover:bg-slate-200"
                key={wallet}
                onClick={connectMetaMask}
              >
                <Space align="center">
                  <span className="icon">{getSvg(`wallect_metamask`)}</span>
                  <span>{wallet}</span>
                </Space>
              </div>
            );
          })}
        </div>
      </Modal>
      {contextHolder}
    </MetaMaskContext.Provider>
  );
};

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error(
      'useMetaMask must be used within a "MetaMaskContextProvider"'
    );
  }
  return context;
};
