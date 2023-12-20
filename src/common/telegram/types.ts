/* eslint-disable @typescript-eslint/ban-types */
import { HexString } from '@common/types';
import { Telegram } from '@twa-dev/types';

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
