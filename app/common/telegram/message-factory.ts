import { type WebApp } from '@twa-dev/types';

import { type ITelegramMessageFactory } from './types';

export const getMessageFactory = (webApp: WebApp): ITelegramMessageFactory => {
  function prepareWalletCreationData(publicKey: PublicKey): string | null {
    if (!webApp.initData || !webApp.initDataUnsafe?.user?.id) return null;

    return JSON.stringify({
      publicKey,
      userId: webApp.initDataUnsafe.user.id,
      auth: webApp.initData,
    });
  }

  return {
    prepareWalletCreationData,
  };
};
