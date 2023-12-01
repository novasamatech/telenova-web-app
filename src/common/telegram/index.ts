import { HexString } from '@common/types';
import { Telegram } from './types';
import { getMessageFactory } from './message-factory';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}
export const completeOnboarding = (publicKey: HexString) => {
  const telegram = window.Telegram;
  const messageFactory = getMessageFactory();
  const data = messageFactory.prepareWalletCreationData(publicKey);

  if (data && telegram) {
    // this working only if we start app from keyboard
    telegram.WebApp.sendData(data);
  } else {
    console.error('Response creation failed');
  }
};
