import { HexString } from '@common/types';

type WebApp = {
	sendData: (data: HexString) => void;
};

type Telegram = {
	WebApp: WebApp;
};

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

export interface ITelegram {
	completeOnboarding: (publicKey: HexString) => void;
}

export const getTelegram = (): ITelegram | null => {
	const telegram = window.Telegram;

	const completeOnboarding = (telegram: Telegram): (publicKey: HexString) => void => {
		return function(publicKey: HexString): void {
			return telegram.WebApp.sendData(publicKey)
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