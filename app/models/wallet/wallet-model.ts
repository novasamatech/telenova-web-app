import secureLocalStorage from 'react-secure-storage';

import { type WebApp } from '@twa-dev/types';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { readonly, spread } from 'patronum';
import { $path } from 'remix-routes';

import { hexToU8a, u8aToHex } from '@polkadot/util';
import { mnemonicToMiniSecret, sr25519PairFromSeed } from '@polkadot/util-crypto';

import { navigationModel } from '../navigation/navigation-model';
import { telegramModel } from '../telegram/telegram-model';

import { telegramApi } from '@/shared/api';
import { BACKUP_DATE, MNEMONIC_STORE, PUBLIC_KEY_STORE } from '@/shared/helpers';
import { type Wallet } from '@/types/substrate';

const walletCreated = createEvent<Mnemonic>();

const $wallet = createStore<Wallet | null>(null);

const getWalletFx = createEffect(async (webApp: WebApp): Promise<PublicKey | undefined> => {
  const publicKey = localStorage.getItem(telegramApi.getStoreName(webApp, PUBLIC_KEY_STORE));
  const backupLocalDate = localStorage.getItem(telegramApi.getStoreName(webApp, BACKUP_DATE));

  try {
    const backupCloudDate = await telegramApi.getCloudStorageItem(webApp, BACKUP_DATE);
    const isSameBackupDate = backupCloudDate === backupLocalDate;

    return isSameBackupDate && Boolean(publicKey) ? u8aToHex(hexToU8a(publicKey)) : undefined;
  } catch {
    return undefined;
  }
});

const walletCreatedFx = createEffect((mnemonic: Mnemonic): PublicKey => {
  const seed = mnemonicToMiniSecret(mnemonic);
  const keypair = sr25519PairFromSeed(seed);

  return u8aToHex(keypair.publicKey);
});

type SavePublicKeyParams = {
  webApp: WebApp;
  publicKey: PublicKey;
};
const publicKeySavedFx = createEffect(({ webApp, publicKey }: SavePublicKeyParams) => {
  localStorage.setItem(telegramApi.getStoreName(webApp, PUBLIC_KEY_STORE), publicKey);
});

type SaveMnemonicParams = {
  webApp: WebApp;
  mnemonic: Mnemonic;
};
const mnemonicSavedFx = createEffect(({ webApp, mnemonic }: SaveMnemonicParams) => {
  secureLocalStorage.setItem(telegramApi.getStoreName(webApp, MNEMONIC_STORE), mnemonic);
});

sample({
  clock: telegramModel.$webApp,
  filter: (webApp): webApp is WebApp => Boolean(webApp),
  target: getWalletFx,
});

sample({
  clock: getWalletFx.doneData,
  fn: publicKey => ({ publicKey }),
  target: $wallet,
});

sample({
  clock: getWalletFx.doneData,
  fn: publicKey => ({
    type: 'navigate' as const,
    to: publicKey ? $path('/dashboard') : $path('/onboarding'),
    options: { replace: true },
  }),
  target: navigationModel.input.navigatorPushed,
});

sample({
  clock: walletCreated,
  target: walletCreatedFx,
});

sample({
  clock: walletCreatedFx.done,
  source: telegramModel.$webApp,
  filter: (webApp: WebApp | null): webApp is WebApp => Boolean(webApp),
  fn: (webApp, { result: publicKey, params: mnemonic }) => ({
    savePublicKey: { webApp, publicKey },
    saveMnemonic: { webApp, mnemonic },
  }),
  target: spread({
    savePublicKey: publicKeySavedFx,
    saveMnemonic: mnemonicSavedFx,
  }),
});

export const walletModel = {
  $wallet: readonly($wallet),

  input: {
    walletCreated,
  },

  /* Internal API (tests only) */
  _internal: {
    $wallet: $wallet,
  },
};
