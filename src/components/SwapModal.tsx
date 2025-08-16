import React, { useState, useEffect } from 'react';
import { X, ArrowDown, Settings, RefreshCw } from 'lucide-react';
import { Token } from '../hooks/useTokens';
import { useSwap } from '../hooks/useSwap';
import { WalletState } from '../hooks/useWallet';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  wallet: WalletState;
}

export function SwapModal({ isOpen, onClose, tokens, wallet }: SwapModalProps) {
  const [fromToken, setFromToken] = useState<Token | null>(tokens[0] || null);
  const [toToken, setToToken] = useState<Token | null>(tokens[1] || null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  const { loading, quote, getQuote, executeSwap } = useSwap(wallet);

  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      getQuote(fromToken, toToken, fromAmount).then((quote) => {
        setToAmount(quote.outputAmount);
      }).catch(console.error);
    } else {
      setToAmount('');
    }
  }, [fromToken, toToken, fromAmount]);

  if (!isOpen) return null;

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !wallet.isConnected) return;

    try {
      const minAmountOut = (parseFloat(toAmount) * (1 - slippage / 100)).toString();
      await executeSwap(fromToken, toToken, fromAmount, minAmountOut);
      onClose();
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const setMaxAmount = () => {
    if (fromToken) {
      setFromAmount(fromToken.balance);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Swap Tokens</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-3">Slippage Tolerance</h3>
            <div className="flex space-x-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded text-sm ${
                    slippage === value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-gray-600 text-white text-sm rounded"
                step="0.1"
                min="0"
                max="50"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">
                Balance: {fromToken?.balance || '0'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={fromToken?.symbol || ''}
                onChange={(e) => {
                  const token = tokens.find(t => t.symbol === e.target.value);
                  setFromToken(token || null);
                }}
                className="bg-gray-600 text-white rounded-lg px-3 py-2 min-w-0 flex-shrink-0"
              >
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.icon} {token.symbol}
                  </option>
                ))}
              </select>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-white text-right text-lg outline-none"
                />
                <button
                  onClick={setMaxAmount}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-cyan-400 text-sm hover:text-cyan-300"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={switchTokens}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-sm text-gray-400">
                Balance: {toToken?.balance || '0'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={toToken?.symbol || ''}
                onChange={(e) => {
                  const token = tokens.find(t => t.symbol === e.target.value);
                  setToToken(token || null);
                }}
                className="bg-gray-600 text-white rounded-lg px-3 py-2 min-w-0 flex-shrink-0"
              >
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.icon} {token.symbol}
                  </option>
                ))}
              </select>
              <div className="flex-1">
                <input
                  type="text"
                  value={loading ? 'Loading...' : toAmount}
                  readOnly
                  placeholder="0.0"
                  className="w-full bg-transparent text-white text-right text-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quote Details */}
          {quote && (
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span className="text-white">{quote.priceImpact}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fee</span>
                <span className="text-white">{quote.fee} {fromToken?.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Route</span>
                <span className="text-white">{quote.route.join(' → ')}</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!wallet.isConnected || !fromAmount || !toAmount || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !wallet.isConnected || !fromAmount || !toAmount || loading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Swapping...</span>
              </div>
            ) : !wallet.isConnected ? (
              'Connect Wallet'
            ) : !fromAmount || !toAmount ? (
              'Enter Amount'
            ) : (
              `Swap ${fromToken?.symbol} for ${toToken?.symbol}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}