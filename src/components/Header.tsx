import React from "react";
import {
  Shield,
  BarChart3,
  Settings,
  Users,
  Lock,
  Wallet,
  ArrowLeftRight,
  ChevronDown,
} from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { UserRole } from "../App";
import { WalletState } from "../hooks/useWallet";
import { useWallet } from "../hooks/useWallet";

interface HeaderProps {
  activeTab: "dashboard" | "vault" | "admin" | "strategies" | "security";
  setActiveTab: (
    tab: "dashboard" | "vault" | "admin" | "strategies" | "security"
  ) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  wallet: WalletState;
  onOpenWallet: () => void;
  onOpenSwap: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  wallet,
  onOpenWallet,
  onOpenSwap,
}: HeaderProps) {
  const { disconnectWallet } = useWallet();
  const { open } = useWeb3Modal();
  const [showWalletMenu, setShowWalletMenu] = React.useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "vault", label: "Vault", icon: Shield },
    {
      id: "strategies",
      label: "Strategies",
      icon: Settings,
      requiresRole: ["admin", "strategist"],
    },
    { id: "admin", label: "Admin", icon: Users, requiresRole: ["admin"] },
    { id: "security", label: "Security", icon: Lock, requiresRole: ["admin"] },
  ] as const;

  const roleColors = {
    user: "bg-blue-600",
    strategist: "bg-purple-600",
    admin: "bg-red-600",
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return "Ethereum";
      case 137:
        return "Polygon";
      case 56:
        return "BSC";
      case 42161:
        return "Arbitrum";
      default:
        return "Unknown";
    }
  };

  const handleConnect = async () => {
    try {
      await open();
    } catch (error) {
      console.error("Failed to open wallet modal:", error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowWalletMenu(false);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
              DeFi Vault Pro
            </h1>
            <nav className="flex space-x-6">
              {navItems.map(({ id, label, icon: Icon, requiresRole }) => {
                const isVisible =
                  !requiresRole || requiresRole.includes(userRole);
                if (!isVisible) return null;

                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === id
                        ? "bg-cyan-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {wallet.isConnected && (
              <button
                onClick={onOpenSwap}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>Swap</span>
              </button>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className={`px-3 py-1 rounded-lg text-white text-sm ${roleColors[userRole]} border-none outline-none`}
              >
                <option value="user">User</option>
                <option value="strategist">Strategist</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {wallet.isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{formatAddress(wallet.address!)}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showWalletMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
                    <div className="p-4 space-y-3">
                      <div className="text-sm">
                        <div className="text-gray-400">Network</div>
                        <div className="text-white">
                          {getNetworkName(wallet.chainId)}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-400">Balance</div>
                        <div className="text-white">
                          {parseFloat(wallet.balance).toFixed(4)} ETH
                        </div>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <button
                          onClick={handleDisconnect}
                          className="w-full text-left text-red-400 hover:text-red-300 text-sm"
                        >
                          Disconnect Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
