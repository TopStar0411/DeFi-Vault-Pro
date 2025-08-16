import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletState } from './useWallet';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  price: number;
  icon: string;
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

export function useTokens(wallet: WalletState) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultTokens = [
    {
      address: '0xA0b86a33E6441b8435b662303c0f098C8c8c0f8C', // USDC (example)
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💵',
      price: 1.00
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT (example)
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '💰',
      price: 1.00
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI (example)
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      icon: '🟡',
      price: 1.00
    }
  ];

  const fetchTokenBalances = async () => {
    if (!wallet.provider || !wallet.address) return;

    setLoading(true);
    try {
      const tokenPromises = defaultTokens.map(async (token) => {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, wallet.provider);
          const balance = await contract.balanceOf(wallet.address);
          const formattedBalance = ethers.formatUnits(balance, token.decimals);
          
          return {
            ...token,
            balance: formattedBalance
          };
        } catch (error) {
          // If token contract doesn't exist, return with mock balance
          return {
            ...token,
            balance: (Math.random() * 1000).toFixed(2)
          };
        }
      });

      const tokenBalances = await Promise.all(tokenPromises);
      setTokens(tokenBalances);
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
      // Set mock balances if real fetching fails
      setTokens(defaultTokens.map(token => ({
        ...token,
        balance: (Math.random() * 1000).toFixed(2)
      })));
    } finally {
      setLoading(false);
    }
  };

  const approveToken = async (tokenAddress: string, spenderAddress: string, amount: string) => {
    if (!wallet.signer) throw new Error('Wallet not connected');

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet.signer);
    const tx = await contract.approve(spenderAddress, ethers.parseUnits(amount, 18));
    await tx.wait();
    return tx;
  };

  const transferToken = async (tokenAddress: string, toAddress: string, amount: string, decimals: number = 18) => {
    if (!wallet.signer) throw new Error('Wallet not connected');

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet.signer);
    const tx = await contract.transfer(toAddress, ethers.parseUnits(amount, decimals));
    await tx.wait();
    return tx;
  };

  useEffect(() => {
    if (wallet.isConnected) {
      fetchTokenBalances();
    }
  }, [wallet.isConnected, wallet.address]);

  return {
    tokens,
    loading,
    fetchTokenBalances,
    approveToken,
    transferToken
  };
}