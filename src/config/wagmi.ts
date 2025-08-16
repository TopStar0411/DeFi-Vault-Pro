import { createConfig, configureChains } from "wagmi";
import { mainnet, polygon, bsc } from "wagmi/chains";
import { publicProvider } from "@wagmi/core/providers/public";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";

// Get projectId from environment variable
export const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  "YOUR_WALLETCONNECT_PROJECT_ID";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, bsc],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "DeFi Swap App",
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains };
