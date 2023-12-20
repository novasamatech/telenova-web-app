import { WebApp } from '@twa-dev/types';
import { HexString } from '../types';
import { getMessageFactory } from './message-factory';
import { ITelegramBotApi } from './types';

const SUBMIT_WALLET_PATH = '/submit/wallet';

export const getTelegramBotApi = (webApp: WebApp): ITelegramBotApi => {
  const messageFactory = getMessageFactory(webApp);

  async function submitWallet(publicKey: HexString): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_BOT_API_URL;

    console.info(`API base url ${baseUrl}`);

    if (!baseUrl) {
      return Promise.reject(new Error('Bot Api url is missing'));
    }

    const content = messageFactory.prepareWalletCreationData(publicKey);

    console.info(`Register wallet => ${content}`);

    const url = new URL(SUBMIT_WALLET_PATH, baseUrl);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: content,
    });

    if (!response.ok) {
      return Promise.reject(new Error(`Request failed with code ${response.status}`));
    }
  }

  return {
    submitWallet,
  };
};
