import { type WebApp } from '@twa-dev/types';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { readonly } from 'patronum';
import { $path } from 'remix-routes';

import { navigationModel } from '../navigation';
import { telegramModel } from '../telegram';

import { cryptoApi, localStorageApi, telegramApi } from '@/shared/api';
import { BACKUP_DATE, MNEMONIC_STORE } from '@/shared/helpers';

import { Wallet } from './wallet';

const walletCreated = createEvent<Mnemonic>();
const walletCleared = createEvent<{ clearRemote: boolean }>();
const mnemonicChanged = createEvent<{ mnemonic?: Mnemonic; password: string }>();

const $wallet = createStore<Wallet | null>(null);

const getWalletFx = createEffect(async (webApp: WebApp): Promise<Wallet | null> => {
  try {
    const mnemonic = await telegramApi.getItem(webApp, MNEMONIC_STORE);
    const backupCloudDate = await telegramApi.getItem(webApp, BACKUP_DATE);

    const backupStore = telegramApi.getStoreName(webApp, BACKUP_DATE);
    const backupLocalDate = localStorageApi.getItem(backupStore, '');

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

  return clearRemote ? telegramApi.removeItems(webApp, [MNEMONIC_STORE, BACKUP_DATE]) : Promise.resolve(true);
});

type SaveMnemonicParams = {
  webApp: WebApp;
  mnemonic?: Mnemonic;
  password: string;
};
const changeMnemonicFx = createEffect(async ({ webApp, mnemonic, password }: SaveMnemonicParams): Promise<void> => {
  const newMnemonic = mnemonic || (await telegramApi.getItem(webApp, MNEMONIC_STORE));

  const encryptedMnemonicWithSalt = cryptoApi.getEncryptedMnemonic(newMnemonic, password);
  const date = Date.now().toString();

  await telegramApi.setItem(webApp, MNEMONIC_STORE, encryptedMnemonicWithSalt);
  await telegramApi.setItem(webApp, BACKUP_DATE, date);

  const backupStore = telegramApi.getStoreName(webApp, BACKUP_DATE);
  localStorageApi.setItem(backupStore, date);
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
  clock: mnemonicChanged,
  source: telegramModel.$webApp,
  filter: (webApp: WebApp | null): webApp is WebApp => Boolean(webApp),
  fn: (webApp, { mnemonic, password }) => ({ webApp, mnemonic, password }),
  target: changeMnemonicFx,
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
    mnemonicChanged,
  },

  /* Internal API (tests only) */
  _internal: {
    $wallet: $wallet,
  },
};
