/* eslint-disable @typescript-eslint/ban-types */
import { type Telegram } from '@twa-dev/types';

import { type HexString } from '@/common/types';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

export interface ITelegram {
  completeOnboarding: (publicKey: HexString) => void;
}

export interface ITelegramMessageFactory {
  prepareWalletCreationData: (publicKey: HexString) => string | null;
}

export interface ITelegramBotApi {
  submitWallet: (publicKey: HexString) => Promise<void>;
}

// tg types.ts

/**
 * Available app events.
 */
export type EventType = 'themeChanged' | 'viewportChanged' | 'mainButtonClicked';

export type TgLink = {
  url: string;
  text: string;
};
