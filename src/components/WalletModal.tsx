import React from 'react';
import { X, Wallet, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { WalletState } from '../hooks/useWallet';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: (chainId: number) => void;
  isConnecting: boolean;
}

export function WalletModal({ 
  isOpen, 
  onClose, 
  wallet, 
  onConnect, 
  onDisconnect, 
  onSwitchNetwork,
  isConnecting 
}: WalletModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const networks = [
    { id: 1, name: 'Ethereum', icon: '⟠' },
    { id: 137, name: 'Polygon', icon: '⬟' },
    { id: 56, name: 'BSC', icon: '🟡' },
    { id: 42161, name: 'Arbitrum', icon: '🔵' }
  ];

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {wallet.isConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!wallet.isConnected ? (
          <div className="space-y-4">
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Wallet className="h-5 w-5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Don't have a wallet?</p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center justify-center space-x-1"
              >
                <span>Install MetaMask</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Account</span>
                <button
                  onClick={copyAddress}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-white font-mono">{formatAddress(wallet.address!)}</p>
              <p className="text-sm text-gray-400 mt-2">
                Balance: {parseFloat(wallet.balance).toFixed(4)} ETH
              </p>
            </div>

            {/* Network Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Switch Network</h3>
              <div className="grid grid-cols-2 gap-2">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => onSwitchNetwork(network.id)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      wallet.chainId === network.id
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{network.icon}</span>
                    <span className="text-sm">{network.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on Explorer</span>
              </button>
              <button
                onClick={onDisconnect}
                className="flex-1 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}