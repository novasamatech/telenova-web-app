import { HexString } from '@common/types';
import { WebApp } from './types';
import { getMessageFactory } from './message-factory';

export const completeOnboarding = (publicKey: HexString, webApp: WebApp | undefined) => {
  const messageFactory = getMessageFactory();
  const data = messageFactory.prepareWalletCreationData(publicKey);

  if (data && webApp) {
    // this's working only if we start app from keyboard
    webApp.sendData(data);
  } else {
    console.error('Response creation failed');
  }
};
