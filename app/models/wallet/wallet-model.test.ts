import secureLocalStorage from 'react-secure-storage';

import { type WebApp } from '@twa-dev/types';
import { allSettled, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';

import { telegramModel } from '@/models/telegram';
import { cryptoApi, localStorageApi, telegramApi } from '@/shared/api';

import { walletModel } from './wallet-model';

vi.mock('./wallet', () => ({
  Wallet: vi.fn().mockImplementation((value: string) => ({
    getPublicKey: vi.fn().mockReturnValue(value),
    toAddress: vi.fn().mockReturnValue(value),
  })),
}));

describe('models/wallet/wallet-model', () => {
  test('should create wallet on walletCreated', async () => {
    const scope = fork();

    await allSettled(walletModel.input.walletCreated, { scope, params: 'publicKey' });
    const walletPK = scope.getState(walletModel.$wallet)?.getPublicKey();

    expect(walletPK).toEqual('publicKey');
  });

  test('should save mnemonic on mnemonicChanged', async () => {
    const spyTelegram = vi.spyOn(telegramApi, 'setItem').mockResolvedValue(true);
    const spyStorage = vi.spyOn(localStorageApi, 'setItem').mockReturnValue('ok');
    vi.spyOn(telegramApi, 'getStoreName').mockReturnValue('store');
    vi.spyOn(cryptoApi, 'getEncryptedMnemonic').mockReturnValue('encrypted');

    const scope = fork({
      values: [[telegramModel._internal.$webApp, {}]],
    });

    await allSettled(walletModel.input.mnemonicChanged, {
      scope,
      params: { mnemonic: 'mnemonic', password: 'password' },
    });
    expect(spyTelegram).toHaveBeenCalledTimes(2);
    expect(spyStorage).toHaveBeenCalled();
  });

  test('should construct wallet from Telegram CloudStorage mnemonic', async () => {
    vi.spyOn(secureLocalStorage, 'getItem').mockReturnValue('mnemonic');
    vi.spyOn(localStorageApi, 'getItem').mockReturnValue('backup_date');
    vi.spyOn(telegramApi, 'getItem').mockResolvedValue('backup_date');

    const scope = fork();

    await allSettled(telegramModel._internal.$webApp, {
      scope,
      params: { initDataUnsafe: { user: { id: 'id' } } } as unknown as WebApp,
    });
    const walletPK = scope.getState(walletModel.$wallet)?.getPublicKey();

    expect(walletPK).toEqual('mnemonic');
  });
});
