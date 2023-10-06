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


	if (telegram) {
		return {
			completeOnboarding: completeOnboarding(telegram)
		};
	} else {
		return null;
	}
};