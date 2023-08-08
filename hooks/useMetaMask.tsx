'use client';

import { useState, useEffect, createContext, PropsWithChildren, useContext, useCallback } from "react";
import detectEthereumProvider from '@metamask/detect-provider'
import notification from "antd/es/notification";
import Modal from '@/packages/modal';
import Button from "@/packages/button";
import { isIndent } from '@/utils';
import { getSvg } from "@/svgTypes";

interface WalletState {
    accounts: any[]
    balance: string
    chainId: string
}

interface MetaMaskContextData {
    wallet: WalletState
    currentAccount: string
    hasProvider: boolean | null
    error: boolean
    errorMsg: string
    isConnecting: boolean
    connectButton: () => React.ReactNode
    connectMetaMask: () => void
    clearError: () => void
}

const disconnectedState: WalletState = { accounts: [], balance: '', chainId: '' }

const MetaMaskContext = createContext<MetaMaskContextData>({} as MetaMaskContextData)

export const MetaMaskContextProvider = ({ children }: PropsWithChildren) => {
    const [hasProvider, setHasProvider] = useState<boolean | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const openModal = () => { setIsOpen(true) }
    const closeModal = () => { setIsOpen(false) }

    const [errorMsg, setErrorMsg] = useState('')
    const clearError = () => setErrorMsg('')
    
    const [api, contextHolder] = notification.useNotification();

    const [wallet, setWallet] = useState(disconnectedState)
    const [currentAccount, setCurrentAccount] = useState<string>('')

    useEffect(() => {
        setCurrentAccount(wallet?.accounts[0])
    }, [wallet])

    const _updateWallet = useCallback(async (providedAccounts?: any) => {
        const accounts = providedAccounts || await window?.ethereum.request({ method: 'eth_accounts' })

        if (accounts.length === 0) {
            // If there are no accounts, then the user is disconnected
            setWallet(disconnectedState)
            return
        }

        const balance = await window?.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
        })
        const chainId = await window?.ethereum.request({
            method: 'eth_chainId'
        })

        setWallet({ accounts, balance, chainId })
    }, [])

    const updateWalletAndAccounts = useCallback(() => _updateWallet(), [_updateWallet])
    const updateWallet = useCallback((acounts: any) => _updateWallet(acounts), [_updateWallet])

    const getProvider = async () => {
        let provider:any = await detectEthereumProvider({ silent: true, mustBeMetaMask: true })

        // If user has multiple wallets, find MetaMask Provider
        if (provider?.providers) {
            provider.providers.forEach(async (p: any) => {
                if (p.isMetaMask) {
                    provider = p
                }
              })
            //  to do: window.ethereum is not supposed to be overwritten. try to find out a better way to deal with it.
            window.ethereum = provider
        }
        
        setHasProvider(Boolean(provider))

        if (provider) {
            updateWalletAndAccounts()
            window?.ethereum.on('accountsChanged', updateWallet)
            window?.ethereum.on('chainChanged', updateWalletAndAccounts)
        }
    }

    useEffect(() => {
        getProvider()
        return () => {
            window?.ethereum?.removeListener('accountsChanged', updateWallet)
            window?.ethereum?.removeListener('chainChanged', updateWalletAndAccounts)
        }
    }, [updateWallet, updateWalletAndAccounts])

    const connectMetaMask = async () => {
        if (!hasProvider) {
            api.warning({
                message: 'Please install MetaMask!',
                placement: 'top'
            })
            closeModal()
            return window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en')
        }
        setIsConnecting(true)
        try {
            const accounts = await window?.ethereum?.request({
                method: 'eth_requestAccounts'
            })
            clearError()
            closeModal()
            updateWallet(accounts)
        } catch (err: any) {
            setErrorMsg(err.message)
        }
        setIsConnecting(false)
    }

    const connectButton = () => {
        const { accounts = [] } = wallet
        const len = accounts.length
        if (len < 1) {
            return <Button onClick={openModal}>Connect Wallet</Button>
        }
        return  <div className="btn-default p-2 rounded">{isIndent(accounts[0])}</div>
    }

    useEffect(() => {
        if (Boolean(errorMsg)) {
            api.error({
                message: errorMsg,
                placement: 'bottomRight'
            })
            clearError()
        }
    }, [errorMsg])

    return (
        <MetaMaskContext.Provider
            value={{
                wallet,
                currentAccount,
                hasProvider,
                error: Boolean(errorMsg),
                errorMsg,
                isConnecting,
                connectButton,
                connectMetaMask,
                clearError,
            }}
        >
            {children}
            <Modal
                show={isOpen}
                title='Connect Wallet'
                onChange={closeModal}
                onCancel={closeModal}
            >
                <div className="space-y-6 mt-5">
                    {/* for now only one wallet is supported */}
                    {['MetaMask'].map((wallet) => {
                    return (
                            <p
                                className='flex items-center gap-x-2.5 p-2.5 rounded cursor-pointer hover:bg-slate-200'
                                key={wallet}
                                onClick={connectMetaMask}
                            >
                                <span className='icon'>{getSvg(`wallect_metamask`)}</span>
                                {wallet}
                            </p>
                        );
                    })}
                </div>        
            </Modal>
            {contextHolder}
        </MetaMaskContext.Provider>
    )
}

export const useMetaMask = () => {
    const context = useContext(MetaMaskContext)
    if (context === undefined) {
        throw new Error('useMetaMask must be used within a "MetaMaskContextProvider"')
    }
    return context
}
