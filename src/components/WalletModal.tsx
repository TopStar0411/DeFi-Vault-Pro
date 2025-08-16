import React from "react";
import { X, Wallet, Shield, Zap } from "lucide-react";
import { useWallet } from "../hooks/useWallet";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connectWallet, wallet } = useWallet();

  if (!isOpen) return null;

  const handleConnect = async (connectorId: string) => {
    try {
      await connectWallet(connectorId);
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const walletOptions = [
    {
      id: "metaMask",
      name: "MetaMask",
      description: "Connect with MetaMask wallet",
      icon: "🦊",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "walletConnect",
      name: "WalletConnect",
      description: "Connect with any wallet",
      icon: "🔗",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "coinbaseWallet",
      name: "Coinbase Wallet",
      description: "Connect with Coinbase Wallet",
      icon: "🪙",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {walletOptions.map((option) => {
            const connector = connectors.find((c) => c.id === option.id);
            if (!connector) return null;

            return (
              <button
                key={option.id}
                onClick={() => handleConnect(option.id)}
                disabled={!connector.ready}
                className={`w-full p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-all ${
                  !connector.ready
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center text-2xl`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">{option.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {option.description}
                    </p>
                  </div>
                  {!connector.ready && (
                    <span className="text-red-400 text-xs">Not Available</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Shield className="h-4 w-4" />
            <span>Your wallet connection is secure and private</span>
          </div>
        </div>

        {wallet.error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{wallet.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
