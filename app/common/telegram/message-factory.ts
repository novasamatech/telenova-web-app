import { type WebApp } from '@twa-dev/types';

import { type ITelegramMessageFactory } from './types';

export const getMessageFactory = (webApp: WebApp): ITelegramMessageFactory => {
  function prepareWalletCreationData(publicKey: HexString): string | null {
    if (webApp.initData && webApp.initDataUnsafe?.user?.id) {
      const data = {
        accountId: publicKey,
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
