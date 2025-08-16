import { createConfig } from "wagmi";
import { mainnet, polygon, bsc } from "wagmi/chains";
import { http } from "viem";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";

// Get projectId from environment variable
export const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  "YOUR_WALLETCONNECT_PROJECT_ID";

const chains = [mainnet, polygon, bsc];

export const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
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
});

export { chains };
