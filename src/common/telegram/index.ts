import { HexString } from '@common/types';
import { WebApp } from './types';
import { getTelegramBotApi } from './bot-api';

export const completeOnboarding = async (publicKey: HexString, webApp: WebApp): Promise<void> => {
  const botApi = getTelegramBotApi(webApp);
  await botApi.submitWallet(publicKey);
};

export const navigateTranferById = (webApp: WebApp): void => {
  const url = encodeURIComponent('https://t.me/nova_wallet_dev_bot/novawallet_dev?pk=0x0000000000000000');
  const text = encodeURIComponent('Here is your gift');
  webApp.openTelegramLink(`http://t.me/share/url?url=${url}&text=${text}`);
};
