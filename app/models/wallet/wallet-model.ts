import { createEffect, createEvent, createStore, sample, split } from 'effector';
import { readonly } from 'patronum';
import { $path } from 'remix-routes';

import { navigationModel } from '../navigation';

import { TelegramApi, cryptoApi, localStorageApi } from '@/shared/api';
import { BACKUP_DATE, MNEMONIC_STORE } from '@/shared/helpers';

import { Wallet } from './wallet';

const walletCreated = createEvent<Mnemonic>();
const walletCleared = createEvent<{ clearRemote: boolean }>();
const walletRequested = createEvent();
const mnemonicChanged = createEvent<{ mnemonic?: Mnemonic; password: string }>();

const $wallet = createStore<Wallet | null>(null);

const requestWalletFx = createEffect(async (): Promise<Wallet | null> => {
  try {
    const mnemonicStore = TelegramApi.getStoreName(MNEMONIC_STORE);
    const mnemonic = localStorageApi.secureGetItem(mnemonicStore, '');
    const backupCloudDate = await TelegramApi.getItem(BACKUP_DATE);

    const backupStore = TelegramApi.getStoreName(BACKUP_DATE);
    const backupLocalDate = localStorageApi.getItem(backupStore, '').toString();

    if (!mnemonic || backupCloudDate !== backupLocalDate) return null;

    return new Wallet(mnemonic);
  } catch {
    return null;
  }
});

const createWalletFx = createEffect((mnemonic: Mnemonic): Wallet => {
  return new Wallet(mnemonic);
});

const clearWalletFx = createEffect((clearRemote: boolean): Promise<boolean> => {
  localStorageApi.clear();

  return clearRemote ? TelegramApi.removeItems([MNEMONIC_STORE, BACKUP_DATE]) : Promise.resolve(true);
});

const requestMnemonicFx = createEffect((): Promise<Mnemonic> => {
  return TelegramApi.getItem(MNEMONIC_STORE);
});

type SaveMnemonicParams = {
  mnemonic?: Mnemonic;
  password: string;
};
const changeMnemonicFx = createEffect(async ({ mnemonic, password }: SaveMnemonicParams): Promise<void> => {
  const newMnemonic = mnemonic || localStorageApi.secureGetItem(MNEMONIC_STORE, '');

  const encryptedMnemonicWithSalt = cryptoApi.getEncryptedMnemonic(newMnemonic, password);
  const date = Date.now().toString();

  await TelegramApi.setItem(MNEMONIC_STORE, encryptedMnemonicWithSalt);
  await TelegramApi.setItem(BACKUP_DATE, date);

  const backupStore = TelegramApi.getStoreName(BACKUP_DATE);
  localStorageApi.setItem(backupStore, date);
});

const backupMnemonicFx = createEffect((mnemonic: Mnemonic) => {
  const mnemonicStore = TelegramApi.getStoreName(MNEMONIC_STORE);

  localStorageApi.secureSetItem(mnemonicStore, mnemonic);
});

sample({
  clock: walletRequested,
  target: requestWalletFx,
});

split({
  source: requestWalletFx.doneData,
  match: wallet => {
    return wallet ? 'init' : 'fallback';
  },
  cases: {
    init: $wallet,
    fallback: requestMnemonicFx,
  },
});

sample({
  clock: requestWalletFx.doneData,
  filter: (wallet): wallet is Wallet => Boolean(wallet),
  fn: () => ({
    type: 'navigate' as const,
    to: $path('/dashboard'),
    options: { replace: true },
  }),
  target: navigationModel.input.navigatorPushed,
});

sample({
  clock: requestMnemonicFx.doneData,
  fn: mnemonic => ({
    type: 'navigate' as const,
    to: $path('/onboarding/restore'),
    options: { replace: true, state: { mnemonic } },
  }),
  target: navigationModel.input.navigatorPushed,
});

sample({
  clock: requestMnemonicFx.failData,
  fn: () => ({
    type: 'navigate' as const,
    to: $path('/onboarding/start'),
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
  fn: ({ params: mnemonic }) => mnemonic,
  target: backupMnemonicFx,
});

sample({
  clock: mnemonicChanged,
  fn: ({ mnemonic, password }) => ({ mnemonic, password }),
  target: changeMnemonicFx,
});

sample({
  clock: walletCleared,
  fn: ({ clearRemote }) => clearRemote,
  target: clearWalletFx,
});

export const walletModel = {
  $wallet: readonly($wallet),

  input: {
    walletCreated,
    walletCleared,
    walletRequested,
    mnemonicChanged,
  },

  /* Internal API (tests only) */
  _internal: {
    $wallet: $wallet,
  },
};
