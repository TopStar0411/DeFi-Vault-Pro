import React from "react";
import { X, Wallet, Shield } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useWallet } from "../hooks/useWallet";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { open } = useWeb3Modal();
  const { wallet } = useWallet();

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      await open();
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

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
          <button
            onClick={handleConnect}
            className="w-full p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-all hover:bg-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Connect Wallet</h3>
                <p className="text-gray-400 text-sm">
                  Choose from MetaMask, WalletConnect, Coinbase Wallet, and more
                </p>
              </div>
            </div>
          </button>
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
