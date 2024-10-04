export interface ITelegramMessageFactory {
  prepareWalletCreationData: (publicKey: HexString) => string | null;
}

export interface ITelegramBotApi {
  submitPublicKey: (publicKey: HexString) => Promise<void>;
}

export type TelegramLink = {
  url: string;
  text: string;
};
