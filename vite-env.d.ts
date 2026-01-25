/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALGORAND_NETWORK?: string;
  readonly VITE_ADMIN_WHITELIST?: string;
  readonly VITE_PLATFORM_WALLET?: string;
  readonly VITE_PINATA_API_KEY?: string;
  readonly VITE_PINATA_SECRET_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
