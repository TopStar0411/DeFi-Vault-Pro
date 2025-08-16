import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Web3Modal } from "@web3modal/wagmi/react";
import { config, projectId } from "./config/wagmi";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Web3Modal projectId={projectId} />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
