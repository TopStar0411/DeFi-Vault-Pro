import { useState } from "react";
import { ethers } from "ethers";
import { WalletState } from "./useWallet";
import {
  swapService,
  SwapQuote,
  SwapTransaction,
  TokenInfo,
} from "../services/swapService";

export function useSwap(wallet: WalletState) {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getQuote = async (
    fromToken: TokenInfo,
    toToken: TokenInfo,
    amountIn: string,
    slippage: number = 1
  ): Promise<SwapQuote> => {
    if (!wallet.address) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // Convert amount to wei based on token decimals
      const amountInWei = ethers
        .parseUnits(amountIn, fromToken.decimals)
        .toString();

      const quote = await swapService.getQuote(
        fromToken.address,
        toToken.address,
        amountInWei,
        wallet.address,
        wallet.chainId || 1
      );

      setQuote(quote);
      return quote;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get quote";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async (
    fromToken: TokenInfo,
    toToken: TokenInfo,
    amountIn: string,
    slippage: number = 1
  ) => {
    if (!wallet.address) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // Get the swap transaction data
      const amountInWei = ethers
        .parseUnits(amountIn, fromToken.decimals)
        .toString();

      const swapTx = await swapService.executeSwap(
        fromToken.address,
        toToken.address,
        amountInWei,
        wallet.address,
        slippage,
        wallet.chainId || 1
      );

      // Execute the transaction using the wallet
      const provider =
        (await wallet.provider) || new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const transaction = {
        to: swapTx.to,
        data: swapTx.data,
        value: swapTx.value,
        gasLimit: swapTx.gas,
      };

      const tx = await signer.sendTransaction(transaction);
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Swap failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    decimals: number = 18
  ) => {
    if (!wallet.address) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      const provider =
        (await wallet.provider) || new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const erc20Abi = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ];

      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(
        wallet.address,
        spenderAddress
      );
      const requiredAmount = ethers.parseUnits(amount, decimals);

      if (currentAllowance < requiredAmount) {
        const tx = await tokenContract.approve(spenderAddress, requiredAmount);
        await tx.wait();
        return tx;
      }

      return null; // No approval needed
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Approval failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTokenBalance = async (
    tokenAddress: string,
    decimals: number = 18
  ): Promise<string> => {
    if (!wallet.address) {
      return "0";
    }

    try {
      const provider =
        (await wallet.provider) || new ethers.BrowserProvider(window.ethereum);

      if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE") {
        // Native token (ETH)
        const balance = await provider.getBalance(wallet.address);
        return ethers.formatEther(balance);
      } else {
        // ERC20 token
        const erc20Abi = [
          "function balanceOf(address owner) view returns (uint256)",
        ];
        const tokenContract = new ethers.Contract(
          tokenAddress,
          erc20Abi,
          provider
        );
        const balance = await tokenContract.balanceOf(wallet.address);
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return "0";
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    quote,
    error,
    getQuote,
    executeSwap,
    approveToken,
    getTokenBalance,
    clearError,
  };
}
