import { allSettled, fork } from 'effector';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { BN_ZERO } from '@polkadot/util';

import { networkModel } from '@/models/network';
import { TelegramApi, balancesFactory, localStorageApi } from '@/shared/api';
import { type Gift } from '@/types/substrate';

import { giftsModel } from './gifts-model';

describe('models/gifts/gifts-model', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('should request local gifts on giftsRequested', async () => {
    vi.spyOn(TelegramApi, 'getStoreName').mockReturnValue('store');
    vi.spyOn(localStorageApi, 'getItem').mockReturnValue([
      { chainId: '0x01', assetId: 1 },
      { chainId: '0x02', assetId: 2 },
    ]);

    const scope = fork({});

    await allSettled(giftsModel.input.giftsRequested, { scope });

    expect(scope.getState(giftsModel._internal.$giftsMap)).toEqual({
      '0x01': [{ chainId: '0x01', asset: { assetId: 1 }, status: 'Unclaimed' }],
      '0x02': [{ chainId: '0x02', asset: { assetId: 2 }, status: 'Unclaimed' }],
    });
  });

  test('should have claimedGifts and unclaimedGifts', async () => {
    const giftsMock = {
      '0x01': [{ chainId: '0x01', asset: { assetId: 1 }, status: 'Claimed' }],
      '0x02': [{ chainId: '0x02', asset: { assetId: 2 }, status: 'Unclaimed' }],
    } as unknown as Record<ChainId, Gift[]>;

    const scope = fork({
      values: [
        [
          networkModel._internal.$chains,
          {
            '0x01': { chainId: '0x01', assets: [{ assetId: 1 }] },
            '0x02': { chainId: '0x02', assets: [{ assetId: 2 }] },
          },
        ],
      ],
    });

    await allSettled(giftsModel._internal.$giftsMap, { scope, params: giftsMock });

    expect(scope.getState(giftsModel.$claimedGifts)).toEqual(giftsMock['0x01']);
    expect(scope.getState(giftsModel.$unclaimedGifts)).toEqual(giftsMock['0x02']);
  });

  test('should update giftsMap on connectionChanged', async () => {
    const giftsMock = {
      '0x01': [{ chainId: '0x01', asset: { assetId: 1 }, address: '555', status: 'Unclaimed' }],
      '0x02': [{ chainId: '0x02', asset: { assetId: 2 }, address: '666', status: 'Unclaimed' }],
    };

    vi.spyOn(balancesFactory, 'createService').mockReturnValue({
      subscribeBalance: vi.fn(),
      getFreeBalance: vi.fn(),
      getFreeBalances: vi.fn().mockResolvedValue([BN_ZERO]),
      getExistentialDeposit: vi.fn(),
    });

    const scope = fork({
      values: [
        [giftsModel._internal.$giftsMap, giftsMock],
        [networkModel._internal.$assets, { '0x01': { 1: { assetId: 1 } } }],
        [
          networkModel._internal.$connections,
          {
            '0x01': {
              api: { genesisHash: { toHex: () => '0x01' } },
              status: 'connected',
            },
          },
        ],
      ],
    });

    await allSettled(networkModel.output.connectionChanged, {
      scope,
      params: { chainId: '0x01', status: 'connected' },
    });

    expect(scope.getState(giftsModel._internal.$giftsMap)).toEqual({
      ...giftsMock,
      '0x01': [{ ...giftsMock['0x01'][0], status: 'Claimed' }],
    });
  });

  test('should update giftsMap on init chains', async () => {
    const giftsMock = {
      '0x01': [{ chainId: '0x01', asset: { assetId: 1 }, address: '555', status: 'Unclaimed' }],
      '0x02': [{ chainId: '0x02', asset: { assetId: 2 }, address: '666', status: 'Unclaimed' }],
    } as unknown as Record<ChainId, Gift[]>;

    vi.spyOn(balancesFactory, 'createService').mockReturnValue({
      subscribeBalance: vi.fn(),
      getFreeBalance: vi.fn(),
      getFreeBalances: vi.fn().mockResolvedValue([BN_ZERO]),
      getExistentialDeposit: vi.fn(),
    });

    const scope = fork({
      values: [
        [networkModel._internal.$assets, { '0x01': { 1: { assetId: 1 } } }],
        [
          networkModel._internal.$connections,
          {
            '0x01': {
              api: { genesisHash: { toHex: () => '0x01' } },
              status: 'connected',
            },
          },
        ],
      ],
    });

    await allSettled(giftsModel._internal.$giftsMap, { scope, params: giftsMock });

    expect(scope.getState(giftsModel._internal.$giftsMap)).toEqual({
      ...giftsMock,
      '0x01': [{ ...giftsMock['0x01'][0], status: 'Claimed' }],
    });
  });
});
