import secureLocalStorage from 'react-secure-storage';

import { allSettled, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';

import { TelegramApi, cryptoApi, localStorageApi } from '@/shared/api';

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
    const spyTelegram = vi.spyOn(TelegramApi, 'setItem').mockResolvedValue(true);
    const spyStorage = vi.spyOn(localStorageApi, 'setItem').mockReturnValue('ok');
    vi.spyOn(TelegramApi, 'getStoreName').mockReturnValue('store');
    vi.spyOn(cryptoApi, 'getEncryptedMnemonic').mockReturnValue('encrypted');

    const scope = fork();

    await allSettled(walletModel.input.mnemonicChanged, {
      scope,
      params: { mnemonic: 'mnemonic', password: 'password' },
    });
    expect(spyTelegram).toHaveBeenCalledTimes(2);
    expect(spyStorage).toHaveBeenCalled();
  });

  test('should construct wallet from localStorage mnemonic', async () => {
    vi.spyOn(secureLocalStorage, 'getItem').mockReturnValue('mnemonic');
    vi.spyOn(localStorageApi, 'getItem').mockReturnValue('backup_date');
    vi.spyOn(TelegramApi, 'getItem').mockResolvedValue('backup_date');

    const scope = fork();

    await allSettled(walletModel.input.walletRequested, { scope });
    const walletPK = scope.getState(walletModel.$wallet)?.getPublicKey();

    expect(walletPK).toEqual('mnemonic');
  });
});