import { WebApp } from '@twa-dev/types';
import { HexString } from '@common/types';
import { getTelegramBotApi } from './bot-api';
import { TgLink } from './types';

export const completeOnboarding = async (publicKey: HexString, webApp: WebApp): Promise<void> => {
  try {
    const botApi = getTelegramBotApi(webApp);
    await botApi.submitWallet(publicKey);
  } catch (error) {
    console.error(error);
  }
};

export const createTgLink = (secret: string, symbol: string): TgLink => {
  const url = `https://t.me/${process.env.NEXT_PUBLIC_BOT_ADDRESS}/${process.env.NEXT_PUBLIC_WEB_APP_ADDRESS}?startapp=${secret}_${symbol}`;
  const text = 'Here is your gift';

  return { url, text };
};

export const navigateTranferById = (webApp: WebApp, link: TgLink): void => {
  webApp.openTelegramLink(
    `http://t.me/share/url?url=${encodeURIComponent(link.url)}&text=${encodeURIComponent(link.text)}`,
  );
  webApp.close();
};
