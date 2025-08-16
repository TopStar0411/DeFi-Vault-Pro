import React, { useState } from 'react';
import { ArrowDown, ArrowUp, TrendingUp, Shield, Zap, RefreshCw } from 'lucide-react';
import { WalletState } from '../hooks/useWallet';
import { Token } from '../hooks/useTokens';
import { useVault } from '../hooks/useVault';

interface VaultInterfaceProps {
  wallet: WalletState;
  tokens: Token[];
  vault: ReturnType<typeof useVault>;
}

export function VaultInterface({ wallet, tokens, vault }: VaultInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [isProcessing, setIsProcessing] = useState(false);

  const { vaultStats, loading } = vault;

  const handleTransaction = async () => {
    if (!wallet.isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      if (activeTab === 'deposit') {
        const selectedTokenData = tokens.find(t => t.symbol === selectedToken);
        await vault.deposit(amount, selectedTokenData?.address || '');
        alert(`Successfully deposited ${amount} ${selectedToken}`);
      } else {
        await vault.withdraw(amount);
        alert(`Successfully withdrew ${amount} ${selectedToken}`);
      }
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const setMaxAmount = () => {
    if (activeTab === 'deposit') {
      const selectedTokenData = tokens.find(t => t.symbol === selectedToken);
      if (selectedTokenData) {
        setAmount(selectedTokenData.balance);
      }
    } else {
      // For withdrawal, set max to user's vault balance
      setAmount(vaultStats.userAssets);
    }
  };

  return (
    <div className="space-y-8">
      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-gray-400">Total Shares</span>
          </div>
          <p className="text-lg font-semibold text-white">{vaultStats.totalShares.replace('.', ',')}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Share Price</span>
          </div>
          <p className="text-lg font-semibold text-white">${vaultStats.sharePrice}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Current APY</span>
          </div>
          <p className="text-lg font-semibold text-green-400">{vaultStats.apy}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-400">Your Shares</span>
          </div>
          <p className="text-lg font-semibold text-white">{vaultStats.userShares}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-400">Your Value</span>
          </div>
          <p className="text-lg font-semibold text-cyan-400">${vaultStats.userAssets}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-400">Perf. Fee</span>
          </div>
          <p className="text-lg font-semibold text-purple-400">2%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Interface */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-l-lg transition-colors ${
                activeTab === 'deposit'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ArrowDown className="h-4 w-4" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-r-lg transition-colors ${
                activeTab === 'withdraw'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ArrowUp className="h-4 w-4" />
              <span>Withdraw</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
                <button className="absolute right-3 top-3 text-cyan-400 text-sm hover:text-cyan-300">
                  <span onClick={setMaxAmount} className="cursor-pointer">MAX</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token</label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
              >
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.icon} {token.symbol} - Balance: {token.balance}
                  </option>
                ))}
              </select>
            </div>

            {amount && (
              <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {activeTab === 'deposit' ? 'You will receive:' : 'You will receive:'}
                  </span>
                  <span className="text-white">
                    {activeTab === 'deposit' 
                      ? `~${(parseFloat(amount || '0') / parseFloat(vaultStats.sharePrice)).toFixed(2)} shares`
                      : `~${(parseFloat(amount || '0') * parseFloat(vaultStats.sharePrice)).toFixed(2)} ${selectedToken}`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Exchange rate:</span>
                  <span className="text-white">1 share = ${vaultStats.sharePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gas fee estimate:</span>
                  <span className="text-white">~$5.50</span>
                </div>
              </div>
            )}

            <button
              onClick={handleTransaction}
              disabled={!amount || !wallet.isConnected || isProcessing || loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                !amount || !wallet.isConnected || isProcessing || loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : activeTab === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isProcessing || loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : !wallet.isConnected ? (
                'Connect Wallet'
              ) : (
                `${activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} ${amount ? amount + ' ' + selectedToken : ''}`
              )}
              }
            </button>
          </div>
        </div>

        {/* Strategy Breakdown */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6">Your Deposit Allocation</h3>
          <div className="space-y-4">
            {[
              { name: 'Compound USDC', allocation: 35, apy: 16.2, amount: '$1,755.85' },
              { name: 'Uniswap ETH-USDC LP', allocation: 25, apy: 24.8, amount: '$1,254.18' },
              { name: 'Aave USDT', allocation: 20, apy: 12.4, amount: '$1,003.34' },
              { name: 'Curve 3Pool', allocation: 15, apy: 8.9, amount: '$752.51' },
              { name: 'Balancer BAL-WETH', allocation: 5, apy: 31.2, amount: '$250.83' },
            ].map((strategy, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{strategy.name}</span>
                    <span className="text-cyan-400 font-medium">{strategy.amount}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">{strategy.allocation}% allocation</span>
                    <span className="text-sm text-green-400">{strategy.apy}% APY</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-lg border border-purple-500/30">
            <h4 className="font-medium text-purple-400 mb-2">AI Optimization Active</h4>
            <p className="text-sm text-gray-300">
              Your funds are automatically rebalanced using AI-driven strategies to maximize yield while managing risk.
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={vault.harvest}
                disabled={loading}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Harvesting...' : 'Harvest Rewards'}
              </button>
              <span className="text-xs text-gray-400">Claim accumulated yield</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}