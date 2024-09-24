import { type WebApp } from '@twa-dev/types';

import { type Wallet } from '@/models/wallet';

import { getMessageFactory } from './message-factory';
import { type ITelegramBotApi } from './types';

const SUBMIT_WALLET_PATH = 'submit/wallet';

export const getTelegramBotApi = (webApp: WebApp, baseUrl: string): ITelegramBotApi => {
  const messageFactory = getMessageFactory(webApp);

  async function submitWallet(wallet: Wallet): Promise<void> {
    console.info(`API base url ${baseUrl}`);

    if (!baseUrl) {
      return Promise.reject(new Error('Bot Api url is missing'));
    }

    const content = messageFactory.prepareWalletCreationData(wallet.getPublicKey());

    console.info(`Register wallet => ${content}`);

    const url = new URL(SUBMIT_WALLET_PATH, baseUrl);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
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
