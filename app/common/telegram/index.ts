import { type WebApp } from '@twa-dev/types';

import { type Wallet } from '@/models/wallet';

import { getTelegramBotApi } from './bot-api';
import { type TgLink } from './types';

export const completeOnboarding = async (webApp: WebApp, wallet: Wallet, baseUrl: string): Promise<void> => {
  try {
    const botApi = getTelegramBotApi(webApp, baseUrl);
    await botApi.submitWallet(wallet);
  } catch (error) {
    console.error(error);
  }
};

type CreateTgLinkParams = {
  botUrl: string;
  appName: string;
  amount: string;
  secret: string;
  chainIndex?: string | number;
  symbol: string;
};

export const createTgLink = ({ botUrl, appName, amount, secret, chainIndex, symbol }: CreateTgLinkParams): TgLink => {
  const text = `\nHey, I have sent you ${amount} ${symbol} as a Gift in the Telenova app, tap on the link to claim it!`;
  const url = new URL(`/${botUrl}/${appName}`, 'https://t.me');

  if (chainIndex === undefined || chainIndex === '') {
    url.searchParams.set('startapp', `${secret}_${symbol}`);
  } else {
    url.searchParams.set('startapp', `${secret}_${chainIndex}_${symbol}`);
  }

  return { url: url.toString(), text };
};

export const telegramShareLink = (webApp: WebApp, link: TgLink, callback?: () => void) => {
  const tgLink = `https://t.me/share/url?url=${encodeURIComponent(link.url)}&text=${encodeURIComponent(link.text)}`;

  // Application will be closed in Web version
  webApp.openTelegramLink(tgLink);
  callback?.();
};

export const telegramOpenLink = (link: string, webApp: WebApp) => {
  webApp.openLink(link);
  webApp.close();
};
