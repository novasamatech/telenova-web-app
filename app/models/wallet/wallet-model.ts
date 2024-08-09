import { type WebApp } from '@twa-dev/types';
import { createEffect, createStore, sample } from 'effector';
import { readonly } from 'patronum';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { telegramModel } from '../telegram/telegram-model';

import { telegramApi } from '@/shared/api';
import { BACKUP_DATE, PUBLIC_KEY_STORE } from '@/shared/helpers';
import { type Wallet } from '@/types/substrate';

const $wallet = createStore<Wallet | null>(null);

const getWalletFx = createEffect(async (webApp: WebApp): Promise<AccountId | undefined> => {
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

export const walletModel = {
  $wallet: readonly($wallet),

  /* Internal API (tests only) */
  _internal: {
    $wallet: $wallet,
  },
};
