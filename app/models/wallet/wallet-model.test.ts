import secureLocalStorage from 'react-secure-storage';

import { type WebApp } from '@twa-dev/types';
import { allSettled, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';

import { telegramModel } from '@/models/telegram';
import { localStorageApi, telegramApi } from '@/shared/api';

import { walletModel } from './wallet-model';

vi.mock('./wallet', () => ({
  Wallet: vi.fn().mockImplementation((value: string) => ({
    getPublicKey: vi.fn().mockReturnValue(value),
    toAddress: vi.fn().mockReturnValue(value),
  })),
}));

describe('models/wallet/wallet-model', () => {
  // beforeEach(() => {
  //  jest.restoreAllMocks();
  // });

  test('should create wallet on walletCreated', async () => {
    const scope = fork();

    await allSettled(walletModel.input.walletCreated, { scope, params: 'publicKey' });
    const walletPK = scope.getState(walletModel.$wallet)?.getPublicKey();

    expect(walletPK).toEqual('publicKey');
  });

  test('should save mnemonic after walletCreated', async () => {
    const spyStoreName = vi.spyOn(telegramApi, 'getStoreName').mockReturnValue('store');
    const spySetItem = vi.spyOn(secureLocalStorage, 'setItem');

    const scope = fork({
      values: [[telegramModel._internal.$webApp, {}]],
    });

    await allSettled(walletModel.input.walletCreated, { scope, params: 'publicKey' });
    expect(spyStoreName).toHaveBeenCalled();
    expect(spySetItem).toHaveBeenCalled();
  });

  test('should construct wallet from Telegram CloudStorage mnemonic', async () => {
    vi.spyOn(telegramApi, 'getStoreName').mockReturnValue('remote_backup');
    vi.spyOn(localStorageApi, 'getItem').mockReturnValue('backup_date');
    vi.spyOn(telegramApi, 'getCloudStorageItem')
      .mockResolvedValueOnce('backup_date')
      .mockResolvedValueOnce('publicKey');

    const scope = fork();

    await allSettled(telegramModel._internal.$webApp, {
      scope,
      params: { initDataUnsafe: { user: { id: 'id' } } } as unknown as WebApp,
    });
    const walletPK = scope.getState(walletModel.$wallet)?.getPublicKey();

    expect(walletPK).toEqual('publicKey');
  });
});
