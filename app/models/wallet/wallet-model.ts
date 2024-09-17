import secureLocalStorage from 'react-secure-storage';

import { type WebApp } from '@twa-dev/types';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { readonly } from 'patronum';
import { $path } from 'remix-routes';

import { navigationModel } from '../navigation';
import { telegramModel } from '../telegram';

import { localStorageApi, telegramApi } from '@/shared/api';
import { BACKUP_DATE, MNEMONIC_STORE } from '@/shared/helpers';

import { Wallet } from './wallet';

const walletCreated = createEvent<Mnemonic>();
const walletCleared = createEvent<{ clearRemote: boolean }>();

const $wallet = createStore<Wallet | null>(null);

const getWalletFx = createEffect(async (webApp: WebApp): Promise<Wallet | null> => {
  try {
    const backupStore = telegramApi.getStoreName(webApp, BACKUP_DATE);
    const backupLocalDate = localStorageApi.getItem(backupStore, '');
    const backupCloudDate = await telegramApi.getCloudStorageItem(webApp, BACKUP_DATE);
    const mnemonic = await telegramApi.getCloudStorageItem(webApp, MNEMONIC_STORE);

    if (backupCloudDate !== backupLocalDate) return null;

    return new Wallet(mnemonic);
  } catch {
    return null;
  }
});

const createWalletFx = createEffect((mnemonic: Mnemonic): Wallet => {
  return new Wallet(mnemonic);
});

type ClearParams = {
  webApp: WebApp;
  clearRemote: boolean;
};
const clearWalletFx = createEffect(({ webApp, clearRemote }: ClearParams): Promise<boolean> => {
  localStorageApi.clear();
  secureLocalStorage.clear();

  return clearRemote
    ? telegramApi.removeCloudStorageItems(webApp, [MNEMONIC_STORE, BACKUP_DATE])
    : Promise.resolve(true);
});

type SaveMnemonicParams = {
  webApp: WebApp;
  mnemonic: Mnemonic;
};
const mnemonicSavedFx = createEffect(({ webApp, mnemonic }: SaveMnemonicParams) => {
  const storeName = telegramApi.getStoreName(webApp, MNEMONIC_STORE);

  secureLocalStorage.setItem(storeName, mnemonic);
});

sample({
  clock: telegramModel.$webApp,
  filter: (webApp): webApp is WebApp => Boolean(webApp),
  target: getWalletFx,
});

sample({
  clock: getWalletFx.doneData,
  filter: (wallet): wallet is Wallet => Boolean(wallet),
  target: $wallet,
});

sample({
  clock: getWalletFx.doneData,
  fn: wallet => ({
    type: 'navigate' as const,
    to: wallet ? $path('/dashboard') : $path('/onboarding'),
    options: { replace: true },
  }),
  target: navigationModel.input.navigatorPushed,
});

sample({
  clock: walletCreated,
  target: createWalletFx,
});

sample({
  clock: createWalletFx.doneData,
  target: $wallet,
});

sample({
  clock: createWalletFx.done,
  source: telegramModel.$webApp,
  filter: (webApp: WebApp | null): webApp is WebApp => Boolean(webApp),
  fn: (webApp, { params: mnemonic }) => ({ webApp, mnemonic }),
  target: mnemonicSavedFx,
});

sample({
  clock: walletCleared,
  source: telegramModel.$webApp,
  filter: (webApp: WebApp | null): webApp is WebApp => Boolean(webApp),
  fn: (webApp, { clearRemote }) => ({ webApp, clearRemote }),
  target: clearWalletFx,
});

export const walletModel = {
  $wallet: readonly($wallet),

  input: {
    walletCreated,
    walletCleared,
  },

  /* Internal API (tests only) */
  _internal: {
    $wallet: $wallet,
  },
};
