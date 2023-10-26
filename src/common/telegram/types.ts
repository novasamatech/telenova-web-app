import {HexString} from '@common/types';

export type WebApp = {
    sendData: (data: HexString) => void;
};

export type Telegram = {
    WebApp: WebApp;
};

export interface ITelegram {
    completeOnboarding: (publicKey: HexString) => void;
}

export interface ITelegramMessageFactory {
    prepareWalletCreationData: (publicKey: HexString) => HexString | null;
}