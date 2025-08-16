/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_1INCH_API_KEY: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
