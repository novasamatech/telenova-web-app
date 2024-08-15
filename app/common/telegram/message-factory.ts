import { type WebApp } from '@twa-dev/types';

import { type ITelegramMessageFactory } from './types';

export const getMessageFactory = (webApp: WebApp): ITelegramMessageFactory => {
  function prepareWalletCreationData(publicKey: PublicKey): string | null {
    if (webApp.initData && webApp.initDataUnsafe?.user?.id) {
      const data = {
        publicKey,
        userId: webApp.initDataUnsafe.user.id,
        auth: webApp.initData,
      };

      return JSON.stringify(data);
    } else {
      return null;
    }
  }

  return {
    prepareWalletCreationData,
  };
};
