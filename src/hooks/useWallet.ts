import {
  useAccount,
  useBalance,
  useNetwork,
  useSwitchNetwork,
  useDisconnect,
} from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();

  const { data: balanceData } = useBalance({
    address,
    watch: true,
  });

  const getProvider = async (): Promise<ethers.BrowserProvider | null> => {
    if (!window.ethereum) return null;
    return new ethers.BrowserProvider(window.ethereum);
  };

  const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
    const provider = await getProvider();
    if (!provider) return null;
    return provider.getSigner();
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const switchNetwork = async (chainId: number) => {
    if (switchNetwork) {
      switchNetwork(chainId);
    }
  };

  const sendTransaction = async (transaction: {
    to: string;
    value?: string;
    data?: string;
    gasLimit?: string;
  }) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    const signer = await getSigner();
    if (!signer) {
      throw new Error("Failed to get signer");
    }

    const tx = await signer.sendTransaction({
      to: transaction.to,
      value: transaction.value
        ? ethers.parseEther(transaction.value)
        : undefined,
      data: transaction.data,
      gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
    });

    return await tx.wait();
  };

  const signMessage = async (message: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    const signer = await getSigner();
    if (!signer) {
      throw new Error("Failed to get signer");
    }

    return await signer.signMessage(message);
  };

  const wallet: WalletState = {
    isConnected,
    address: address || null,
    balance: balanceData ? ethers.formatEther(balanceData.value) : "0",
    chainId: chain?.id || null,
    provider: null, // Will be created on demand
    signer: null, // Will be created on demand
    isConnecting: false, // Web3Modal handles this
    error: null, // Web3Modal handles errors
  };

  return {
    wallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
    signMessage,
    getProvider,
    getSigner,
  };
}
