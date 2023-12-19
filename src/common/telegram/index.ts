import { HexString } from '@common/types';
import { getTelegramBotApi } from './bot-api';
import { WebApp } from '@twa-dev/types';

export const completeOnboarding = async (publicKey: HexString, webApp: WebApp): Promise<void> => {
  const botApi = getTelegramBotApi(webApp);
  await botApi.submitWallet(publicKey);
};
