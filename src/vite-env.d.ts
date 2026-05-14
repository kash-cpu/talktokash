/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY: string;
  readonly VITE_BRAND_EMAIL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        metadata?: Record<string, unknown>;
        callback: (resp: { reference: string; status?: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}
export {};
