import { HexString } from '@common/types';

export type WebApp = {
	sendData: (data: HexString) => void;
	switchInlineQuery: (query: string) => void;
};

export type Telegram = {
	WebApp: WebApp;
};

export interface ITelegram {
	completeOnboarding: (publicKey: HexString) => void;
	completeGiftQuery: (secretKey: HexString) => void;
}

export interface ITelegramMessageFactory {
	prepareWalletCreationData: (publicKey: HexString) => HexString | null;
	prepareGiftCreationData: (secretKey: HexString) => string | null;
}