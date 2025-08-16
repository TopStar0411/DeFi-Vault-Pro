import React, { useState, useEffect } from "react";
import {
  Shield,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Settings,
} from "lucide-react";
import { WalletState } from "../hooks/useWallet";
import { Token } from "../hooks/useTokens";
import { useVault, VaultInfo, StrategyInfo } from "../hooks/useVault";

interface VaultInterfaceProps {
  wallet: WalletState;
  tokens: Token[];
  vault: ReturnType<typeof useVault>;
}

export function VaultInterface({ wallet, tokens, vault }: VaultInterfaceProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [redeemShares, setRedeemShares] = useState("");
  const [previewShares, setPreviewShares] = useState("");
  const [previewAssets, setPreviewAssets] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "info">(
    "deposit"
  );

  const {
    vaultState,
    loading,
    deposit,
    withdraw,
    redeem,
    previewDeposit,
    previewWithdraw,
    refresh,
  } = vault;

  // Preview deposit shares when amount changes
  useEffect(() => {
    if (depositAmount && parseFloat(depositAmount) > 0) {
      previewDeposit(depositAmount).then(setPreviewShares).catch(console.error);
    } else {
      setPreviewShares("");
    }
  }, [depositAmount, previewDeposit]);

  // Preview withdraw shares when amount changes
  useEffect(() => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      previewWithdraw(withdrawAmount)
        .then(setPreviewAssets)
        .catch(console.error);
    } else {
      setPreviewAssets("");
    }
  }, [withdrawAmount, previewWithdraw]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;

    try {
      await deposit(depositAmount);
      setDepositAmount("");
      setPreviewShares("");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    try {
      await withdraw(withdrawAmount);
      setWithdrawAmount("");
      setPreviewAssets("");
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  const handleRedeem = async () => {
    if (!redeemShares || parseFloat(redeemShares) <= 0) return;

    try {
      await redeem(redeemShares);
      setRedeemShares("");
    } catch (error) {
      console.error("Redeem failed:", error);
    }
  };

  const setMaxDeposit = () => {
    if (vaultState.vaultInfo) {
      setDepositAmount(vaultState.vaultInfo.assetBalance);
    }
  };

  const setMaxWithdraw = () => {
    if (vaultState.vaultInfo) {
      setWithdrawAmount(vaultState.vaultInfo.maxWithdraw);
    }
  };

  const setMaxRedeem = () => {
    if (vaultState.vaultInfo) {
      setRedeemShares(vaultState.vaultInfo.vaultTokenBalance);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-20">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-300 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400">Connect your wallet to access the vault</p>
      </div>
    );
  }

  if (!vaultState.vaultInfo) {
    return (
      <div className="text-center py-20">
        <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-semibold text-gray-300 mb-2">
          Loading Vault
        </h2>
        <p className="text-gray-400">Fetching vault information...</p>
      </div>
    );
  }

  const vaultInfo = vaultState.vaultInfo;

  // Add error handling for invalid numbers
  const formatNumber = (value: string, decimals: number = 2): string => {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return "0.00";
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
    } catch {
      return "0.00";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">DeFi Vault Pro</h1>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Vault Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-gray-400 text-sm">Total Assets</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${formatNumber(vaultInfo.totalAssets)}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Your Position</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${formatNumber(vaultInfo.vaultTokenBalance)}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Active Strategies</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {vaultInfo.activeStrategiesCount}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-400 text-sm">Performance Fee</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatNumber(vaultInfo.performanceFeeRate)}%
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {vaultState.error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{vaultState.error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Actions */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "deposit"
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "withdraw"
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                Withdraw
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "info"
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                Info
              </button>
            </div>

            {/* Deposit Tab */}
            {activeTab === "deposit" && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      Amount to Deposit
                    </span>
                    <span className="text-sm text-gray-400">
                      Balance: {parseFloat(vaultInfo.assetBalance).toFixed(2)}{" "}
                      USDC
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-gray-600 text-white rounded-lg px-3 py-2 outline-none"
                    />
                    <button
                      onClick={setMaxDeposit}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  {previewShares && (
                    <p className="text-sm text-gray-400 mt-2">
                      You will receive: {parseFloat(previewShares).toFixed(6)}{" "}
                      vUSDC
                    </p>
                  )}
                </div>

                <button
                  onClick={handleDeposit}
                  disabled={
                    !depositAmount || parseFloat(depositAmount) <= 0 || loading
                  }
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Depositing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Deposit USDC</span>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === "withdraw" && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      Amount to Withdraw
                    </span>
                    <span className="text-sm text-gray-400">
                      Available: {parseFloat(vaultInfo.maxWithdraw).toFixed(2)}{" "}
                      USDC
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-gray-600 text-white rounded-lg px-3 py-2 outline-none"
                    />
                    <button
                      onClick={setMaxWithdraw}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  {previewAssets && (
                    <p className="text-sm text-gray-400 mt-2">
                      You will burn: {parseFloat(previewAssets).toFixed(6)}{" "}
                      vUSDC
                    </p>
                  )}
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0 ||
                    loading
                  }
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Withdrawing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Withdraw USDC</span>
                    </div>
                  )}
                </button>

                {/* Redeem Section */}
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Redeem vUSDC
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        vUSDC to Redeem
                      </span>
                      <span className="text-sm text-gray-400">
                        Balance:{" "}
                        {parseFloat(vaultInfo.vaultTokenBalance).toFixed(6)}{" "}
                        vUSDC
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={redeemShares}
                        onChange={(e) => setRedeemShares(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 bg-gray-600 text-white rounded-lg px-3 py-2 outline-none"
                      />
                      <button
                        onClick={setMaxRedeem}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleRedeem}
                    disabled={
                      !redeemShares || parseFloat(redeemShares) <= 0 || loading
                    }
                    className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                  >
                    {loading ? "Redeeming..." : "Redeem vUSDC"}
                  </button>
                </div>
              </div>
            )}

            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Vault Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Assets:</span>
                      <span className="text-white">
                        ${parseFloat(vaultInfo.totalAssets).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Allocated:</span>
                      <span className="text-white">
                        ${parseFloat(vaultInfo.totalAllocated).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Performance Fee:</span>
                      <span className="text-white">
                        {vaultInfo.performanceFeeRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Management Fee:</span>
                      <span className="text-white">
                        {vaultInfo.managementFeeRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Your Position
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">vUSDC Balance:</span>
                      <span className="text-white">
                        {parseFloat(vaultInfo.vaultTokenBalance).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">USDC Balance:</span>
                      <span className="text-white">
                        {parseFloat(vaultInfo.assetBalance).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Withdraw:</span>
                      <span className="text-white">
                        {parseFloat(vaultInfo.maxWithdraw).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Strategies */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Active Strategies
          </h2>

          {vaultState.strategies.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">No active strategies</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vaultState.strategies.map((strategy: StrategyInfo) => (
                <div
                  key={strategy.address}
                  className="bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">
                      {strategy.name}
                    </h3>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        strategy.isActive ? "bg-green-400" : "bg-red-400"
                      }`}
                    ></div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Allocated:</span>
                      <span className="text-white">
                        ${parseFloat(strategy.allocatedAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Performance Fee:</span>
                      <span className="text-white">
                        {strategy.performanceFee}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Harvest:</span>
                      <span className="text-white text-xs">
                        {strategy.lastHarvest}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
