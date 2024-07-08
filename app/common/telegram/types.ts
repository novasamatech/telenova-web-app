import type { Telegram } from '@twa-dev/types';

import { type HexString } from '@/common/types';

declare global {
  interface Window {
    Telegram?: Telegram;
  }
}

export interface ITelegramMessageFactory {
  prepareWalletCreationData: (publicKey: HexString) => string | null;
}

export interface ITelegramBotApi {
  submitWallet: (publicKey: HexString) => Promise<void>;
}

export type TgLink = {
  url: string;
  text: string;
};
