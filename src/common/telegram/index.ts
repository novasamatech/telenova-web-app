import { type WebApp } from '@twa-dev/types';

import { type HexString } from '@/common/types';

import { getTelegramBotApi } from './bot-api';
import { type TgLink } from './types';

type CompleteOnboardingParams = {
  publicKey: HexString;
  webApp: WebApp;
  baseUrl: string;
};

export const completeOnboarding = async ({ publicKey, webApp, baseUrl }: CompleteOnboardingParams): Promise<void> => {
  try {
    const botApi = getTelegramBotApi(webApp, baseUrl);
    await botApi.submitWallet(publicKey);
  } catch (error) {
    console.error(error);
  }
};

type CreateTgLinkParams = {
  secret: string;
  symbol: string;
  amount: string;
  botUrl: string;
  appName: string;
};

export const createTgLink = ({ secret, symbol, amount, botUrl, appName }: CreateTgLinkParams): TgLink => {
  const text = `\nHey, I have sent you ${+amount} ${symbol} as a Gift in the Telenova app, tap on the link to claim it!`;
  const url = new URL(`/${botUrl}/${appName}`, 'https://t.me');
  url.searchParams.set('startapp', `${secret}_${symbol}`);

  return { url: url.toString(), text };
};

export const navigateTranferById = (webApp: WebApp, link: TgLink) => {
  webApp.openTelegramLink(
    `http://t.me/share/url?url=${encodeURIComponent(link.url)}&text=${encodeURIComponent(link.text)}`,
  );
  webApp.close();
};

export const openLink = (link: string, webApp: WebApp) => {
  webApp.openLink(link);
  webApp.close();
};

export const isOpenInWeb = (platform?: string): boolean => {
  if (!platform) return true;

  return ['web', 'weba', 'webk'].includes(platform);
};
