import type { Telegram } from '@twa-dev/types';

declare global {
  export type HexString = `0x${string}`;

  export type ChainId = HexString;
  export type ChainIndex = number;
  export type AssetId = number;

  export type Address = string;
  export type PublicKey = HexString;
  export type Mnemonic = string;

  export type CallData = HexString;
  export type CallHash = HexString;
  export type Metadata = HexString;

  export type Currency = string;

  interface Window {
    Telegram?: Telegram;

    mercuryoWidget?: {
      run: (params: {
        widgetId: string;
        returnUrl: string;
        signature: string;
        host: HTMLElement;
        fixCurrency: boolean;
        type: 'buy' | 'sell';
        refundAddress: Address;
        address: Address;
        // Asset symbol
        currency: string;
        onStatusChange: (data: { status: 'paid' | 'new' }) => void;
        onSellTransferEnabled: (data: { address: string; amount: string }) => void;
      }) => void;
    };
  }
}

export {};
