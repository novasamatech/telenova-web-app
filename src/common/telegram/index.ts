import { HexString } from '@common/types';
import { ITelegram, Telegram } from './types';
import { getMessageFactory } from './message-factory';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

export const getTelegram = (): ITelegram | null => {
	const telegram = window.Telegram;

	console.log(`Telegram params: ${JSON.stringify(telegram)}`);

	const completeOnboarding = (telegram: Telegram): (publicKey: HexString) => void => {
		return function(publicKey: HexString): void {
			const messageFactory = getMessageFactory();
			const data = messageFactory.prepareWalletCreationData(publicKey);

			if (data) {
				return telegram.WebApp.sendData(data);
			} else {
				console.error("Response creation failed");
			}
		}
	};

	const completeGiftQuery = (telegram: Telegram): (secretKey: HexString) => void => {
		return function(secretKey: HexString): void {
			const messageFactory = getMessageFactory();
			const query = messageFactory.prepareGiftCreationData(secretKey);

			if (query) {
				return telegram.WebApp.switchInlineQuery(query);
			} else {
				console.error("Response creation failed");
			}
		}
	};


	if (telegram) {
		return {
			completeOnboarding: completeOnboarding(telegram),
			completeGiftQuery: completeGiftQuery(telegram)
		};
	} else {
		return null;
	}
};