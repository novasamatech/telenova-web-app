import { type Telegram } from '@twa-dev/types';

import { type Wallet } from '@/models/wallet';

declare global {
  interface Window {
    Telegram?: Telegram;
  }
}

export interface ITelegramMessageFactory {
  prepareWalletCreationData: (publicKey: HexString) => string | null;
}

export interface ITelegramBotApi {
  submitWallet: (wallet: Wallet) => Promise<void>;
}

export type TgLink = {
  url: string;
  text: string;
};
