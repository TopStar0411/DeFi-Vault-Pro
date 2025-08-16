import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { WalletState } from "./useWallet";
import { swapService, TokenInfo } from "../services/swapService";

export interface Token extends TokenInfo {
  balance: string;
  price: number;
  icon: string;
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export function useTokens(wallet: WalletState) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const tokenIcons: Record<string, string> = {
    ETH: "🔷",
    USDC: "💵",
    USDT: "💰",
    DAI: "🟡",
    WETH: "🔷",
    MATIC: "🟣",
    BNB: "🟡",
  };

  const fetchTokens = async () => {
    if (!wallet.isConnected || !wallet.chainId) return;

    setLoading(true);
    try {
      // Get tokens from 1inch API
      const tokenList = await swapService.getTokens(wallet.chainId);

      // Filter to common tokens for better UX
      const commonTokens = tokenList.filter((token) =>
        ["ETH", "USDC", "USDT", "DAI", "WETH"].includes(token.symbol)
      );

      // Fetch balances for each token
      const tokensWithBalances = await Promise.all(
        commonTokens.map(async (token) => {
          try {
            const balance = await getTokenBalance(
              token.address,
              token.decimals
            );
            return {
              ...token,
              balance,
              price: getTokenPrice(token.symbol),
              icon: tokenIcons[token.symbol] || "🪙",
            };
          } catch (error) {
            console.error(
              `Failed to fetch balance for ${token.symbol}:`,
              error
            );
            return {
              ...token,
              balance: "0",
              price: getTokenPrice(token.symbol),
              icon: tokenIcons[token.symbol] || "🪙",
            };
          }
        })
      );

      setTokens(tokensWithBalances);
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
      // Fallback to default tokens
      setTokens(getDefaultTokens());
    } finally {
      setLoading(false);
    }
  };

  const getTokenBalance = async (
    tokenAddress: string,
    decimals: number
  ): Promise<string> => {
    if (!wallet.address) return "0";

    try {
      if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE") {
        // Native token (ETH)
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(wallet.address);
        return ethers.formatEther(balance);
      } else {
        // ERC20 token
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await contract.balanceOf(wallet.address);
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return "0";
    }
  };

  const getTokenPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      ETH: 2000,
      USDC: 1.0,
      USDT: 1.0,
      DAI: 1.0,
      WETH: 2000,
      MATIC: 0.8,
      BNB: 300,
    };
    return prices[symbol] || 1.0;
  };

  const getDefaultTokens = (): Token[] => {
    return [
      {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE",
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
        balance: "0",
        price: 2000,
        icon: "🔷",
      },
      {
        address: "0xA0b86a33E6441b8435b662303c0f098C8c8c0f8C",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        balance: "0",
        price: 1.0,
        icon: "💵",
      },
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        balance: "0",
        price: 1.0,
        icon: "💰",
      },
      {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        balance: "0",
        price: 1.0,
        icon: "🟡",
      },
    ];
  };

  const approveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    decimals: number = 18
  ) => {
    if (!wallet.address) throw new Error("Wallet not connected");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    const tx = await contract.approve(
      spenderAddress,
      ethers.parseUnits(amount, decimals)
    );
    await tx.wait();
    return tx;
  };

  const transferToken = async (
    tokenAddress: string,
    toAddress: string,
    amount: string,
    decimals: number = 18
  ) => {
    if (!wallet.address) throw new Error("Wallet not connected");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    const tx = await contract.transfer(
      toAddress,
      ethers.parseUnits(amount, decimals)
    );
    await tx.wait();
    return tx;
  };

  const refreshBalances = async () => {
    if (wallet.isConnected) {
      await fetchTokens();
    }
  };

  useEffect(() => {
    if (wallet.isConnected) {
      fetchTokens();
    } else {
      setTokens([]);
    }
  }, [wallet.isConnected, wallet.address, wallet.chainId]);

  return {
    tokens,
    loading,
    fetchTokens,
    approveToken,
    transferToken,
    refreshBalances,
  };
}
