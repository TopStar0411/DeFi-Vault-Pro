import { ethers } from "ethers";

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface SwapQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: string;
  };
  priceImpact: string;
  fee: string;
}

export interface SwapTransaction {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
}

class SwapService {
  private baseUrl = "https://api.1inch.dev/swap/v6.0";
  private apiKey = import.meta.env.VITE_1INCH_API_KEY || "YOUR_1INCH_API_KEY";

  // Common token addresses
  private readonly TOKENS = {
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE",
    USDC: "0xA0b86a33E6441b8435b662303c0f098C8c8c0f8C",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  };

  async getQuote(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    chainId: number = 1
  ): Promise<SwapQuote> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${chainId}/quote?src=${fromTokenAddress}&dst=${toTokenAddress}&amount=${amount}&from=${fromAddress}&slippage=1`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        fromToken: data.fromToken,
        toToken: data.toToken,
        fromTokenAmount: data.fromTokenAmount,
        toTokenAmount: data.toTokenAmount,
        protocols: data.protocols,
        tx: data.tx,
        priceImpact: data.priceImpact,
        fee: data.fee,
      };
    } catch (error) {
      console.error("Failed to get quote:", error);
      // Fallback to mock quote for development
      return this.getMockQuote(
        fromTokenAddress,
        toTokenAddress,
        amount,
        fromAddress
      );
    }
  }

  async executeSwap(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1,
    chainId: number = 1
  ): Promise<SwapTransaction> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${chainId}/swap?src=${fromTokenAddress}&dst=${toTokenAddress}&amount=${amount}&from=${fromAddress}&slippage=${slippage}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tx;
    } catch (error) {
      console.error("Failed to execute swap:", error);
      throw error;
    }
  }

  async getTokens(chainId: number = 1): Promise<TokenInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${chainId}/tokens`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.statusText}`);
      }

      const data = await response.json();
      return Object.values(data.tokens);
    } catch (error) {
      console.error("Failed to get tokens:", error);
      // Return default tokens
      return [
        {
          address: this.TOKENS.ETH,
          symbol: "ETH",
          name: "Ethereum",
          decimals: 18,
        },
        {
          address: this.TOKENS.USDC,
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
        },
        {
          address: this.TOKENS.USDT,
          symbol: "USDT",
          name: "Tether USD",
          decimals: 6,
        },
        {
          address: this.TOKENS.DAI,
          symbol: "DAI",
          name: "Dai Stablecoin",
          decimals: 18,
        },
      ];
    }
  }

  private getMockQuote(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string
  ): SwapQuote {
    const fromToken = this.getMockToken(fromTokenAddress);
    const toToken = this.getMockToken(toTokenAddress);
    const amountNum = parseFloat(amount);
    const exchangeRate = 0.8; // Mock exchange rate
    const outputAmount = (amountNum * exchangeRate).toString();

    return {
      fromToken,
      toToken,
      fromTokenAmount: amount,
      toTokenAmount: outputAmount,
      protocols: [],
      tx: {
        from: fromAddress,
        to: "0x1111111254EEB25477B68fb85Ed929f73A960582", // 1inch router
        data: "0x",
        value: fromToken.symbol === "ETH" ? amount : "0",
        gasPrice: "20000000000",
        gas: "200000",
      },
      priceImpact: "0.1",
      fee: "0.003",
    };
  }

  private getMockToken(address: string): TokenInfo {
    const tokenMap: Record<string, TokenInfo> = {
      [this.TOKENS.ETH]: {
        address: this.TOKENS.ETH,
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
      },
      [this.TOKENS.USDC]: {
        address: this.TOKENS.USDC,
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      [this.TOKENS.USDT]: {
        address: this.TOKENS.USDT,
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
      },
      [this.TOKENS.DAI]: {
        address: this.TOKENS.DAI,
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
      },
    };

    return (
      tokenMap[address] || {
        address,
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 18,
      }
    );
  }
}

export const swapService = new SwapService();
