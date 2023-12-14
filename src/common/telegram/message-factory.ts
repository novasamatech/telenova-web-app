import { HexString } from '@common/types';
import { WebApp, ITelegramMessageFactory } from './types';

type WalletCreationData = {
  accountId: HexString;
  userId: number;
  auth: string;
};

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
