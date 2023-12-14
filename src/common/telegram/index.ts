import { HexString } from '@common/types';
import { WebApp } from './types';
import { getTelegramBotApi } from './bot-api';

export const completeOnboarding = async (publicKey: HexString, webApp: WebApp): Promise<void> => {
  const botApi = getTelegramBotApi(webApp);
  await botApi.submitWallet(publicKey);
};
