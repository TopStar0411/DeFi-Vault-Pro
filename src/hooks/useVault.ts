import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WalletState } from "./useWallet";

// Vault ABI - ERC4626 standard functions
const VAULT_ABI = [
  // ERC4626 functions
  "function deposit(uint256 assets, address receiver) returns (uint256 shares)",
  "function mint(uint256 shares, address receiver) returns (uint256 assets)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256 assets)",
  "function totalAssets() view returns (uint256)",
  "function convertToShares(uint256 assets) view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function previewDeposit(uint256 assets) view returns (uint256)",
  "function previewMint(uint256 shares) view returns (uint256)",
  "function previewWithdraw(uint256 assets) view returns (uint256)",
  "function previewRedeem(uint256 shares) view returns (uint256)",
  "function maxDeposit(address) view returns (uint256)",
  "function maxMint(address) view returns (uint256)",
  "function maxWithdraw(address owner) view returns (uint256)",
  "function maxRedeem(address owner) view returns (uint256)",

  // ERC20 functions
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",

  // Vault specific functions
  "function getVaultInfo() view returns (uint256 totalAssetsValue, uint256 totalAllocatedValue, uint256 activeStrategiesCount)",
  "function getActiveStrategies() view returns (address[])",
  "function getStrategyInfo(address strategy) view returns (string name, uint256 allocatedAmount, bool isActive, uint256 performanceFee, uint256 lastHarvest)",
  "function totalAllocated() view returns (uint256)",
  "function performanceFeeRate() view returns (uint256)",
  "function managementFeeRate() view returns (uint256)",

  // Events
  "event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "event StrategyAdded(address indexed strategy, string name)",
  "event StrategyRemoved(address indexed strategy)",
  "event YieldGenerated(uint256 amount)",
  "event FeeCollected(uint256 amount)",
];

// Asset ABI (for underlying token)
const ASSET_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

export interface VaultInfo {
  totalAssets: string;
  totalAllocated: string;
  activeStrategiesCount: number;
  vaultTokenBalance: string;
  assetBalance: string;
  assetAllowance: string;
  maxDeposit: string;
  maxWithdraw: string;
  performanceFeeRate: string;
  managementFeeRate: string;
}

export interface StrategyInfo {
  address: string;
  name: string;
  allocatedAmount: string;
  isActive: boolean;
  performanceFee: string;
  lastHarvest: string;
}

export interface VaultState {
  vaultAddress: string;
  assetAddress: string;
  vaultInfo: VaultInfo | null;
  strategies: StrategyInfo[];
  loading: boolean;
  error: string | null;
  assetDecimals: number; // Add configurable decimals
}

export function useVault(wallet: WalletState) {
  const [vaultState, setVaultState] = useState<VaultState>({
    vaultAddress: "0x0000000000000000000000000000000000000000", // Replace with actual vault address
    assetAddress: "0x0000000000000000000000000000000000000000", // Replace with actual asset address
    vaultInfo: null,
    strategies: [],
    loading: false,
    error: null,
    assetDecimals: 6, // Default to 6 for USDC, but can be changed
  });

  const [loading, setLoading] = useState(false);

  // Get provider and signer
  const getProvider = useCallback(async () => {
    if (!window.ethereum) throw new Error("No wallet provider");
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const getSigner = useCallback(async () => {
    const provider = await getProvider();
    return provider.getSigner();
  }, [getProvider]);

  // Get asset decimals
  const getAssetDecimals = useCallback(
    async (assetAddress: string): Promise<number> => {
      try {
        const provider = await getProvider();
        const assetContract = new ethers.Contract(
          assetAddress,
          ASSET_ABI,
          provider
        );
        return await assetContract.decimals();
      } catch (error) {
        console.warn("Failed to get asset decimals, using default:", error);
        return 6; // Default to 6 decimals
      }
    },
    [getProvider]
  );

  // Fetch vault information
  const fetchVaultInfo = useCallback(async () => {
    if (
      !wallet.isConnected ||
      !vaultState.vaultAddress ||
      vaultState.vaultAddress === "0x0000000000000000000000000000000000000000"
    )
      return;

    setLoading(true);
    try {
      const provider = await getProvider();
      const vaultContract = new ethers.Contract(
        vaultState.vaultAddress,
        VAULT_ABI,
        provider
      );
      const assetContract = new ethers.Contract(
        vaultState.assetAddress,
        ASSET_ABI,
        provider
      );

      // Get asset decimals first
      const decimals = await getAssetDecimals(vaultState.assetAddress);

      // Get vault info
      const [
        vaultInfo,
        assetBalance,
        assetAllowance,
        maxDeposit,
        maxWithdraw,
        performanceFee,
        managementFee,
      ] = await Promise.all([
        vaultContract.getVaultInfo(),
        assetContract.balanceOf(wallet.address),
        assetContract.allowance(wallet.address, vaultState.vaultAddress),
        vaultContract.maxDeposit(wallet.address),
        vaultContract.maxWithdraw(wallet.address),
        vaultContract.performanceFeeRate(),
        vaultContract.managementFeeRate(),
      ]);

      // Get vault token balance
      const vaultTokenBalance = await vaultContract.balanceOf(wallet.address);

      // Get strategies
      const activeStrategies = await vaultContract.getActiveStrategies();
      const strategies = await Promise.all(
        activeStrategies.map(async (strategyAddress: string) => {
          try {
            const strategyInfo = await vaultContract.getStrategyInfo(
              strategyAddress
            );
            return {
              address: strategyAddress,
              name: strategyInfo[0],
              allocatedAmount: ethers.formatUnits(strategyInfo[1], decimals),
              isActive: strategyInfo[2],
              performanceFee: ethers.formatUnits(strategyInfo[3], 2), // Basis points
              lastHarvest: new Date(
                Number(strategyInfo[4]) * 1000
              ).toLocaleString(),
            };
          } catch (error) {
            console.error(
              `Failed to get strategy info for ${strategyAddress}:`,
              error
            );
            return {
              address: strategyAddress,
              name: "Unknown Strategy",
              allocatedAmount: "0",
              isActive: false,
              performanceFee: "0",
              lastHarvest: "Unknown",
            };
          }
        })
      );

      setVaultState((prev: VaultState) => ({
        ...prev,
        assetDecimals: decimals,
        vaultInfo: {
          totalAssets: ethers.formatUnits(vaultInfo[0], decimals),
          totalAllocated: ethers.formatUnits(vaultInfo[1], decimals),
          activeStrategiesCount: Number(vaultInfo[2]),
          vaultTokenBalance: ethers.formatUnits(vaultTokenBalance, decimals),
          assetBalance: ethers.formatUnits(assetBalance, decimals),
          assetAllowance: ethers.formatUnits(assetAllowance, decimals),
          maxDeposit: ethers.formatUnits(maxDeposit, decimals),
          maxWithdraw: ethers.formatUnits(maxWithdraw, decimals),
          performanceFeeRate: ethers.formatUnits(performanceFee, 2),
          managementFeeRate: ethers.formatUnits(managementFee, 2),
        },
        strategies,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to fetch vault info:", error);
      setVaultState((prev: VaultState) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to fetch vault info",
      }));
    } finally {
      setLoading(false);
    }
  }, [
    wallet.isConnected,
    wallet.address,
    vaultState.vaultAddress,
    vaultState.assetAddress,
    getProvider,
    getAssetDecimals,
  ]);

  // Deposit assets into vault
  const deposit = useCallback(
    async (amount: string) => {
      if (!wallet.isConnected || !vaultState.vaultAddress) {
        throw new Error("Wallet not connected or vault not configured");
      }

      setLoading(true);
      try {
        const signer = await getSigner();
        const vaultContract = new ethers.Contract(
          vaultState.vaultAddress,
          VAULT_ABI,
          signer
        );
        const assetContract = new ethers.Contract(
          vaultState.assetAddress,
          ASSET_ABI,
          signer
        );

        const amountWei = ethers.parseUnits(amount, vaultState.assetDecimals);

        // Check allowance
        const allowance = await assetContract.allowance(
          wallet.address,
          vaultState.vaultAddress
        );
        if (allowance < amountWei) {
          // Approve spending
          const approveTx = await assetContract.approve(
            vaultState.vaultAddress,
            amountWei
          );
          await approveTx.wait();
        }

        // Deposit
        const tx = await vaultContract.deposit(amountWei, wallet.address);
        await tx.wait();

        // Refresh vault info
        await fetchVaultInfo();

        return tx;
      } catch (error) {
        console.error("Deposit failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      wallet.isConnected,
      wallet.address,
      vaultState.vaultAddress,
      vaultState.assetAddress,
      getSigner,
      fetchVaultInfo,
      vaultState.assetDecimals,
    ]
  );

  // Withdraw assets from vault
  const withdraw = useCallback(
    async (amount: string) => {
      if (!wallet.isConnected || !vaultState.vaultAddress) {
        throw new Error("Wallet not connected or vault not configured");
      }

      setLoading(true);
      try {
        const signer = await getSigner();
        const vaultContract = new ethers.Contract(
          vaultState.vaultAddress,
          VAULT_ABI,
          signer
        );

        const amountWei = ethers.parseUnits(amount, vaultState.assetDecimals);

        // Withdraw
        const tx = await vaultContract.withdraw(
          amountWei,
          wallet.address,
          wallet.address
        );
        await tx.wait();

        // Refresh vault info
        await fetchVaultInfo();

        return tx;
      } catch (error) {
        console.error("Withdraw failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      wallet.isConnected,
      wallet.address,
      vaultState.vaultAddress,
      getSigner,
      fetchVaultInfo,
      vaultState.assetDecimals,
    ]
  );

  // Redeem vault tokens for assets
  const redeem = useCallback(
    async (shares: string) => {
      if (!wallet.isConnected || !vaultState.vaultAddress) {
        throw new Error("Wallet not connected or vault not configured");
      }

      setLoading(true);
      try {
        const signer = await getSigner();
        const vaultContract = new ethers.Contract(
          vaultState.vaultAddress,
          VAULT_ABI,
          signer
        );

        const sharesWei = ethers.parseUnits(shares, vaultState.assetDecimals);

        // Redeem
        const tx = await vaultContract.redeem(
          sharesWei,
          wallet.address,
          wallet.address
        );
        await tx.wait();

        // Refresh vault info
        await fetchVaultInfo();

        return tx;
      } catch (error) {
        console.error("Redeem failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      wallet.isConnected,
      wallet.address,
      vaultState.vaultAddress,
      getSigner,
      fetchVaultInfo,
      vaultState.assetDecimals,
    ]
  );

  // Preview functions
  const previewDeposit = useCallback(
    async (amount: string): Promise<string> => {
      if (!vaultState.vaultAddress) return "0";

      try {
        const provider = await getProvider();
        const vaultContract = new ethers.Contract(
          vaultState.vaultAddress,
          VAULT_ABI,
          provider
        );
        const amountWei = ethers.parseUnits(amount, vaultState.assetDecimals);
        const shares = await vaultContract.previewDeposit(amountWei);
        return ethers.formatUnits(shares, vaultState.assetDecimals);
      } catch (error) {
        console.error("Preview deposit failed:", error);
        return "0";
      }
    },
    [vaultState.vaultAddress, getProvider, vaultState.assetDecimals]
  );

  const previewWithdraw = useCallback(
    async (amount: string): Promise<string> => {
      if (!vaultState.vaultAddress) return "0";

      try {
        const provider = await getProvider();
        const vaultContract = new ethers.Contract(
          vaultState.vaultAddress,
          VAULT_ABI,
          provider
        );
        const amountWei = ethers.parseUnits(amount, vaultState.assetDecimals);
        const shares = await vaultContract.previewWithdraw(amountWei);
        return ethers.formatUnits(shares, vaultState.assetDecimals);
      } catch (error) {
        console.error("Preview withdraw failed:", error);
        return "0";
      }
    },
    [vaultState.vaultAddress, getProvider, vaultState.assetDecimals]
  );

  // Refresh vault data
  const refresh = useCallback(() => {
    fetchVaultInfo();
  }, [fetchVaultInfo]);

  // Set vault addresses
  const setVaultAddresses = useCallback(
    (vaultAddress: string, assetAddress: string) => {
      setVaultState((prev: VaultState) => ({
        ...prev,
        vaultAddress,
        assetAddress,
      }));
    },
    []
  );

  // Fetch vault info when wallet connects or addresses change
  useEffect(() => {
    if (
      wallet.isConnected &&
      vaultState.vaultAddress !== "0x0000000000000000000000000000000000000000"
    ) {
      fetchVaultInfo();
    }
  }, [wallet.isConnected, vaultState.vaultAddress, fetchVaultInfo]);

  return {
    vaultState,
    loading,
    deposit,
    withdraw,
    redeem,
    previewDeposit,
    previewWithdraw,
    refresh,
    setVaultAddresses,
  };
}
