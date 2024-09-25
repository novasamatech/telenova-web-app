import type { TelegramLink } from '@/shared/api/telegram/types.ts';

import { TelegramApi } from './telegram-api';

const SUBMIT_WALLET_PATH = 'submit/wallet';

export const botApi = {
  submitPublicKey,
  createTelegramLink,
};

async function submitPublicKey(publicKey: PublicKey, baseUrl: string): Promise<void> {
  const content = getWalletCreationData(publicKey);

  console.info(`Register wallet => ${content}`);

  const url = new URL(SUBMIT_WALLET_PATH, baseUrl);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: content,
  });

  if (response.ok) return;

  throw new Error(`Submit Public key failed with code ${response.status}`);
}

function getWalletCreationData(publicKey: PublicKey): string | null {
  if (!TelegramApi.initData || !TelegramApi.initDataUnsafe.user?.id) return null;

  return JSON.stringify({
    publicKey,
    userId: TelegramApi.initDataUnsafe.user.id,
    auth: TelegramApi.initData,
  });
}

type CreateTgLinkParams = {
  botUrl: string;
  appName: string;
  amount: string;
  secret: string;
  chainIndex?: string | number;
  symbol: string;
};

function createTelegramLink({ botUrl, appName, amount, secret, chainIndex, symbol }: CreateTgLinkParams): TelegramLink {
  const text = `\nHey, I have sent you ${amount} ${symbol} as a Gift in the Telenova app, tap on the link to claim it!`;
  const url = new URL(`/${botUrl}/${appName}`, 'https://t.me');

  if (chainIndex === undefined || chainIndex === '') {
    url.searchParams.set('startapp', `${secret}_${symbol}`);
  } else {
    url.searchParams.set('startapp', `${secret}_${chainIndex}_${symbol}`);
  }

  return { url: url.toString(), text };
}
